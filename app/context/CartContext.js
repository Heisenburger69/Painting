'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('magazine_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('magazine_cart', JSON.stringify(newCart));
  };

  const addToCart = (artwork) => {
    if (artwork.status !== 'available') {
      alert('This painting is sold.');
      return;
    }
    if (cart.some((item) => item.id === artwork.id)) {
      alert('This unique item is already in your cart.');
      return;
    }
    saveCart([...cart, artwork]);
  };

  const removeFromCart = (id) => {
    saveCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => saveCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
