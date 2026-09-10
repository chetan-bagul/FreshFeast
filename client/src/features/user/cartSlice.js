import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  kitchenId: null, // a cart can only hold items from one kitchen at a time
  kitchenName: null,
  items: [], // { dishId, name, price, qty }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { dishId, name, price, kitchenId, kitchenName } = action.payload;

      // Switching kitchens clears the cart — mirrors how food delivery apps behave
      if (state.kitchenId && state.kitchenId !== kitchenId) {
        state.items = [];
      }
      state.kitchenId = kitchenId;
      state.kitchenName = kitchenName;

      const existing = state.items.find((i) => i.dishId === dishId);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ dishId, name, price, qty: 1 });
      }
    },
    decreaseItem: (state, action) => {
      const dishId = action.payload;
      const existing = state.items.find((i) => i.dishId === dishId);
      if (!existing) return;
      existing.qty -= 1;
      if (existing.qty <= 0) {
        state.items = state.items.filter((i) => i.dishId !== dishId);
      }
      if (state.items.length === 0) {
        state.kitchenId = null;
        state.kitchenName = null;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.kitchenId = null;
      state.kitchenName = null;
    },
  },
});

export const { addItem, decreaseItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
export const selectCartKitchen = (state) => ({
  id: state.cart.kitchenId,
  name: state.cart.kitchenName,
});
