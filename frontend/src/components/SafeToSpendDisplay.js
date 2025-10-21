import { formatCurrency } from '../utils/formatters';

const SafeToSpendDisplay = ({ amount, showLabel = true, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="inline-flex items-center space-x-1 text-green-600">
      <svg xmlns="http://www.w3.org/2000/svg" className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {showLabel && <span className={`${sizeClasses[size]} font-medium`}>Safe:</span>}
      <span className={`${sizeClasses[size]} font-semibold`}>{formatCurrency(amount)}</span>
    </div>
  );
};

export default SafeToSpendDisplay;

