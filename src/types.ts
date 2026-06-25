export interface HCP {
  id: string;
  name: string;
  title: string; // e.g. M.D., F.A.C.C.
  specialty: string; // e.g. Cardiology, Oncology, General Medicine
  hospital: string;
  address: string;
  phone: string;
  email: string;
  segment: 'A' | 'B' | 'C'; // Pharma Intelligence-style target segmentation (A = High potential, C = Low)
  status: 'Target' | 'Active' | 'Inactive';
  territory: string; // e.g. Northeast-1, Northwest-2
  bestContactTime: string; // e.g. "Wednesdays 9:00 AM - 11:00 AM"
  notes: string;
  avatar?: string;
  totalCalls: number;
  lastVisitDate?: string;
}

export interface Product {
  id: string;
  name: string;
  therapeuticArea: string; // e.g. Cardiovascular, Oncology, Neurology
  indication: string; // What it treats
  dosage: string;
  description: string;
  slides: DetailingSlide[];
}

export interface DetailingSlide {
  id: string;
  title: string;
  subtitle?: string;
  content: string; // markdown or plain text explaining clinical benefit
  graphicType: 'chart' | 'table' | 'bullet_points';
  graphicData: any; // data for rendering with Recharts or similar
  keyTakeaway: string;
}

export interface CallLog {
  id: string;
  hcpId: string;
  hcpName: string;
  date: string;
  type: 'Face-to-Face' | 'Remote Video' | 'Phone' | 'Email';
  durationMinutes: number;
  productsDetailed: {
    productId: string;
    productName: string;
    engagementScore: number; // 1-10 slider or rating
    doctorFeedback: 'Highly Interested' | 'Neutral' | 'Skeptical' | 'Needs clinical data';
  }[];
  samplesDropped: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
  signatureData?: string; // Base64 signature for compliance
  discussionNotes: string;
  followUpRequired: boolean;
  followUpNotes?: string;
}

export interface SampleInventory {
  id: string;
  productId: string;
  productName: string;
  availableQty: number;
  allocatedQty: number;
  batchNumber: string;
  expiryDate: string;
}

export interface MedicalEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  speakerName: string;
  speakerSpecialty: string;
  status: 'Planned' | 'Completed' | 'Cancelled';
  budget: number;
  actualCost?: number;
  attendees: {
    hcpId: string;
    hcpName: string;
    specialty: string;
    status: 'Invited' | 'Confirmed' | 'Attended' | 'No Show';
  }[];
  description: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
  meta?: any; // any extra data like generated code, suggestions, etc.
}
