export const BullionType = {
  INGOT: 'INGOT',
  COIN: 'COIN',
} as const;

export type BullionType = typeof BullionType[keyof typeof BullionType];

export interface BullionInventory {
  _id: string;
  title: string;
  type: BullionType;
  companyName: string;
  karat: number;
  weightPerUnit: number;
  quantity: number;
  makingChargePerUnit: number;
  cashbackPerUnit: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBullionDto {
  title: string;
  type: BullionType;
  companyName: string;
  karat: number;
  weightPerUnit: number;
  quantity: number;
  makingChargePerUnit?: number;
  cashbackPerUnit?: number;
}

export interface UpdateBullionDto extends Partial<CreateBullionDto> {}

export interface AddQuantityDto {
  addedQuantity: number;
}
