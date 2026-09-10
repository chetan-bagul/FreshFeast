import { apiSlice } from "../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHomeFeed: builder.query({
      query: ({ search, category, pincode } = {}) => ({
        url: "/dishes/home-feed",
        params: { ...(search && { search }), ...(category && { category }), ...(pincode && { pincode }) },
      }),
      providesTags: ["Dish"],
    }),
    placeOrder: builder.mutation({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),
    getMyOrders: builder.query({
      query: () => "/orders/mine",
      providesTags: ["Order"],
    }),
    cancelOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetHomeFeedQuery,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} = userApi;
