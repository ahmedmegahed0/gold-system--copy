export interface BuyScrapDto {
  karat: 18 | 21;
  weight: number;
}

export interface ScrapGold {
  _id?: string;
  id?: string;
  karat: 18 | 21;
  totalWeight: number;
  createdAt?: string;
  updatedAt?: string;
}
