import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deploymentsApi } from '../services/deploymentsApi';

export function useHealth() {
  return useQuery({ queryKey: ['health'], queryFn: deploymentsApi.health, refetchInterval: 10000 });
}

export function useDeploymentStatus() {
  return useQuery({ queryKey: ['deployment-status'], queryFn: deploymentsApi.status, refetchInterval: 10000 });
}

export function useDeploymentActions() {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['deployment-status'] });
    await queryClient.invalidateQueries({ queryKey: ['runs'] });
    await queryClient.invalidateQueries({ queryKey: ['validation-latest'] });
  };

  return {
    start: useMutation({ mutationFn: deploymentsApi.start, onSuccess: invalidate }),
    stop: useMutation({ mutationFn: deploymentsApi.stop, onSuccess: invalidate }),
    restart: useMutation({ mutationFn: deploymentsApi.restart, onSuccess: invalidate }),
    validate: useMutation({ mutationFn: deploymentsApi.validate, onSuccess: invalidate }),
  };
}
