import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface EventFilterProps {
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  dateRange: { start: string; end: string };
  onDateChange: (range: { start: string; end: string }) => void;
}

const eventTypes = [
  { id: "memory", label: "Memory", color: "from-blue-400 to-purple-500" },
  { id: "interaction", label: "Interaction", color: "from-purple-400 to-pink-500" },
  { id: "indexing", label: "Indexing", color: "from-teal-400 to-blue-500" },
  { id: "synthesis", label: "Synthesis", color: "from-green-400 to-teal-500" },
  { id: "calibration", label: "Calibration", color: "from-yellow-400 to-orange-500" },
  { id: "transcription", label: "Transcription", color: "from-pink-400 to-purple-500" },
];

export function EventFilter({ selectedTypes, onTypeChange, dateRange, onDateChange }: EventFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onTypeChange(selectedTypes.filter(t => t !== typeId));
    } else {
      onTypeChange([...selectedTypes, typeId]);
    }
  };

  const clearFilters = () => {
    onTypeChange([]);
    onDateChange({ start: "", end: "" });
  };

  const hasActiveFilters = selectedTypes.length > 0 || dateRange.start || dateRange.end;

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/5 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-colors"
        >
          <Filter className="w-4 h-4 opacity-60" strokeWidth={1.5} />
          <span className="text-sm tracking-tight opacity-80" style={{ fontWeight: 500 }}>
            Filters
          </span>
          {hasActiveFilters && (
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-blue-500" />
          )}
        </motion.button>

        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm tracking-tight opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            Clear
          </motion.button>
        )}
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Event Types */}
          <div>
            <label className="block text-sm tracking-tight opacity-60 mb-3" style={{ fontWeight: 500 }}>
              Event Type
            </label>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => {
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleType(type.id)}
                    className={`
                      px-4 py-2 rounded-xl border transition-all duration-300
                      ${isSelected
                        ? 'bg-white/80 border-black/10 shadow-sm'
                        : 'bg-white/40 border-black/5 hover:bg-white/60'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${type.color}`} />
                      <span className="text-sm tracking-tight opacity-80">
                        {type.label}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm tracking-tight opacity-60 mb-3" style={{ fontWeight: 500 }}>
              Date Range
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => onDateChange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-black/5 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-black/10 focus:ring-2 focus:ring-purple-400/20 transition-all text-sm tracking-tight"
                />
              </div>
              <span className="text-sm tracking-tight opacity-40">to</span>
              <div className="flex-1">
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => onDateChange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-black/5 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-black/10 focus:ring-2 focus:ring-purple-400/20 transition-all text-sm tracking-tight"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
