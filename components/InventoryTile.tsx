
import React from 'react';
import { GroupedInventory } from '../types';

interface InventoryTileProps {
  data: GroupedInventory;
}

const InventoryTile: React.FC<InventoryTileProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">{data.category}</h3>
            <p className="text-sm font-semibold text-slate-700">{data.subCategory}</p>
          </div>
          <div className="bg-white px-2 py-1 rounded-md border border-indigo-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none">Grade</span>
            <span className="text-lg font-black text-indigo-600 leading-tight">{data.grade}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          {Object.entries(data.subjects).map(([subject, count]) => (
            <div key={subject} className="flex justify-between items-center group">
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors font-medium">{subject}</span>
              <span className="text-sm font-bold text-slate-800 tabular-nums bg-slate-100 px-2 py-0.5 rounded-full">
                {count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryTile;
