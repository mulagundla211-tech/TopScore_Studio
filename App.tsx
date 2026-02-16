
import React, { useState, useMemo, useEffect } from 'react';
import { GOOGLE_SHEET_CONFIG } from './config';
import { Filters, GroupedInventory, InventoryItem } from './types';
import { MOCK_INVENTORY_DATA } from './constants';
import FilterBar from './components/FilterBar';
import InventoryTile from './components/InventoryTile';

// Completed parseCSV function to handle CSV processing from Google Sheets
const parseCSV = (csvText: string): any[] => {
  const cleanText = csvText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleanText) return [];
  
  const rows: string[] = [];
  let currentRow = "";
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    if (char === '"') inQuotes = !inQuotes;
    if (char === '\n' && !inQuotes) {
      if (currentRow.trim() || rows.length === 0) rows.push(currentRow);
      currentRow = "";
    } else {
      currentRow += char;
    }
  }
  if (currentRow.trim()) rows.push(currentRow);

  if (rows.length < 2) return [];

  const splitFields = (line: string) => {
    const fields = [];
    let field = "";
    let inside = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inside = !inside;
      else if (c === ',' && !inside) {
        fields.push(field.trim());
        field = "";
      } else {
        field += c;
      }
    }
    fields.push(field.trim());
    return fields;
  };

  const headers = splitFields(rows[0]).map(h => h.replace(/^"|"$/g, '').trim());
  
  return rows.slice(1).map(row => {
    const values = splitFields(row);
    const obj: any = {};
    headers.forEach((header, i) => {
      const val = values[i] ? values[i].replace(/^"|"$/g, '').trim() : '';
      // Try to parse as number if it looks like one, but keep identifiers as strings
      if (val !== '' && !isNaN(Number(val)) && !['Date', 'Category', 'SubCategory', 'Grade', 'Subject', 'Type', 'Description'].includes(header)) {
        obj[header] = Number(val);
      } else {
        obj[header] = val;
      }
    });
    return obj;
  });
};

const App: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    subCategories: [],
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(GOOGLE_SHEET_CONFIG.INVENTORY_DATA_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        
        // Map parsed CSV items to InventoryItem type
        const items: InventoryItem[] = parsed.map(item => ({
          ...item,
          Count: Number(item.Count || item.NoOfSets || 0),
          ModelYear: Number(item.ModelYear || 0),
          NoOfSets: Number(item.NoOfSets || 0),
          Grade: String(item.Grade || '')
        }));

        setInventory(items.length > 0 ? items : MOCK_INVENTORY_DATA);
        setError(null);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setInventory(MOCK_INVENTORY_DATA); // Fallback to mock data for demo
        setError('Working in Demo Mode - Connection to spreadsheet failed.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute unique categories for filters
  const allCategories = useMemo(() => {
    const cats = new Set(inventory.map(item => item.Category));
    return Array.from(cats).filter(Boolean).sort();
  }, [inventory]);

  // Compute subcategories based on selected categories
  const allSubCategories = useMemo(() => {
    const subs = new Set(
      inventory
        .filter(item => filters.categories.length === 0 || filters.categories.includes(item.Category))
        .map(item => item.SubCategory)
    );
    return Array.from(subs).filter(Boolean).sort();
  }, [inventory, filters.categories]);

  // Aggregate and filter data for display
  const filteredAndGrouped = useMemo(() => {
    const filtered = inventory.filter(item => {
      const catMatch = filters.categories.length === 0 || filters.categories.includes(item.Category);
      const subMatch = filters.subCategories.length === 0 || filters.subCategories.includes(item.SubCategory);
      return catMatch && subMatch;
    });

    const aggregated: Record<string, number> = {};
    filtered.forEach(item => {
      const key = `${item.Category}|${item.SubCategory}|${item.Grade}|${item.Subject}`;
      const change = item.Type === 'IN' ? item.Count : -item.Count;
      aggregated[key] = (aggregated[key] || 0) + change;
    });

    const groups: Record<string, GroupedInventory> = {};
    Object.entries(aggregated).forEach(([key, totalCount]) => {
      const [cat, sub, grade, subject] = key.split('|');
      const groupKey = `${cat}|${sub}|${grade}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          category: cat,
          subCategory: sub,
          grade: grade,
          subjects: {}
        };
      }
      groups[groupKey].subjects[subject] = totalCount;
    });

    return Object.values(groups);
  }, [inventory, filters]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventory Tracker</h1>
          </div>
          <p className="text-slate-500 font-medium">Real-time stock monitoring and distribution management.</p>
          {error && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </header>

        <FilterBar 
          allCategories={allCategories} 
          allSubCategories={allSubCategories}
          filters={filters}
          onFilterChange={setFilters}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-bold animate-pulse">Loading Inventory Data...</p>
          </div>
        ) : filteredAndGrouped.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndGrouped.map((group, idx) => (
              <InventoryTile key={`${group.category}-${group.subCategory}-${group.grade}-${idx}`} data={group} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">No inventory items found</h2>
            <p className="text-slate-500">Try adjusting your filters or check the source data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
