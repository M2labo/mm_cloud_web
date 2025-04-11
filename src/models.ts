// models.ts
export interface Field {
  id: number;
  name: string;
  groupId: number;
  area?: number;
  url?: string;
  polygon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mover {
  id: number;
  name: string;
  groupId: number;
  rtkId?: number;
  macAddress?: string;
  topic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  groupId: number;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
  fields: Field[];
  movers: Mover[];
}
