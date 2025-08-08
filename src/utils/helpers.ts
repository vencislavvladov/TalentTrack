export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatSalary = (min: number, max: number): string => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };
  
  return `${formatNumber(min)} - ${formatNumber(max)}`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    case 'applied':
      return 'bg-blue-100 text-blue-800';
    case 'screening':
      return 'bg-purple-100 text-purple-800';
    case 'interview':
      return 'bg-orange-100 text-orange-800';
    case 'offer':
      return 'bg-pink-100 text-pink-800';
    case 'hired':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getApplicationProgress = (status: string): number => {
  switch (status) {
    case 'applied':
      return 20;
    case 'screening':
      return 40;
    case 'interview':
      return 60;
    case 'offer':
      return 80;
    case 'hired':
      return 100;
    case 'rejected':
      return 0;
    default:
      return 0;
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const searchFilter = <T>(items: T[], searchTerm: string, searchFields: (keyof T)[]): T[] => {
  if (!searchTerm) return items;
  
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (Array.isArray(value)) {
        return value.some(v => 
          typeof v === 'string' && v.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return false;
    })
  );
};