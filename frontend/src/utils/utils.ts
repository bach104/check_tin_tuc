export const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || "http://168.138.162.71:3000/api";
};

export const API_URL = getBaseUrl();

export const getApiUrl = (endpoint: string) => {
    const baseUrl = getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
};

export const getVerdictColor = (verdict: string): string => {
  const colors = {
    TRUE: 'text-green-600 bg-green-100',
    FALSE: 'text-red-600 bg-red-100',
    MISLEADING: 'text-yellow-600 bg-yellow-100',
    UNVERIFIED: 'text-gray-600 bg-gray-100'
  };
  return colors[verdict as keyof typeof colors] || 'text-gray-600 bg-gray-100';
};

export const getVerdictIcon = (verdict: string): string => {
  const icons = {
    TRUE: '✅',
    FALSE: '❌',
    MISLEADING: '⚠️',
    UNVERIFIED: '❓'
  };
  return icons[verdict as keyof typeof icons] || '📄';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};