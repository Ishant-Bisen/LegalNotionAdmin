export interface ApiConsultationDocument {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export function mapApiConsultationToConsultation(doc: ApiConsultationDocument): Consultation {
  return {
    id: doc._id,
    name: doc.name ?? '',
    email: doc.email ?? '',
    phone: doc.phone ?? '',
    message: doc.message ?? '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
