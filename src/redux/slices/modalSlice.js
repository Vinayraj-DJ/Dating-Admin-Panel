import { createSlice } from "@reduxjs/toolkit";

const modalSlice = createSlice({
  name: "modal",
  initialState: {
    isOpen: false,
    type: "",
    data : null,
 
  },

  reducers: {
    openModal: (state, action) => {
      state.isOpen = true;
      state.type = action.payload?.type || action.payload;
      state.data = action.payload?.data || null ;
     
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.type = "";
      state.data = null ;
    }
  
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
