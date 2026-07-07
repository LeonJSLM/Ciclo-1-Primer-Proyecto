import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocket, WebSocketServer } from "ws";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize GoogleGenAI
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized successfully on server.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
  }
} else {
  console.warn("GEMINI_API_KEY not found in environment. AI Assistant will operate in fallback mode.");
}

// Memory database for Real-Time & Multi-User synchronization
interface ServerUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  exp: number;
  isOnline: boolean;
  eliteMember: boolean;
}

interface ServerGroup {
  id: string;
  name: string;
  purpose: string;
  rules: string;
  members: string[]; // Emails
  messages: any[];
  delegatedTasks: any[];
}

interface ServerFriendship {
  user1: string; // Email
  user2: string; // Email
  status: 'pending' | 'accepted';
}

const db = {
  users: new Map<string, ServerUser>(), // email -> ServerUser
  groups: new Map<string, ServerGroup>(), // groupId -> ServerGroup
  friendships: [] as ServerFriendship[],
  tasks: new Map<string, any>(), // taskId -> Task
};

// Seed some virtual default companion users so the ranking and adding friends is extremely engaging immediately!
const seedVirtualUsers = () => {
  const seeds = [
    { id: 'v1', name: 'Sofía Rodríguez', email: 'sofia.academico@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', exp: 450, isOnline: true, eliteMember: true },
    { id: 'v2', name: 'Mateo González', email: 'mateo.estudiante@gmail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', exp: 320, isOnline: true, eliteMember: false },
    { id: 'v3', name: 'Valeria Sinergia', email: 'valeria.estudios@gmail.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', exp: 580, isOnline: true, eliteMember: true },
    { id: 'v4', name: 'Tomás Deberes', email: 'tomas.deberes@gmail.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', exp: 210, isOnline: false, eliteMember: false }
  ];
  for (const s of seeds) {
    db.users.set(s.email.toLowerCase(), s);
  }
};
seedVirtualUsers();

// API endpoint to interact with Cognitive Assistant
app.post("/api/gemini/chat", async (req, res) => {
  const { prompt, filesContext, tasksContext, history } = req.body;

  if (!ai) {
    return res.status(200).json({
      text: "🤖 **[Modo Demostración sin API Key]**\n\nNo se ha configurado la variable `GEMINI_API_KEY` en los secretos de la aplicación. Sin embargo, para fines prácticos, te recomiendo estructurar tus resúmenes mediante mapas conceptuales, pomodoros de 25 minutos y realizar simulacros de examen de tus tareas registradas."
    });
  }

  try {
    let filesSummary = "";
    if (filesContext && filesContext.length > 0) {
      filesSummary = "DOCUMENTOS CARGADOS POR EL USUARIO:\n" + filesContext.map((f: any) => `- Archivo: ${f.name} (Tipo: ${f.type})\nContenido o resumen: ${f.content || "Sin pre-análisis de texto"}`).join("\n") + "\n\n";
    }

    let tasksSummary = "";
    if (tasksContext && tasksContext.length > 0) {
      tasksSummary = "TAREAS Y ENTREGAS PROGRAMADAS:\n" + tasksContext.map((t: any) => `- Tarea: "${t.title}" (${t.type}), Entrega: ${t.deadline}, Descripción: ${t.description || "N/A"}, Colaborativo: ${t.collaborative ? "Sí" : "No"}, Completada: ${t.completed ? "Sí" : "No"}`).join("\n") + "\n\n";
    }

    const systemInstruction = `Eres el "Asistente de IA Cognitivo", un tutor académico ultra-inteligente, empático y motivador.
Tu objetivo es dar consejos prácticos de estudio, responder dudas y ayudar al estudiante basándote ESTRICTAMENTE en la información académica que ha cargado.

A continuación se detalla el contexto del estudiante actual. Utiliza esta información con prioridad para responder de forma personalizada:
${filesSummary}
${tasksSummary}

Si la pregunta del usuario no tiene relación con los archivos o tareas, respóndele amablemente pero integra consejos sobre cómo usar la plataforma para optimizar su estudio. Responde siempre en español de forma elegante y limpia, formateado con markdown enriquecido. No utilices jerga técnica innecesaria del servidor.`;

    // Format chat history
    const contents = history ? history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    })) : [];

    // Append current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Error al procesar la consulta con Inteligencia Artificial." });
  }
});

// API endpoint for Motor de Evaluación IA (Elite Exclusive)
app.post("/api/gemini/evaluate", async (req, res) => {
  const { filesContext, topicName } = req.body;

  if (!ai) {
    // Return custom mock data for demo if key is missing so the quiz is fully operational!
    return res.status(200).json({
      questions: [
        { id: "q1", question: `¿Cuál es el enfoque principal de estudio en la materia de ${topicName || "Matemáticas"}?`, options: ["Cálculo analítico y abstracto", "Análisis literario medieval", "Diseño gráfico vectorial", "Estructuración botánica"], correctAnswer: 0, explanation: "El estudio de las matemáticas se fundamenta en el cálculo y desarrollo numérico abstracto." },
        { id: "q2", question: "Para optimizar la retención de información compleja, ¿qué método es más recomendado?", options: ["Método de repetición espaciada", "Memorización pasiva de última hora", "Copiar textualmente todo el libro", "Estudiar con música a volumen alto"], correctAnswer: 0, explanation: "La repetición espaciada refuerza las conexiones neuronales en el tiempo." },
        { id: "q3", question: "¿Qué representa la Sinergia Académica?", options: ["Trabajo individual y aislado", "Colaboración conjunta multiplicando resultados", "Ignorar las entregas grupales", "Suscripción premium pasiva"], correctAnswer: 1, explanation: "Sinergia significa que el total es mayor que la suma de sus partes." },
        { id: "q4", question: "Al realizar trabajos colaborativos, ¿cuál es el paso inicial clave?", options: ["Asignar roles y tareas con fechas límite claras", "Discutir sin documentar acuerdos", "Entregar al final sin revisiones previas", "Hacer todo el trabajo individualmente"], correctAnswer: 0, explanation: "Establecer roles claros e hitos permite que los equipos fluyan sin fricción." },
        { id: "q5", question: "¿Cuál es la ventaja de la Membresía Élite académica?", options: ["Acceder al Motor de Evaluación IA y cuestionarios interactivos", "Descargar juegos en línea", "Evitar hacer los exámenes reales", "Acceso al menú de configuración básico"], correctAnswer: 0, explanation: "La Membresía Élite provee automatización de cuestionarios por IA cognitivos." },
        { id: "q6", question: "¿Qué periodo abarca una notificación oportuna en el Panel Central?", options: ["Una semana antes de la entrega", "Dos horas antes de expirar", "Un mes después", "Solo el mismo día"], correctAnswer: 0, explanation: "Las alertas se activan hasta una semana antes para planificar adecuadamente." },
        { id: "q7", question: "¿Qué técnica de manejo de tiempo propone un timer de 25 minutos con 5 de descanso?", options: ["Técnica Pomodoro", "Método Agile", "Sinergia del tiempo", "Regla de los 3 tercios"], correctAnswer: 0, explanation: "Desarrollada por Francesco Cirillo, optimiza la concentración en bloques." },
        { id: "q8", question: "¿Qué se debe cargar en Trayectoria Académica para que la IA responda preguntas?", options: ["Documentos reales (PDFs, imágenes de galería)", "Canciones populares", "Enlaces de redes sociales", "Solo el nombre de las materias"], correctAnswer: 0, explanation: "Cargar materiales de estudio reales dota al asistente de un contexto preciso." },
        { id: "q9", question: "Dentro del Podio de Honor, ¿qué indicador define tu posición competitiva?", options: ["Los puntos de experiencia (EXP) acumulados", "El costo de la membresía", "El número de amigos agregados", "La cantidad de cursos eliminados"], correctAnswer: 0, explanation: "Los puntos de EXP reflejan tu avance en los cuestionarios interactivos." },
        { id: "q10", question: "Si una entrega es Urgente, ¿en qué lista de la Agenda debe colocarse?", options: ["Lista de entregas urgentes destacada", "Lista general de amigos", "Historial de tareas", "Borradores archivados"], correctAnswer: 0, explanation: "La Agenda de Deberes separa visualmente tareas individuales, grupales y urgentes." }
      ]
    });
  }

  try {
    let contextText = "El usuario desea un cuestionario sobre el tema: " + (topicName || "Temas Académicos Generales") + ".\n";
    if (filesContext && filesContext.length > 0) {
      contextText += "DOCUMENTOS RELACIONADOS:\n" + filesContext.map((f: any) => `- ${f.name}: ${f.content || "Foco temático del documento"}`).join("\n");
    }

    const prompt = `Por favor, analiza el contexto provisto y genera exactamente 10 preguntas de opción múltiple altamente educativas, retadoras y bien estructuradas para evaluar al estudiante.
Cada pregunta debe tener exactamente 4 opciones de respuesta y señalar claramente cuál es el índice de la opción correcta (número de 0 a 3) y una breve explicación científica o académica de por qué esa es la respuesta correcta.

CONTEXTO DE ESTUDIO DEL ESTUDIANTE:
${contextText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres el motor evaluador de exámenes interactivos de Sinergia Académica. Devuelve un listado con estructura JSON idéntica a la solicitada, que contenga exactamente 10 elementos. Evita cualquier prefijo explicativo antes del JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: "Lista de exactamente 10 preguntas de evaluación interactiva.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Cuatro opciones de respuesta."
                  },
                  correctAnswer: {
                    type: Type.INTEGER,
                    description: "Índice de la respuesta correcta (0, 1, 2 o 3)."
                  },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Evaluation Generation Error:", error);
    res.status(500).json({ error: error.message || "Error al generar la evaluación por Inteligencia Artificial." });
  }
});

// API endpoint to divide and delegate homework among classmates using AI
app.post("/api/gemini/divide-task", async (req, res) => {
  const { taskTitle, taskDescription, taskSpecs, members, fileContent } = req.body;

  if (!ai) {
    // Fallback mode if GEMINI_API_KEY is not defined
    const count = members && members.length ? members.length : 1;
    const list = members && members.length ? members : ["Estudiante"];
    const divisions = list.map((m: string, i: number) => {
      const partNum = i + 1;
      return {
        assigneeName: m,
        title: `Parte ${partNum}: Investigación e Integración del tema: ${taskTitle || 'Tarea Colectiva'}`,
        description: `Responsabilidad principal: Analizar el archivo adjunto, realizar la síntesis del subtema asignado (${partNum} de ${count}) y preparar la presentación del equipo de forma conjunta.`
      };
    });
    return res.json({ divisions });
  }

  try {
    const list = members && members.length ? members : ["Estudiante Principal"];
    const prompt = `Por favor, analiza la siguiente tarea y divídela de forma equitativa y balanceada entre los siguientes integrantes:
INTEGRANTES: ${list.join(", ")}

DATOS DE LA TAREA:
- Título: ${taskTitle || "Sin título"}
- Descripción: ${taskDescription || "Sin descripción"}
- Especificaciones: ${taskSpecs || "Sin especificaciones"}
${fileContent ? `- Información del archivo de tarea: ${fileContent}` : ""}

Divide el trabajo en exactamente ${list.length} sub-tareas (una para cada integrante). Sé muy claro y creativo con el título y las instrucciones asignadas a cada persona para que cooperen de forma óptima.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres un consultor de IA especializado en metodologías de aprendizaje colaborativo. Devuelve una distribución clara y motivadora de responsabilidades académicas. Devuelve únicamente el objeto JSON solicitado con la propiedad 'divisions'. No incluyas explicaciones previas ni marcas markdown como ```json.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            divisions: {
              type: Type.ARRAY,
              description: "Array que contiene la asignación balanceada para cada miembro del grupo.",
              items: {
                type: Type.OBJECT,
                properties: {
                  assigneeName: { type: Type.STRING, description: "Nombre completo del integrante asignado." },
                  title: { type: Type.STRING, description: "Título corto de la sección o sub-tarea." },
                  description: { type: Type.STRING, description: "Instrucciones paso a paso sobre qué debe investigar o elaborar." }
                },
                required: ["assigneeName", "title", "description"]
              }
            }
          },
          required: ["divisions"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Task Division Error:", error);
    res.status(500).json({ error: error.message || "Error al repartir la tarea por Inteligencia Artificial." });
  }
});

// Build HTTP Server
const server = http.createServer(app);

// Build WebSocket Server shared on port 3000
const wss = new WebSocketServer({ server });

// Keep track of active connections
interface ClientSession {
  ws: WebSocket;
  userId: string;
  name: string;
  email: string;
}

const activeClients = new Map<WebSocket, ClientSession>();

wss.on("connection", (ws) => {
  console.log("New WebSocket client connected.");

  ws.on("message", (messageStr) => {
    try {
      const msg = JSON.parse(messageStr.toString());
      console.log("WS message received:", msg.type);

      switch (msg.type) {
        case 'init': {
          const { user } = msg;
          if (user) {
            const userEmail = user.email.toLowerCase();
            const session: ClientSession = {
              ws,
              userId: user.id,
              name: user.name,
              email: userEmail
            };
            activeClients.set(ws, session);

            // Register or update in database
            const existing = db.users.get(userEmail);
            db.users.set(userEmail, {
              id: user.id,
              name: user.name,
              email: userEmail,
              avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              exp: existing ? Math.max(existing.exp, user.exp) : user.exp,
              isOnline: true,
              eliteMember: user.eliteMember || false
            });

            console.log(`User ${user.name} (${userEmail}) initialized WebSocket session.`);

            // Broadcast updated online friends and rank to everyone
            broadcastRankingAndStatus();
          }
          break;
        }

        case 'friend_request': {
          const { fromUser, targetEmail } = msg;
          if (!fromUser || !targetEmail) break;

          const reqEmail = targetEmail.toLowerCase().trim();
          const senderEmail = fromUser.email.toLowerCase();

          // Check if user exists in db, otherwise create a simulated active companion for the email!
          let targetUser = db.users.get(reqEmail);
          if (!targetUser) {
            // Simulate creation of a companion dynamically if they enter a random student email!
            const simulatedName = reqEmail.split('@')[0].replace('.', ' ');
            const capitalizedName = simulatedName.charAt(0).toUpperCase() + simulatedName.slice(1);
            targetUser = {
              id: 'sim-' + Math.random().toString(36).substr(2, 5),
              name: capitalizedName || "Estudiante Compañero",
              email: reqEmail,
              avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*900000)}?w=150`,
              exp: 150 + Math.floor(Math.random() * 300),
              isOnline: true,
              eliteMember: Math.random() > 0.5
            };
            db.users.set(reqEmail, targetUser);
          }

          // Store friendship pending status
          const alreadyFriends = db.friendships.find(f => 
            (f.user1 === senderEmail && f.user2 === reqEmail) ||
            (f.user1 === reqEmail && f.user2 === senderEmail)
          );

          if (!alreadyFriends) {
            db.friendships.push({
              user1: senderEmail,
              user2: reqEmail,
              status: 'pending'
            });
          }

          // Find if target is online and send live notification
          let sentRealtime = false;
          for (const [clientWs, clientSession] of activeClients.entries()) {
            if (clientSession.email === reqEmail) {
              clientWs.send(JSON.stringify({
                type: 'notification_received',
                notification: {
                  id: 'nt-' + Date.now(),
                  text: `¡${fromUser.name} te ha enviado una solicitud de amistad académica!`,
                  type: 'friend_request',
                  timestamp: new Date().toISOString(),
                  read: false,
                  payload: { fromUser }
                }
              }));
              sentRealtime = true;
            }
          }

          // If target is simulated, automatically accept request in 5 seconds via a WebSocket event!
          if (targetUser.id.startsWith('sim-') || targetUser.id.startsWith('v')) {
            setTimeout(() => {
              // Accept friendship in database
              const fIndex = db.friendships.findIndex(f => 
                (f.user1 === senderEmail && f.user2 === reqEmail) ||
                (f.user1 === reqEmail && f.user2 === senderEmail)
              );
              if (fIndex > -1) {
                db.friendships[fIndex].status = 'accepted';
              } else {
                db.friendships.push({ user1: senderEmail, user2: reqEmail, status: 'accepted' });
              }

              // Send friend request accepted notification to sender
              for (const [clientWs, clientSession] of activeClients.entries()) {
                if (clientSession.email === senderEmail) {
                  clientWs.send(JSON.stringify({
                    type: 'friend_accepted',
                    friend: {
                      id: targetUser!.id,
                      name: targetUser!.name,
                      email: targetUser!.email,
                      status: 'accepted',
                      isOnline: targetUser!.isOnline
                    },
                    notification: {
                      id: 'nt-acc-' + Date.now(),
                      text: `¡${targetUser!.name} ha aceptado tu solicitud de amistad académica!`,
                      type: 'info',
                      timestamp: new Date().toISOString(),
                      read: false
                    }
                  }));
                }
              }
              broadcastRankingAndStatus();
            }, 3500);
          }

          // Reply confirmation to sender
          ws.send(JSON.stringify({
            type: 'request_sent_confirmation',
            message: `Solicitud enviada con éxito a ${targetUser.name}.`
          }));

          broadcastRankingAndStatus();
          break;
        }

        case 'friend_accept': {
          const { myEmail, friendEmail } = msg;
          if (!myEmail || !friendEmail) break;

          const me = myEmail.toLowerCase();
          const fEmail = friendEmail.toLowerCase();

          // Mark accepted in database
          const friendship = db.friendships.find(f => 
            (f.user1 === me && f.user2 === fEmail) ||
            (f.user1 === fEmail && f.user2 === me)
          );
          if (friendship) {
            friendship.status = 'accepted';
          } else {
            db.friendships.push({ user1: me, user2: fEmail, status: 'accepted' });
          }

          // Notify friend if they are online
          for (const [clientWs, clientSession] of activeClients.entries()) {
            if (clientSession.email === fEmail) {
              const meUser = db.users.get(me);
              clientWs.send(JSON.stringify({
                type: 'friend_accepted',
                friend: {
                  id: meUser?.id || 'u',
                  name: meUser?.name || 'Compañero',
                  email: me,
                  status: 'accepted',
                  isOnline: true
                },
                notification: {
                  id: 'nt-acc-' + Date.now(),
                  text: `¡${meUser?.name || 'Un compañero'} ha aceptado tu solicitud de amistad!`,
                  type: 'info',
                  timestamp: new Date().toISOString(),
                  read: false
                }
              }));
            }
          }

          broadcastRankingAndStatus();
          break;
        }

        case 'task_invite': {
          const { task, inviteeEmails } = msg;
          if (!task || !inviteeEmails) break;

          // Save task in server state
          db.tasks.set(task.id, task);

          // Broadcast task invitation notifications to online invitees
          inviteeEmails.forEach((email: string) => {
            const targetEmail = email.toLowerCase().trim();
            for (const [clientWs, clientSession] of activeClients.entries()) {
              if (clientSession.email === targetEmail) {
                clientWs.send(JSON.stringify({
                  type: 'notification_received',
                  notification: {
                    id: 'nt-t-' + Date.now() + Math.random().toString().substr(2, 3),
                    text: `Has sido invitado al trabajo colaborativo: "${task.title}"`,
                    type: 'task_invite',
                    timestamp: new Date().toISOString(),
                    read: false,
                    payload: { task }
                  }
                }));
              }
            }

            // If invitee is virtual, let them accept automatically after 4-6 seconds to show responsive interactions!
            const targetUser = db.users.get(targetEmail);
            if (targetUser && (targetUser.id.startsWith('sim-') || targetUser.id.startsWith('v'))) {
              setTimeout(() => {
                // Update task friend status in memory database
                const liveTask = db.tasks.get(task.id);
                if (liveTask) {
                  const friendObj = liveTask.assignedFriends.find((f: any) => f.email?.toLowerCase() === targetEmail || f.id === targetUser.id);
                  if (friendObj) {
                    friendObj.status = 'accepted';
                  }
                }

                // Notify sender/owner of acceptance
                for (const [clientWs, clientSession] of activeClients.entries()) {
                  if (clientSession.email === task.ownerEmail?.toLowerCase() || clientSession.userId === task.ownerId) {
                    clientWs.send(JSON.stringify({
                      type: 'task_invite_response',
                      taskId: task.id,
                      friendId: targetUser.id,
                      friendName: targetUser.name,
                      status: 'accepted',
                      notification: {
                        id: 'nt-t-acc-' + Date.now(),
                        text: `¡${targetUser.name} ha aceptado colaborar en la tarea "${task.title}"!`,
                        type: 'info',
                        timestamp: new Date().toISOString(),
                        read: false
                      }
                    }));
                  }
                }
              }, 4500);
            }
          });
          break;
        }

        case 'task_response': {
          const { taskId, userId, userEmail, userName, status, ownerId } = msg;
          const liveTask = db.tasks.get(taskId);
          if (liveTask) {
            const friendObj = liveTask.assignedFriends.find((f: any) => f.id === userId || f.email?.toLowerCase() === userEmail?.toLowerCase());
            if (friendObj) {
              friendObj.status = status;
            }
          }

          // Notify the task owner
          for (const [clientWs, clientSession] of activeClients.entries()) {
            if (clientSession.userId === ownerId) {
              clientWs.send(JSON.stringify({
                type: 'task_invite_response',
                taskId,
                friendId: userId,
                friendName: userName,
                status,
                notification: {
                  id: 'nt-tres-' + Date.now(),
                  text: `¡${userName} ha ${status === 'accepted' ? 'Aceptado' : 'Rechazado'} participar en la tarea!`,
                  type: 'info',
                  timestamp: new Date().toISOString(),
                  read: false
                }
              }));
            }
          }
          break;
        }

        case 'update_exp': {
          const { email, expAdded } = msg;
          if (!email) break;
          const userEmail = email.toLowerCase();
          const user = db.users.get(userEmail);
          if (user) {
            user.exp = (user.exp || 0) + expAdded;
            db.users.set(userEmail, user);
            console.log(`Updated EXP for ${user.name}: +${expAdded} (Total: ${user.exp})`);
            broadcastRankingAndStatus();
          }
          break;
        }

        case 'create_group': {
          const { group } = msg;
          if (group) {
            db.groups.set(group.id, {
              id: group.id,
              name: group.name,
              purpose: group.purpose,
              rules: group.rules,
              members: group.members.map((m: string) => m.toLowerCase()),
              messages: group.messages || [],
              delegatedTasks: group.delegatedTasks || []
            });
            // Broadcast group update to all members
            broadcastToGroup(group.id, {
              type: 'group_updated',
              group: db.groups.get(group.id)
            });
          }
          break;
        }

        case 'group_chat_msg': {
          const { groupId, message } = msg;
          const grp = db.groups.get(groupId);
          if (grp) {
            grp.messages.push(message);
            db.groups.set(groupId, grp);

            // Broadcast message to all active clients who are members of this group
            broadcastToGroup(groupId, {
              type: 'new_chat_message',
              groupId,
              message
            });

            // Simulate quick AI or helper dynamic comments in the group for more high-fidelity interactivity!
            if (message.text.toLowerCase().includes('ayuda') || message.text.toLowerCase().includes('deber')) {
              setTimeout(() => {
                const helperMsg = {
                  id: 'msg-helper-' + Date.now(),
                  senderId: 'v1', // Sofía
                  senderName: 'Sofía Rodríguez',
                  text: `Hola ${message.senderName}, ¡yo te ayudo! Estaba leyendo sobre ese tema ayer en los apuntes de la semana. ¿Qué parte se te complica?`,
                  timestamp: new Date().toISOString()
                };
                grp.messages.push(helperMsg);
                db.groups.set(groupId, grp);

                broadcastToGroup(groupId, {
                  type: 'new_chat_message',
                  groupId,
                  message: helperMsg
                });
              }, 2500);
            }
          }
          break;
        }

        case 'group_delegate_task': {
          const { groupId, task } = msg;
          const grp = db.groups.get(groupId);
          if (grp) {
            grp.delegatedTasks.push(task);
            db.groups.set(groupId, grp);

            // Broadcast to group members
            broadcastToGroup(groupId, {
              type: 'group_updated',
              group: grp,
              notification: {
                id: 'nt-del-' + Date.now(),
                text: `Nueva tarea delegada en grupo: "${task.title}" asignada a ${task.assigneeName}`,
                type: 'info',
                timestamp: new Date().toISOString(),
                read: false
              }
            });
          }
          break;
        }

        case 'group_delegate_status': {
          const { groupId, taskId, status } = msg;
          const grp = db.groups.get(groupId);
          if (grp) {
            const task = grp.delegatedTasks.find((t: any) => t.id === taskId);
            if (task) {
              task.status = status;
              db.groups.set(groupId, grp);

              broadcastToGroup(groupId, {
                type: 'group_updated',
                group: grp
              });
            }
          }
          break;
        }
      }
    } catch (err) {
      console.error("WS Message Error:", err);
    }
  });

  ws.on("close", () => {
    const session = activeClients.get(ws);
    if (session) {
      const user = db.users.get(session.email);
      if (user) {
        user.isOnline = false;
        db.users.set(session.email, user);
      }
      activeClients.delete(ws);
      console.log(`WebSocket session closed for ${session.name}.`);
      broadcastRankingAndStatus();
    }
  });
});

// Broadcast ranking, friends status, and online stats to all clients
function broadcastRankingAndStatus() {
  // Construct ranking array
  const allUsers = Array.from(db.users.values()).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    exp: u.exp,
    isOnline: Array.from(activeClients.values()).some(c => c.email === u.email) || u.id.startsWith('v') && u.isOnline,
    eliteMember: u.eliteMember
  })).sort((a, b) => b.exp - a.exp);

  for (const [clientWs, clientSession] of activeClients.entries()) {
    const myEmail = clientSession.email;
    const myUser = db.users.get(myEmail);

    // Get my friendships
    const myFriendships = db.friendships.filter(f => f.user1 === myEmail || f.user2 === myEmail);
    const myFriendsList = myFriendships.map(f => {
      const friendEmail = f.user1 === myEmail ? f.user2 : f.user1;
      const fUser = db.users.get(friendEmail);
      if (fUser) {
        return {
          id: fUser.id,
          name: fUser.name,
          email: fUser.email,
          avatar: fUser.avatar,
          status: f.status,
          exp: fUser.exp,
          isOnline: Array.from(activeClients.values()).some(c => c.email === friendEmail) || fUser.id.startsWith('v') && fUser.isOnline
        };
      }
      return null;
    }).filter(Boolean);

    clientWs.send(JSON.stringify({
      type: 'sync_state',
      ranking: allUsers,
      friends: myFriendsList,
      myUser: myUser ? {
        id: myUser.id,
        name: myUser.name,
        email: myUser.email,
        avatar: myUser.avatar,
        exp: myUser.exp,
        eliteMember: myUser.eliteMember
      } : null
    }));
  }
}

// Helper to broadcast to members of a group
function broadcastToGroup(groupId: string, payload: any) {
  const grp = db.groups.get(groupId);
  if (!grp) return;

  const payloadStr = JSON.stringify(payload);
  for (const [clientWs, clientSession] of activeClients.entries()) {
    if (grp.members.includes(clientSession.email)) {
      clientWs.send(payloadStr);
    }
  }
}

// Integrating Vite Dev Server / Static SPA Fallback
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static bundle from /dist.");
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully operational on port ${PORT}`);
  });
}

startServer();
