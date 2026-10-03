import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSpecialRules, createSpecialRule, updateSpecialRule, deleteSpecialRule } from '../services/rules.api.js';

export const useSpecialRules = () => {
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['specialRules'],
    queryFn: async () => {
      const res = await getSpecialRules();
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => createSpecialRule(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['specialRules'] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSpecialRule(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['specialRules'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSpecialRule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['specialRules'] })
  });

  return {
    rules: rulesQuery.data || [],
    isLoading: rulesQuery.isLoading,
    createRule: createMutation.mutateAsync,
    updateRule: updateMutation.mutateAsync,
    deleteRule: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
