import { apiSlice } from "../api/apiSlice";

export const kitchenApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getKitchens: builder.query({
      query: (city) => ({ url: "/kitchens", params: city ? { city } : {} }),
      providesTags: ["Kitchen"],
    }),
    getKitchen: builder.query({
      query: (id) => `/kitchens/${id}`,
      providesTags: (result, error, id) => [{ type: "Kitchen", id }],
    }),
    createKitchen: builder.mutation({
      query: (body) => ({ url: "/kitchens", method: "POST", body }),
      invalidatesTags: ["Kitchen"],
    }),
    updateKitchen: builder.mutation({
      query: ({ kitchenId, ...body }) => ({ url: `/kitchens/${kitchenId}`, method: "PUT", body }),
      invalidatesTags: ["Kitchen", "Dish"],
    }),
    getMyKitchen: builder.query({
      query: () => "/kitchens/mine",
      providesTags: ["Kitchen"],
    }),
    getKitchenDishes: builder.query({
      query: (kitchenId) => `/kitchens/${kitchenId}/dishes`,
      providesTags: (result, error, kitchenId) => [{ type: "Dish", id: kitchenId }],
    }),
    createDish: builder.mutation({
      query: ({ kitchenId, ...body }) => ({
        url: `/kitchens/${kitchenId}/dishes`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { kitchenId }) => [{ type: "Dish", id: kitchenId }],
    }),
    toggleDishAvailability: builder.mutation({
      query: ({ dishId, isAvailable }) => ({
        url: `/dishes/${dishId}/availability`,
        method: "PATCH",
        body: { isAvailable },
      }),
      invalidatesTags: ["Dish"],
    }),
    updateDish: builder.mutation({
      query: ({ dishId, ...body }) => ({ url: `/dishes/${dishId}`, method: "PUT", body }),
      invalidatesTags: ["Dish"],
    }),
    deleteDish: builder.mutation({
      query: (dishId) => ({ url: `/dishes/${dishId}`, method: "DELETE" }),
      invalidatesTags: ["Dish"],
    }),
    getKitchenOrders: builder.query({
      query: ({ kitchenId, status }) => ({
        url: `/kitchens/${kitchenId}/orders`,
        params: status ? { status } : {},
      }),
      providesTags: ["Order"],
    }),
    getDeliveryAgents: builder.query({
      query: () => "/delivery/agents",
      providesTags: ["DeliveryTask"],
    }),
    assignDeliveryAgent: builder.mutation({
      query: ({ kitchenId, orderId, agentId }) => ({ url: `/kitchens/${kitchenId}/orders/${orderId}/assign-delivery`, method: "POST", body: { agentId } }),
      invalidatesTags: ["Order", "DeliveryTask"],
    }),
    getKitchenAnalytics: builder.query({
      query: (kitchenId) => `/kitchens/${kitchenId}/analytics`,
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetKitchensQuery,
  useGetKitchenQuery,
  useCreateKitchenMutation,
  useUpdateKitchenMutation,
  useGetMyKitchenQuery,
  useGetKitchenDishesQuery,
  useCreateDishMutation,
  useToggleDishAvailabilityMutation,
  useUpdateDishMutation,
  useDeleteDishMutation,
  useGetKitchenOrdersQuery,
  useGetDeliveryAgentsQuery,
  useAssignDeliveryAgentMutation,
  useGetKitchenAnalyticsQuery,
  useUpdateOrderStatusMutation,
} = kitchenApi;
