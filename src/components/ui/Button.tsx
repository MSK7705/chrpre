import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button'
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
