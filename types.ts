
export type InventoryType = 'IN' | 'OUT';

export interface InventoryItem {
  Date: string;
  ModelYear: number;
  Category: string;
  SubCategory: string;
  Grade: string | number;
  Subject: string;
  NoOfSets: number;
  Type: InventoryType;
  Description: string;
  Count: number;
}

export interface GroupedInventory {
  category: string;
  subCategory: string;
  grade: string | number;
  subjects: {
    [subject: string]: number;
  };
}

export interface Filters {
  categories: string[];
  subCategories: string[];
}
