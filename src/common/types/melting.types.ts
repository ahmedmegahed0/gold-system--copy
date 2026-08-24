export interface CreateMeltingDto {
  karat: number;
  rawWeightBeforeMelting: number;
  netWeightAfterMelting: number;
  notes?: string;
}

export interface MeltingLog {
  _id: string;
  karat: number;
  rawWeightBeforeMelting: number;
  netWeightAfterMelting: number;
  lossWeight: number;
  lossPercentage: number;
  notes?: string;
  actionBy: string | { _id: string; fullName: string };
  createdAt: string;
  updatedAt: string;
}
