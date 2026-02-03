import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

export const FloatingCartButton: React.FC = () => {
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Check if we're on product details page
  const isProductDetailsPage = location.pathname.includes('/product/');
  
  // Dynamic bottom position with smooth transition
  const getBottomPosition = () => {
    if (isProductDetailsPage) {
      return 'bottom-32'; // Higher position for product details
    }
    return 'bottom-12'; // Normal position
  };

  useEffect(() => {
    if (totalItems > 0) {
      setShowAnimation(true);
      setIsExpanded(true);
      // Remove auto-collapse - button stays extended
    } else {
      setIsExpanded(false);
      setShowAnimation(false);
    }
  }, [totalItems]);

  const handleBottleClick = () => {
    // Navigate to My Bottles page
    navigate('/my-bottles');
  };

  const handleCartClick = () => {
    // Navigate to cart page
    navigate('/cart');
  };

  if (!showAnimation && totalItems === 0) {
    return (
      // Original wine bottle button with animated positioning
      <div className={`fixed ${getBottomPosition()} left-1/2 transform -translate-x-1/2 z-40 transition-all duration-500 ease-in-out`}>
        <button 
          onClick={handleBottleClick}
          className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white hover:bg-red-600 transition-colors"
        >
          {/* Wine Bottle SVG Icon */}
          <svg 
            width="32" 
            height="42" 
            viewBox="0 0 20 28" 
            fill="none" 
            className="text-white"
          >
            {/* Wine bottle body */}
            <path 
              d="M6 8C6 7.5 6.5 7 7 7H13C13.5 7 14 7.5 14 8V26C14 26.5 13.5 27 13 27H7C6.5 27 6 26.5 6 26V8Z" 
              fill="currentColor"
            />
            {/* Wine bottle neck */}
            <path 
              d="M8.5 1C8.5 0.5 9 0 9.5 0H10.5C11 0 11.5 0.5 11.5 1V7H8.5V1Z" 
              fill="currentColor"
            />
            {/* Wine bottle shoulder */}
            <path 
              d="M6 8C6 7.5 6.5 7 7 7H8.5V7H11.5V7H13C13.5 7 14 7.5 14 8V12C14 12 12 10 10 10C8 10 6 12 6 12V8Z" 
              fill="currentColor"
            />
            {/* Bottle highlight */}
            <path 
              d="M7.5 9H8.5V24H7.5V9Z" 
              fill="currentColor" 
              opacity="0.4"
            />
            {/* Cork/cap */}
            <rect 
              x="8.5" 
              y="0" 
              width="3" 
              height="1.5" 
              fill="currentColor" 
              opacity="0.8"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${getBottomPosition()} left-1/2 transform -translate-x-1/2 z-40 transition-all duration-500 ease-in-out`}>
      <div 
        className={`bg-red-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-all duration-500 ease-in-out ${
          isExpanded 
            ? 'w-32 h-16 px-2' 
            : 'w-20 h-20'
        }`}
      >
        {isExpanded ? (
          // Expanded state with both clickable sections - icons only
          <div className="flex items-center justify-between w-full text-white px-2">
            {/* Left side - Wine Bottle (My Bottle feature) */}
            <button 
              onClick={handleBottleClick}
              className="flex items-center justify-center hover:bg-white/10 rounded-l-full py-3 px-3 transition-colors flex-1"
            >
              {/* Wine Bottle Icon */}
              <svg 
                width="28" 
                height="36" 
                viewBox="0 0 20 28" 
                fill="none" 
                className="text-white -ml-2"
              >
                <path 
                  d="M6 8C6 7.5 6.5 7 7 7H13C13.5 7 14 7.5 14 8V26C14 26.5 13.5 27 13 27H7C6.5 27 6 26.5 6 26V8Z" 
                  fill="currentColor"
                />
                <path 
                  d="M8.5 1C8.5 0.5 9 0 9.5 0H10.5C11 0 11.5 0.5 11.5 1V7H8.5V1Z" 
                  fill="currentColor"
                />
                <path 
                  d="M6 8C6 7.5 6.5 7 7 7H8.5V7H11.5V7H13C13.5 7 14 7.5 14 8V12C14 12 12 10 10 10C8 10 6 12 6 12V8Z" 
                  fill="currentColor"
                />
                <path 
                  d="M7.5 9H8.5V24H7.5V9Z" 
                  fill="currentColor" 
                  opacity="0.4"
                />
                <rect 
                  x="8.5" 
                  y="0" 
                  width="3" 
                  height="1.5" 
                  fill="currentColor" 
                  opacity="0.8"
                />
              </svg>
            </button>
            
            {/* Divider */}
            <div className="w-px h-8 bg-white/20"></div>
            
            {/* Right side - Cart with item count */}
            <button 
              onClick={handleCartClick}
              className="flex items-center justify-center hover:bg-white/10 rounded-r-full py-3 px-3 transition-colors flex-1 relative"
            >
              <ShoppingCart className="w-7 h-7" />
              {/* Item count badge */}
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </div>
            </button>
          </div>
        ) : (
          // Collapsed state - just wine bottle
          <button 
            onClick={handleBottleClick}
            className="hover:bg-red-600 rounded-full p-2 transition-colors"
          >
            <svg 
              width="32" 
              height="42" 
              viewBox="0 0 20 28" 
              fill="none" 
              className="text-white"
            >
              <path 
                d="M6 8C6 7.5 6.5 7 7 7H13C13.5 7 14 7.5 14 8V26C14 26.5 13.5 27 13 27H7C6.5 27 6 26.5 6 26V8Z" 
                fill="currentColor"
              />
              <path 
                d="M8.5 1C8.5 0.5 9 0 9.5 0H10.5C11 0 11.5 0.5 11.5 1V7H8.5V1Z" 
                fill="currentColor"
              />
              <path 
                d="M6 8C6 7.5 6.5 7 7 7H8.5V7H11.5V7H13C13.5 7 14 7.5 14 8V12C14 12 12 10 10 10C8 10 6 12 6 12V8Z" 
                fill="currentColor"
              />
              <path 
                d="M7.5 9H8.5V24H7.5V9Z" 
                fill="currentColor" 
                opacity="0.4"
              />
              <rect 
                x="8.5" 
                y="0" 
                width="3" 
                height="1.5" 
                fill="currentColor" 
                opacity="0.8"
              />
            </svg>
          </button>
        )}
        
        {/* Item count badge */}
        {totalItems > 0 && !isExpanded && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {totalItems}
          </div>
        )}
      </div>
    </div>
  );
};