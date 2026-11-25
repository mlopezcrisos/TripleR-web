// Utilidades del carrito, compartidas por App, CartPage y CheckoutPage.

export const CART_STORAGE_KEY = 'cart';
// uid del usuario al que pertenece el carrito guardado en localStorage.
// Vacío = carrito de invitado.
export const CART_OWNER_KEY = 'cartOwner';

// Precio unitario de un artículo del carrito. `price` incluye el ajuste por
// opción (p. ej. hoodie); `precio` es el precio base del catálogo y solo se
// usa para artículos viejos guardados antes de este cambio.
export function getItemPrice(item) {
  const price = Number(item.price ?? item.precio);
  return Number.isFinite(price) ? price : 0;
}

export function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
}

export function getCartItemId(item) {
  return `${item.id}-${item.selectedSize || 'default'}-${item.selectedCut || 'default'}`;
}

// Asegura que cada artículo tenga cartItemId, price y una cantidad válida.
export function normalizeCart(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(item => item && item.id != null)
    .map(item => ({
      ...item,
      cartItemId: item.cartItemId || getCartItemId(item),
      price: getItemPrice(item),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    }));
}

// Une dos carritos sumando cantidades de la misma configuración de producto.
export function mergeCarts(base, extra) {
  const merged = normalizeCart(base);
  for (const item of normalizeCart(extra)) {
    const existing = merged.find(i => i.cartItemId === item.cartItemId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.push(item);
    }
  }
  return merged;
}

export function loadLocalCart() {
  try {
    return normalizeCart(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)));
  } catch {
    return [];
  }
}

export function sameCart(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
