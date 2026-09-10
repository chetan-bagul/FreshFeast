import { apiSlice } from "../api/apiSlice";

export const deliveryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableTasks: builder.query({
      query: () => "/delivery/available",
      providesTags: ["DeliveryTask"],
    }),
    claimTask: builder.mutation({
      query: (orderId) => ({ url: "/delivery/tasks/claim", method: "POST", body: { orderId } }),
      invalidatesTags: ["DeliveryTask", "Order"],
    }),
    getMyTasks: builder.query({
      query: () => "/delivery/tasks",
      providesTags: ["DeliveryTask"],
    }),
    updateTaskStatus: builder.mutation({
      query: ({ taskId, status }) => ({
        url: `/delivery/tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["DeliveryTask"],
    }),
    getMyEarnings: builder.query({
      query: () => "/delivery/earnings",
      providesTags: ["DeliveryTask"],
    }),
  }),
});

export const { useGetAvailableTasksQuery, useClaimTaskMutation, useGetMyTasksQuery, useUpdateTaskStatusMutation, useGetMyEarningsQuery } = deliveryApi;
