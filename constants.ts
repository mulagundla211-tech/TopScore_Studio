import { InventoryItem } from './types';

export interface MasterItem {
  Category: string;
  SubCategory: string;
}

export const MOCK_MASTER_DATA: MasterItem[] = [
  { Category: 'Workbooks', SubCategory: 'Mathematics' },
  { Category: 'Workbooks', SubCategory: 'Science' },
  { Category: 'Textbooks', SubCategory: 'English' },
  { Category: 'Textbooks', SubCategory: 'History' },
  { Category: 'Reference', SubCategory: 'Atlas' },
  { Category: 'Reference', SubCategory: 'Dictionary' },
];

export const MOCK_INVENTORY_DATA: InventoryItem[] = [
  { Date: '2023-10-01', ModelYear: 2024, Category: 'Workbooks', SubCategory: 'Mathematics', Grade: '1', Subject: 'Addition Basic', NoOfSets: 50, Type: 'IN', Description: 'Initial Stock', Count: 50 },
  { Date: '2023-10-02', ModelYear: 2024, Category: 'Workbooks', SubCategory: 'Mathematics', Grade: '1', Subject: 'Subtraction Basic', NoOfSets: 40, Type: 'IN', Description: 'Initial Stock', Count: 40 },
  { Date: '2023-10-05', ModelYear: 2024, Category: 'Workbooks', SubCategory: 'Mathematics', Grade: '1', Subject: 'Addition Basic', NoOfSets: 10, Type: 'OUT', Description: 'Sales', Count: 10 },
  { Date: '2023-10-01', ModelYear: 2024, Category: 'Workbooks', SubCategory: 'Science', Grade: '2', Subject: 'Plants', NoOfSets: 30, Type: 'IN', Description: 'Initial Stock', Count: 30 },
  { Date: '2023-10-01', ModelYear: 2024, Category: 'Textbooks', SubCategory: 'English', Grade: '5', Subject: 'Grammar Pro', NoOfSets: 100, Type: 'IN', Description: 'Bulk Entry', Count: 100 },
  { Date: '2023-10-10', ModelYear: 2024, Category: 'Textbooks', SubCategory: 'English', Grade: '5', Subject: 'Literature Plus', NoOfSets: 60, Type: 'IN', Description: 'Bulk Entry', Count: 60 },
  { Date: '2023-10-12', ModelYear: 2024, Category: 'Reference', SubCategory: 'Atlas', Grade: 'All', Subject: 'World Geography', NoOfSets: 25, Type: 'IN', Description: 'Stock', Count: 25 },
];

export const FALLBACK_DATA: InventoryItem[] = [];
