export interface Client {
  id: number;
  documento: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  empresaId: number;
}

export interface ClientPayload {
  documento: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
}
