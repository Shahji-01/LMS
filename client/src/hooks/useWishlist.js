import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../constants/queryKeys";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ courseId, action }) => {
            // action is either "add" or "remove"
            if (action === "add") {
                await api.post(`/user/wishlist/${courseId}`);
            } else {
                await api.delete(`/user/wishlist/${courseId}`);
            }
            return { courseId, action };
        },
        onMutate: async ({ courseId, action }) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
            const previousProfile = queryClient.getQueryData([QUERY_KEYS.USER_PROFILE]);

            queryClient.setQueryData([QUERY_KEYS.USER_PROFILE], (old) => {
                if (!old) return old;
                // Safely update profile's wishlist array
                const user = old.data || old;
                const prevWishlist = user.wishlist || [];
                
                let newWishlist;
                if (action === "add") {
                    newWishlist = [...prevWishlist, courseId];
                } else {
                    newWishlist = prevWishlist.filter(id => id !== courseId);
                }

                return {
                    ...old,
                    data: {
                        ...user,
                        wishlist: newWishlist
                    }
                };
            });

            return { previousProfile };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData([QUERY_KEYS.USER_PROFILE], context.previousProfile);
            toast.error("Failed to update wishlist");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST] });
        }
    });
};
