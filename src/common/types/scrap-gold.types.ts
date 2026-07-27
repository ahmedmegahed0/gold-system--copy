export interface BuyScrapDto {
  karat: 18 | 21;
  category: string;
  count: number;
  weight: number;
}

export interface ScrapCategoryItem {
  category: string | { _id?: string; id?: string; name: string };
  count: number;
  weight: number;
}

export interface ScrapGold {
  _id?: string;
  id?: string;
  karat: 18 | 21;
  items: ScrapCategoryItem[];
  createdAt?: string;
  updatedAt?: string;
}
