'use client';
import { CartProvider } from './context/CartContext';

export default function ClientProviders({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
