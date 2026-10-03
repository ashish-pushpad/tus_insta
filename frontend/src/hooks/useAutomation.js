import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAutomations, updateAutomation } from '../services/automation.api.js';

export const useAutomation = () => {
  const queryClient = useQueryClient();

  const automationsQuery = useQuery({
    queryKey: ['automations'],
    queryFn: async () => {
      const res = await getAutomations();
      return res.data.data;
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (payload) => updateAutomation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      queryClient.invalidateQueries({ queryKey: ['instagramMedia'] });
    }
  });

  return {
    automations: automationsQuery.data || [],
    isLoading: automationsQuery.isLoading,
    toggleAutomation: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending
  };
};
