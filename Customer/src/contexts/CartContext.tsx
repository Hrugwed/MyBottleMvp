import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface CartItem {
  _id: string;
  name: string;
  brand: string;
  price: number;
  volume: string;
  quantity: number;
  venueId: string;
  venueName: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('customerToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const refreshCart = useCallback(async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        // No token, clear cart
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform backend data to frontend format
          const transformedItems = data.data.items.map((item: any) => ({
            _id: item._id,
            name: item.bottle.name,
            brand: item.bottle.brand,
            price: item.bottle.price,
            volume: item.selectedVolume,
            quantity: item.quantity,
            venueId: item.venue._id,
            venueName: item.venue.name
          }));
          
          setItems(transformedItems);
          setTotalItems(data.data.summary.totalItems);
          setTotalPrice(data.data.summary.totalPrice);
        }
      } else if (response.status === 401) {
        // Unauthorized, clear cart
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, []);

  // Fetch cart from backend on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (newItem: Omit<CartItem, 'quantity'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bottleId: newItem._id,
          venueId: newItem.venueId,
          quantity: 1,
          selectedVolume: newItem.volume
        })
      });

      if (response.ok) {
        await refreshCart(); // Refresh cart from backend
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await refreshCart(); // Refresh cart from backend
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        await refreshCart(); // Refresh cart from backend
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};