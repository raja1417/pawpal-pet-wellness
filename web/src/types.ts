export type Wellness = {
  id: string;
  weight: number | null;
  activityMinutes: number | null;
  mood: string | null;
  notes: string | null;
  recordedAt: string;
};
export type Vaccination = {
  id: string;
  name: string;
  dueDate: string;
  administeredAt: string | null;
  completedAt: string | null;
  notes: string | null;
};
export type VetVisit = { id: string; reason: string; visitDate: string; completed: boolean };
export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthdate: string | null;
  weight: number | null;
  photoUrl: string | null;
  wellness?: Wellness[];
  vaccinations?: Vaccination[];
  vetVisits?: VetVisit[];
  _count?: { wellness: number; vaccinations: number };
};
export type Tip = { kind: string; severity: 'info' | 'attention'; message: string };
export type Reminders = {
  vaccinations: Array<Vaccination & { overdue: boolean; pet: Pick<Pet, 'id' | 'name'> }>;
  vetVisits: Array<VetVisit & { overdue: boolean; pet: Pick<Pet, 'id' | 'name'> }>;
};
