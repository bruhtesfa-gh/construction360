import { useSession } from 'next-auth/react';
import { api } from '../app/providers';

export function useUserGridSettings() {
  const { data: session } = useSession();
  const builderId = session?.user?.builderId;
  const userId = session?.user?.id;

  const { data: currentUser } = api.users.getById.useQuery(
    { builderId: builderId!, userId: userId! },
    { enabled: !!builderId && !!userId }
  );

  return {
    defaultPageSize: currentUser?.default_grid_page_size || 50,
    isLoading: !currentUser,
  };
}