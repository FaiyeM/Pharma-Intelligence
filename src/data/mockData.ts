import { HCP, Product, CallLog, SampleInventory, MedicalEvent } from '../types';

export const INITIAL_HCPS: HCP[] = [
  {
    id: 'hcp-1',
    name: 'Dr. Evelyn Chen',
    title: 'M.D., F.A.C.C.',
    specialty: 'Cardiology',
    hospital: 'Metro Heart & Vascular Center',
    address: '450 Health Sciences Parkway, Suite 120, Boston, MA 02111',
    phone: '(617) 555-0143',
    email: 'evelyn.chen@metroheart.org',
    segment: 'A',
    status: 'Active',
    territory: 'Northeast-1',
    bestContactTime: 'Wednesdays 9:00 AM - 11:30 AM (Between surgeries)',
    notes: 'Key Opinion Leader (KOL). Highly interested in long-term clinical trial safety profiles and real-world outcomes data. Prefers head-to-head clinical trial data. Highly responsive to medical science liaison (MSL) follow-up.',
    totalCalls: 12,
    lastVisitDate: '2026-06-10',
  },
  {
    id: 'hcp-2',
    name: 'Dr. Marcus Vance',
    title: 'M.D., Ph.D.',
    specialty: 'Oncology',
    hospital: 'Beacon Hill Cancer Institute',
    address: '75 Pavilion Rd, Cancer Research Pavilion, Boston, MA 02116',
    phone: '(617) 555-0288',
    email: 'm.vance@beaconcancer.org',
    segment: 'A',
    status: 'Active',
    territory: 'Northeast-1',
    bestContactTime: 'Mondays and Tuesdays after 4:00 PM',
    notes: 'Pioneering researcher in targeted therapies. Very critical of incremental improvements; looking for significant progression-free survival (PFS) margins. Frequently speaks at national medical congresses.',
    totalCalls: 8,
    lastVisitDate: '2026-05-24',
  },
  {
    id: 'hcp-3',
    name: 'Dr. Sarah Goldstein',
    title: 'M.D.',
    specialty: 'Neurology',
    hospital: 'New England Neurological Clinic',
    address: '109 Beacon Street, Suite 4B, Boston, MA 02116',
    phone: '(617) 555-0197',
    email: 'sgoldstein@neneuro.com',
    segment: 'B',
    status: 'Active',
    territory: 'Northeast-1',
    bestContactTime: 'Thursdays 1:00 PM - 3:00 PM',
    notes: 'Focuses on patient compliance and ease of administration. Appreciates sample programs to evaluate patient tolerance before writing long-term prescriptions. Responsive to educational webinars.',
    totalCalls: 6,
    lastVisitDate: '2026-06-03',
  },
  {
    id: 'hcp-4',
    name: 'Dr. Robert Patel',
    title: 'M.D., F.A.C.P.',
    specialty: 'General Medicine',
    hospital: 'Bay State Family Practice',
    address: '1200 Commonwealth Avenue, Boston, MA 02215',
    phone: '(617) 555-0210',
    email: 'rpatel@baystatefamily.com',
    segment: 'B',
    status: 'Active',
    territory: 'Northeast-2',
    bestContactTime: 'Fridays 11:30 AM - 1:00 PM (During lunch block)',
    notes: 'High patient volume clinic. Focuses on pricing, co-pay assistance, insurance coverage, and patient affordability. Appreciates visual materials that can be quickly shared with patients.',
    totalCalls: 14,
    lastVisitDate: '2026-06-18',
  },
  {
    id: 'hcp-5',
    name: 'Dr. Amanda Ross',
    title: 'M.D.',
    specialty: 'Cardiology',
    hospital: 'Cambridge Cardiology Group',
    address: '80 Main St, Suite 201, Cambridge, MA 02139',
    phone: '(617) 555-0322',
    email: 'aross@cambridgecardio.com',
    segment: 'C',
    status: 'Target',
    territory: 'Northeast-2',
    bestContactTime: 'Tuesdays 8:00 AM - 9:30 AM',
    notes: 'Conservative prescriber. Prefers older, generic, established treatments. Requires substantial peer-reviewed guidelines backing before shifting prescribing habits.',
    totalCalls: 2,
    lastVisitDate: '2026-04-12',
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'CardioGard (Elinorip)',
    therapeuticArea: 'Cardiovascular',
    indication: 'Reduction of major adverse cardiovascular events (MACE) in patients with chronic coronary disease and elevated risk profile.',
    dosage: '10mg once daily, orally with or without food.',
    description: 'A novel selective platelet inhibitor with low bleeding risk and superior outcome outcomes demonstrated in the 15,000-patient EPIC-4 clinical trial.',
    slides: [
      {
        id: 'slide-1-1',
        title: 'EPIC-4 Trial: MACE Reduction Over 36 Months',
        subtitle: 'CardioGard 10mg vs. Standard of Care Plaque Inhibitor',
        content: 'Clinical endpoints were analyzed over a 3-year period across 15,000 high-risk patients. CardioGard demonstrated a **24% relative risk reduction** in MACE (CV death, MI, or stroke) compared to the active control, with a highly statistically significant p-value of **p < 0.001**.',
        graphicType: 'chart',
        graphicData: [
          { month: 0, standardCare: 0.0, cardioGard: 0.0 },
          { month: 6, standardCare: 1.8, cardioGard: 1.2 },
          { month: 12, standardCare: 3.9, cardioGard: 2.8 },
          { month: 18, standardCare: 5.6, cardioGard: 4.1 },
          { month: 24, standardCare: 7.8, cardioGard: 5.4 },
          { month: 30, standardCare: 9.4, cardioGard: 6.8 },
          { month: 36, standardCare: 11.2, cardioGard: 8.5 }
        ],
        keyTakeaway: '24% relative risk reduction in core MACE endpoints, manifesting as early as 6 months and widening steadily over 3 years of therapy.'
      },
      {
        id: 'slide-1-2',
        title: 'Safety Profile: Major Bleeding Incidence',
        subtitle: 'Safety analysis demonstrating low hazard ratio of bleeding',
        content: 'Safety is a principal barrier in platelet inhibition. CardioGard demonstrated a non-significant difference in major TIMI bleeding events compared to standard of care, offering **high therapeutic precision without compromising patient safety**.',
        graphicType: 'table',
        graphicData: [
          { event: 'Major TIMI Bleeding', standardCare: '1.2%', cardioGard: '1.4%', pValue: 'p = 0.48 (NS)' },
          { event: 'Intracranial Hemorrhage', standardCare: '0.15%', cardioGard: '0.12%', pValue: 'p = 0.72 (NS)' },
          { event: 'GI Bleeding (requiring transfusion)', standardCare: '0.6%', cardioGard: '0.7%', pValue: 'p = 0.55 (NS)' },
          { event: 'Any Bleeding Event', standardCare: '5.2%', cardioGard: '5.9%', pValue: 'p < 0.05' }
        ],
        keyTakeaway: 'No statistically significant increase in major life-threatening bleeding episodes, ensuring peace of mind across vulnerable patient demographics.'
      },
      {
        id: 'slide-1-3',
        title: 'Patient Compliance & Dosage Convenience',
        subtitle: 'Optimal dosing simplicity leading to improved adherence rates',
        content: 'In standard real-world cohorts, daily compliance is a strong predictor of survivability. CardioGard\'s once-daily micro-tablet is engineered for **pH-independent dissolution**, allowing administration at any time of day, regardless of food intake.',
        graphicType: 'bullet_points',
        graphicData: [
          { label: 'Single Tablet Dosing', text: 'One 10mg micro-tablet once daily eliminates complex morning/evening splitting regimens.' },
          { label: 'No Diet Restrictions', text: 'pH-independent capsule absorption is unaffected by proton pump inhibitors (PPIs) or antacids.' },
          { label: 'Patient Support Program', text: 'Co-pay cards reduce average patient out-of-pocket expenses to less than $10 per month.' }
        ],
        keyTakeaway: 'Simple once-daily tablet, food-independent, compatible with standard concurrent medications, and heavily supported by financial assistance.'
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'OncoShield (Zolaparib)',
    therapeuticArea: 'Oncology',
    indication: 'First-line monotherapy for adult patients with advanced BRCA-mutated ovarian cancer after response to first-line platinum-based chemotherapy.',
    dosage: '300mg orally twice daily (two 150mg tablets) with food.',
    description: 'An advanced next-generation PARP inhibitor designed to maximize DNA damage in malignant cells while shielding healthy cellular tissue.',
    slides: [
      {
        id: 'slide-2-1',
        title: 'SIRIUS-3 Study: Progression-Free Survival (PFS)',
        subtitle: 'OncoShield vs. Placebo in First-line BRCAm Ovarian Cancer Maintenance',
        content: 'In the SIRIUS-3 pivotal study, maintenance with OncoShield provided a median progression-free survival (PFS) of **56 months** compared to **13.8 months** for the placebo control group, showing a spectacular **hazard ratio of 0.30 (p < 0.0001)**.',
        graphicType: 'chart',
        graphicData: [
          { month: 0, placebo: 100, oncoShield: 100 },
          { month: 6, placebo: 82, oncoShield: 95 },
          { month: 12, placebo: 53, oncoShield: 89 },
          { month: 18, placebo: 35, oncoShield: 81 },
          { month: 24, placebo: 24, oncoShield: 74 },
          { month: 36, placebo: 16, oncoShield: 63 },
          { month: 48, placebo: 11, oncoShield: 56 },
          { month: 56, placebo: 8, oncoShield: 51 }
        ],
        keyTakeaway: 'OncoShield reduces the risk of disease progression or death by 70%. Over half of BRCA-mutated patients remained progression-free at nearly 5 years.'
      },
      {
        id: 'slide-2-2',
        title: 'Tolerability & Hematologic Management',
        subtitle: 'Grade 3/4 adverse events occurring in less than 15% of patients',
        content: 'While PARP inhibitors frequently induce myelosuppression, OncoShield features a unique chemical structure that minimizes bone marrow binding affinity. Grade 3/4 anemia and neutropenia are highly manageable, with dose reductions required in only 12% of patients.',
        graphicType: 'table',
        graphicData: [
          { event: 'Anemia (Grade 3/4)', placebo: '1.1%', oncoShield: '14.2%', management: 'Dose adjustment/temporary hold' },
          { event: 'Neutropenia (Grade 3/4)', placebo: '0.5%', oncoShield: '7.8%', management: 'Dose adjustment/supportive care' },
          { event: 'Thrombocytopenia (Grade 3/4)', placebo: '0.2%', oncoShield: '4.5%', management: 'Dose adjustment' },
          { event: 'Nausea (All Grades)', placebo: '18%', oncoShield: '56%', management: 'Usually mild, subsides after 4-6 weeks' }
        ],
        keyTakeaway: 'Manageable hematologic toxicity profile that rarely necessitates permanent treatment discontinuation (less than 3.5% of study cohort).'
      }
    ]
  },
  {
    id: 'prod-3',
    name: 'NeuroMed (Gabamitor)',
    therapeuticArea: 'Neurology',
    indication: 'Management of focal-onset seizures in adult patients with drug-resistant epilepsy as adjunctive therapy.',
    dosage: '100mg to 400mg daily, titrated weekly in 50mg increments.',
    description: 'A third-generation GABA receptor modulator that selectively targets neuronal hyperexcitability, delivering strong therapeutic efficacy without general CNS suppression.',
    slides: [
      {
        id: 'slide-3-1',
        title: 'ZENITH Trial: Seizure Frequency Reduction',
        subtitle: 'Median Percent Reduction in Seizure Frequency per 28 Days',
        content: 'NeuroMed demonstrated dose-dependent, exceptional control over seizure frequency. At the target dose of 200mg/day, the median seizure reduction was **48%**, while the high dose of 400mg/day resulted in a **62% reduction**, significantly outperforming the placebo (p < 0.001).',
        graphicType: 'chart',
        graphicData: [
          { week: 0, placebo: 0, dose100mg: 0, dose200mg: 0, dose400mg: 0 },
          { week: 4, placebo: 8, dose100mg: 18, dose200mg: 25, dose400mg: 32 },
          { week: 8, placebo: 12, dose100mg: 28, dose200mg: 39, dose400mg: 51 },
          { week: 12, placebo: 15, dose100mg: 33, dose200mg: 48, dose400mg: 62 }
        ],
        keyTakeaway: '62% median seizure reduction at 400mg daily dose with rapid separation from placebo visible at 4 weeks.'
      }
    ]
  }
];

export const INITIAL_CALL_LOGS: CallLog[] = [
  {
    id: 'call-1',
    hcpId: 'hcp-1',
    hcpName: 'Dr. Evelyn Chen',
    date: '2026-06-10',
    type: 'Face-to-Face',
    durationMinutes: 20,
    productsDetailed: [
      {
        productId: 'prod-1',
        productName: 'CardioGard (Elinorip)',
        engagementScore: 9,
        doctorFeedback: 'Highly Interested'
      }
    ],
    samplesDropped: [
      {
        productId: 'prod-1',
        productName: 'CardioGard (Elinorip) 10mg Starter Pack',
        quantity: 5
      }
    ],
    signatureData: 'mock_signature_data_url',
    discussionNotes: 'Detailed Dr. Chen on the 36-month EPIC-4 trial. She was highly impressed by the 24% MACE reduction and the low major bleeding rate. She remarked that this is exactly the safety profile she needs for her elderly post-angioplasty patients. Dropped 5 starter packs. She is open to attending our upcoming Cardio Summit in July.',
    followUpRequired: true,
    followUpNotes: 'Send Dr. Chen the official EPIC-4 trial safety supplement and invite her formally to the Cardio Summit as a speaker or VIP attendee.'
  },
  {
    id: 'call-2',
    hcpId: 'hcp-3',
    hcpName: 'Dr. Sarah Goldstein',
    date: '2026-06-03',
    type: 'Remote Video',
    durationMinutes: 15,
    productsDetailed: [
      {
        productId: 'prod-3',
        productName: 'NeuroMed (Gabamitor)',
        engagementScore: 7,
        doctorFeedback: 'Needs clinical data'
      }
    ],
    samplesDropped: [],
    discussionNotes: 'Conducted video detail on NeuroMed. Handled questions about CNS side-effect profile (dizziness/somnolence). She requested published literature on titration schedules for patients with renal impairment. She prefers to start her focal epilepsy patients on 100mg before ramping up.',
    followUpRequired: true,
    followUpNotes: 'Send medical inquiry request on renal dosing and titration guidelines for NeuroMed.'
  },
  {
    id: 'call-3',
    hcpId: 'hcp-4',
    hcpName: 'Dr. Robert Patel',
    date: '2026-06-18',
    type: 'Face-to-Face',
    durationMinutes: 10,
    productsDetailed: [
      {
        productId: 'prod-1',
        productName: 'CardioGard (Elinorip)',
        engagementScore: 8,
        doctorFeedback: 'Neutral'
      }
    ],
    samplesDropped: [
      {
        productId: 'prod-1',
        productName: 'CardioGard (Elinorip) 10mg Starter Pack',
        quantity: 10
      }
    ],
    signatureData: 'mock_signature_data_url_patel',
    discussionNotes: 'Brief clinic meeting. Left 10 starter packs. Discussed co-pay card options and patient affordability. He noted that the majority of his commercial patients can easily get this covered with the support program. He was glad to hear that CardioGard has simple once-daily food-independent dosing, which helps his geriatric patients.',
    followUpRequired: false
  }
];

export const INITIAL_SAMPLE_INVENTORY: SampleInventory[] = [
  {
    id: 'samp-1',
    productId: 'prod-1',
    productName: 'CardioGard (Elinorip) 10mg Starter Pack',
    availableQty: 45,
    allocatedQty: 100,
    batchNumber: 'CG-2026-X9',
    expiryDate: '2028-03-31'
  },
  {
    id: 'samp-2',
    productId: 'prod-2',
    productName: 'OncoShield (Zolaparib) 150mg Sample Tray',
    availableQty: 12,
    allocatedQty: 25,
    batchNumber: 'OS-2026-A1',
    expiryDate: '2027-11-30'
  },
  {
    id: 'samp-3',
    productId: 'prod-3',
    productName: 'NeuroMed (Gabamitor) 50mg Titration Pack',
    availableQty: 30,
    allocatedQty: 60,
    batchNumber: 'NM-2026-K4',
    expiryDate: '2027-08-31'
  }
];

export const INITIAL_EVENTS: MedicalEvent[] = [
  {
    id: 'event-1',
    title: 'New Frontiers in Platelet Inhibition Roundtable',
    date: '2026-07-15',
    time: '6:30 PM - 9:00 PM',
    venue: 'L\'Espalier Restaurant, Private Dining Room, Boston',
    speakerName: 'Dr. Evelyn Chen',
    speakerSpecialty: 'Cardiology',
    status: 'Planned',
    budget: 4500,
    description: 'An interactive scientific discussion focusing on therapeutic trade-offs in platelet inhibition, highlighting recent head-to-head trial safety records.',
    attendees: [
      { hcpId: 'hcp-1', hcpName: 'Dr. Evelyn Chen', specialty: 'Cardiology', status: 'Confirmed' },
      { hcpId: 'hcp-4', hcpName: 'Dr. Robert Patel', specialty: 'General Medicine', status: 'Confirmed' },
      { hcpId: 'hcp-5', hcpName: 'Dr. Amanda Ross', specialty: 'Cardiology', status: 'Invited' }
    ]
  },
  {
    id: 'event-2',
    title: 'PARP Inhibitors in Maintenance Therapy Symposium',
    date: '2026-08-04',
    time: '5:30 PM - 8:30 PM',
    venue: 'The Ritz-Carlton Meeting Suite, Boston',
    speakerName: 'Dr. Marcus Vance',
    speakerSpecialty: 'Oncology',
    status: 'Planned',
    budget: 12000,
    description: 'A key educational dinner symposia evaluating real-world outcomes in BRCAm patients following platinum-based chemotherapy maintenance therapies.',
    attendees: [
      { hcpId: 'hcp-2', hcpName: 'Dr. Marcus Vance', specialty: 'Oncology', status: 'Confirmed' },
      { hcpId: 'hcp-1', hcpName: 'Dr. Evelyn Chen', specialty: 'Cardiology', status: 'Invited' }
    ]
  }
];
