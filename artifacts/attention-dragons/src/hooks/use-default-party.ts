import { useEffect, useRef } from 'react';
import { useListParties, useCreateParty, getListPartiesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

export function useDefaultParty(): { partyId: number | null; isLoading: boolean } {
  const queryClient = useQueryClient();
  const creating = useRef(false);

  const { data: parties, isLoading } = useListParties();

  const { mutate: createParty } = useCreateParty({
    mutation: {
      onSuccess: () => {
        creating.current = false;
        queryClient.invalidateQueries({ queryKey: getListPartiesQueryKey() });
      },
      onError: () => {
        creating.current = false;
      },
    },
  });

  useEffect(() => {
    if (!isLoading && parties && parties.length === 0 && !creating.current) {
      creating.current = true;
      createParty({ data: { name: "The Party" } });
    }
  }, [isLoading, parties, createParty]);

  const partyId = parties && parties.length > 0 ? parties[0].id : null;

  return { partyId, isLoading: isLoading || partyId === null };
}
