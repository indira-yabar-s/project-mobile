export interface AssistantAnswer {
  respuesta: string;
  consultasRestantesHoy: number;
  fecha: string;
}

export interface AssistantHistoryEntry {
  id: number;
  pregunta: string;
  respuesta: string | null;
  exitosa: boolean;
  fecha: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  failed?: boolean;
}
