import React, { useState, useMemo } from 'react';
import { Plus, X, ChevronDown, Search, Check } from 'lucide-react';

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string | string[];
  logicalOperator?: 'AND' | 'OR';
}

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'date';
  options?: string[];
}

interface DynamicFilterBuilderProps {
  data: any[];
  onFiltersChange: (conditions: FilterCondition[]) => void;
  className?: string;
}

interface MultiSelectDropdownProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleToggleOption = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };

  const handleSelectAll = () => {
    onChange(filteredOptions);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative min-w-[200px]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-left bg-white flex items-center justify-between"
      >
        <span className="truncate">
          {selectedValues.length === 0
            ? placeholder
            : selectedValues.length === 1
            ? selectedValues[0]
            : `${selectedValues.length} selected`
          }
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Select All / Clear All */}
          <div className="p-2 border-b border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Select All ({filteredOptions.length})
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Options List */}
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map(option => (
                <label
                  key={option}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => handleToggleOption(option)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{option}</span>
                  {selectedValues.includes(option) && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </label>
              ))
            )}
          </div>

          {/* Selected Count */}
          {selectedValues.length > 0 && (
            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600">
                {selectedValues.length} of {options.length} selected
              </div>
              {selectedValues.length <= 3 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedValues.map(value => (
                    <span
                      key={value}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleOption(value);
                        }}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const DynamicFilterBuilder: React.FC<DynamicFilterBuilderProps> = ({
  data,
  onFiltersChange,
  className = ""
}) => {
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);

  // Define available fields for filtering
  const filterFields: FilterField[] = useMemo(() => [
    { key: 'candidateName', label: 'Candidate Name', type: 'text' },
    { key: 'candidateEmail', label: 'Candidate Email', type: 'text' },
    { key: 'candidateLocation', label: 'Candidate Location', type: 'text' },
    { key: 'candidateExperience', label: 'Experience (Years)', type: 'number' },
    { key: 'candidateSkills', label: 'Skills', type: 'multiselect', options: [...new Set(data.flatMap(d => d.candidateSkills || []))].sort() },
    { key: 'jobTitle', label: 'Job Title', type: 'select', options: [...new Set(data.map(d => d.jobTitle).filter(Boolean))].sort() },
    { key: 'jobDepartment', label: 'Department', type: 'select', options: [...new Set(data.map(d => d.jobDepartment).filter(Boolean))].sort() },
    { key: 'jobLocation', label: 'Job Location', type: 'text' },
    { key: 'jobType', label: 'Job Type', type: 'select', options: [...new Set(data.map(d => d.jobType).filter(Boolean))].sort() },
    { key: 'applicationStatus', label: 'Application Status', type: 'select', options: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'] },
    { key: 'appliedDate', label: 'Applied Date', type: 'date' },
    { key: 'lastUpdated', label: 'Last Updated', type: 'date' },
  ], [data]);

  // Get operators based on field type
  const getOperators = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'startsWith', label: 'Starts with' },
          { value: 'endsWith', label: 'Ends with' },
          { value: 'notContains', label: 'Does not contain' }
        ];
      case 'select':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'notEquals', label: 'Not equals' }
        ];
      case 'multiselect':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'containsAll', label: 'Contains all' },
          { value: 'notContains', label: 'Does not contain' }
        ];
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greaterThan', label: 'Greater than' },
          { value: 'lessThan', label: 'Less than' },
          { value: 'greaterThanOrEqual', label: 'Greater than or equal' },
          { value: 'lessThanOrEqual', label: 'Less than or equal' }
        ];
      case 'date':
        return [
          { value: 'equals', label: 'On' },
          { value: 'after', label: 'After' },
          { value: 'before', label: 'Before' },
          { value: 'between', label: 'Between' }
        ];
      default:
        return [{ value: 'equals', label: 'Equals' }];
    }
  };

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Date.now().toString(),
      field: '',
      operator: '',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    };
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    const newConditions = conditions.map(condition =>
      condition.id === id ? { ...condition, ...updates } : condition
    );
    setConditions(newConditions);
    onFiltersChange(newConditions.filter(c => c.field && c.operator && c.value));
  };

  const removeCondition = (id: string) => {
    const newConditions = conditions.filter(condition => condition.id !== id);
    // Remove logical operator from first condition if it exists
    if (newConditions.length > 0) {
      newConditions[0].logicalOperator = undefined;
    }
    setConditions(newConditions);
    onFiltersChange(newConditions.filter(c => c.field && c.operator && c.value));
  };

  const clearAllFilters = () => {
    setConditions([]);
    onFiltersChange([]);
  };

  const renderValueInput = (condition: FilterCondition) => {
    const field = filterFields.find(f => f.key === condition.field);
    if (!field) return null;

    switch (field.type) {
      case 'select':
        return (
          <select
            value={condition.value as string}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            <option value="">Select value</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <MultiSelectDropdown
            options={field.options || []}
            selectedValues={Array.isArray(condition.value) ? condition.value : []}
            onChange={(values) => updateCondition(condition.id, { value: values })}
            placeholder={`Select ${field.label.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={condition.value as string}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            placeholder="Enter number"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={condition.value as string}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        );

      default:
        return (
          <input
            type="text"
            value={condition.value as string}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            placeholder="Enter value"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        );
    }
  };

  const activeFiltersCount = conditions.filter(c => c.field && c.operator && c.value).length;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {conditions.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <span>{showBuilder ? 'Hide' : 'Show'} Builder</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showBuilder ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Builder */}
      {showBuilder && (
        <div className="p-4">
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                {/* Logical Operator */}
                {index > 0 && (
                  <select
                    value={condition.logicalOperator || 'AND'}
                    onChange={(e) => updateCondition(condition.id, { logicalOperator: e.target.value as 'AND' | 'OR' })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-medium"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                )}

                {/* Field Selection */}
                <select
                  value={condition.field}
                  onChange={(e) => updateCondition(condition.id, { field: e.target.value, operator: '', value: '' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm min-w-[150px]"
                >
                  <option value="">Select field</option>
                  {filterFields.map(field => (
                    <option key={field.key} value={field.key}>{field.label}</option>
                  ))}
                </select>

                {/* Operator Selection */}
                {condition.field && (
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(condition.id, { operator: e.target.value, value: '' })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="">Select operator</option>
                    {getOperators(filterFields.find(f => f.key === condition.field)?.type || 'text').map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                )}

                {/* Value Input */}
                {condition.field && condition.operator && renderValueInput(condition)}

                {/* Remove Button */}
                <button
                  onClick={() => removeCondition(condition.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Add Condition Button */}
            <button
              onClick={addCondition}
              className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 w-full justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>Add Filter Condition</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && !showBuilder && (
        <div className="p-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            <strong>Active Filters:</strong> {activeFiltersCount} condition{activeFiltersCount !== 1 ? 's' : ''} applied
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicFilterBuilder;