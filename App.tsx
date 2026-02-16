import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GOOGLE_SHEET_CONFIG } from './config';
import { Filters, GroupedInventory, InventoryItem } from './types';
import { MOCK_INVENTORY_DATA } from './constants';
import FilterBar from './components/FilterBar';
import InventoryTile from './components/InventoryTile';

const parseCSV = (csvText: string): any[] => {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];
  
  const rows: string[] = [];
  let currentRow = "";
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    if (char === '"') inQuotes = !inQuotes;
    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentRow.trim()) rows.push(currentRow);
      currentRow = "";
      if (char === '\r' && cleanText[i+1] === '\n') i++;
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

  const rawHeaders = splitFields(rows[0]).map(h => h.replace(/^"|"$/g, '').trim());
  
  return rows.slice(1).map(row => {
    const values = splitFields(row);
    const obj: any = {};
    rawHeaders.forEach((header, i) => {
      obj[header] = values[i] ? values[i].replace(/^"|"$/g, '').trim() : "";
    });
    return obj;
  });
};

const getVal = (row: any, keys: string[]): string => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
    const normalizedK = k.toLowerCase().replace(/[\s\._]/g, '');
    const foundKey = Object.keys(row).find(actualKey => {
      const normalizedActual = actualKey.toLowerCase().replace(/[\s\._]/g, '');
      return normalizedActual === normalizedK;
    });
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== "") return row[foundKey];
  }
  return "";
};

const App: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [masterCategories, setMasterCategories] = useState<{Category: string, SubCategory: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    subCategories: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const invResponse = await fetch(GOOGLE_SHEET_CONFIG.INVENTORY_DATA_URL);
      if (!invResponse.ok) throw new Error(`Could not access Inventory Sheet (Status ${invResponse.status})`);
      const invText = await invResponse.text();
      
      if (invText.trim().toLowerCase().startsWith('<!doctype html')) {
        throw new Error("The Sheet URL returned a login page. Please ensure it is 'Published to the Web' as a CSV.");
      }

      const rawInv = parseCSV(invText);
      const mappedInv: InventoryItem[] = rawInv.map(row => {
        const typeRaw = getVal(row, ['Type', 'In/Out', 'Movement']) || 'IN';
        const typeNormalized = typeRaw.toUpperCase().includes('OUT') ? 'OUT' : 'IN';
        
        return {
          Date: getVal(row, ['Date', 'EntryDate']),
          ModelYear: parseInt(getVal(row, ['Model Year', 'ModelYear', 'Year']) || '0'),
          Category: getVal(row, ['Category', 'Cat', 'Genre']) || 'Uncategorized',
          SubCategory: getVal(row, ['Sub Category', 'SubCategory', 'Sub']) || 'General',
          Grade: getVal(row, ['Grade', 'Class', 'Level']),
          Subject: getVal(row, ['Subject', 'Sub', 'Title', 'Topic']),
          NoOfSets: parseInt(getVal(row, ['No. of sets', 'NoOfSets', 'Count', 'Qty']) || '0'),
          Type: typeNormalized as 'IN' | 'OUT',
          Description: getVal(row, ['Description', 'Note', 'Comment']),
          Count: parseInt(getVal(row, ['Count', 'Total', 'Qty', 'No. of sets']) || '0')
        };
      });

      let masterData: {Category: string, SubCategory: string}[] = [];
      try {
        const masterResponse = await fetch(GOOGLE_SHEET_CONFIG.MASTER_DETAILS_URL);
        if (masterResponse.ok) {
          const masterText = await masterResponse.text();
          if (!masterText.trim().toLowerCase().startsWith('<!doctype html')) {
            masterData = parseCSV(masterText).map(row => ({
              Category: getVal(row, ['Category', 'Cat']),
              SubCategory: getVal(row, ['Sub Category', 'SubCategory'])
            })).filter(item => item.Category);
          }
        }
      } catch (e) {
        console.warn("Master sheet could not be loaded.");
      }

      setInventory(mappedInv.length > 0 ? mappedInv : MOCK_INVENTORY_DATA);
      setMasterCategories(masterData);
      
      if (mappedInv.length === 0 && masterData.length === 0) {
        setError("Spreadsheet connected but no valid rows found.");
      }
    } catch (err: any) {
      console.error(err);
      setError(`Notice: ${err.message}. Displaying Demo Data for now.`);
      setInventory(MOCK_INVENTORY_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allCategories = useMemo(() => {
    const cats = new Set([
      ...inventory.map(i => i.Category),
      ...masterCategories.map(m => m.Category)
    ]);
    return Array.from(cats).filter(Boolean).sort();
  }, [inventory, masterCategories]);

  const allSubCategories = useMemo(() => {
    const selectedCats = filters.categories;
    const subs = new Set([
      ...inventory
        .filter(i => selectedCats.length === 0 || selectedCats.includes(i.Category))
        .map(i => i.SubCategory),
      ...masterCategories
        .filter(m => selectedCats.length === 0 || selectedCats.includes(m.Category))
        .map(m => m.SubCategory)
    ]);
    return Array.from(subs).filter(Boolean).sort();
  }, [inventory, masterCategories, filters.categories]);

  const filteredAndGrouped = useMemo(() => {
    const filtered = inventory.filter(item => {
      const catMatch = filters.categories.length === 0 || filters.categories.includes(item.Category);
      const subMatch = filters.subCategories.length === 0 || filters.subCategories.includes(item.SubCategory);
      return catMatch && subMatch;
    });

    const groups: Record<string, GroupedInventory> = {};
    filtered.forEach(item => {
      const groupKey = `${item.Category}|${item.SubCategory}|${item.Grade}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          category: item.Category,
          subCategory: item.SubCategory,
          grade: item.Grade,
          subjects: {}
        };
      }
      const change = item.Type === 'OUT' ? -item.Count : item.Count;
      groups[groupKey].subjects[item.Subject] = (groups[groupKey].subjects[item.Subject] || 0) + change;
    });

    return Object.values(groups).sort((a, b) => String(a.grade).localeCompare(String(b.grade), undefined, { numeric: true }));
  }, [inventory, filters]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">TopScore Inventory</h1>
            </div>
            <p className="text-slate-500 font-medium">Real-time stock management dashboard.</p>
          </div>
          
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Now
          </button>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-2xl flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold">Sync Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <FilterBar 
          allCategories={allCategories} 
          allSubCategories={allSubCategories}
          filters={filters}
          onFilterChange={setFilters}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading...</p>
          </div>
        ) : filteredAndGrouped.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndGrouped.map((group, idx) => (
              <InventoryTile key={`${group.category}-${group.subCategory}-${group.grade}-${idx}`} data={group} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border border-slate-200">
             <h2 className="text-2xl font-bold text-slate-800 mb-2">No Records</h2>
             <p className="text-slate-500">Check your filters or the source spreadsheet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;