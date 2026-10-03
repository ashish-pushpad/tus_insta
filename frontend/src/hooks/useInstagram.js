import { useQuery } from '@tanstack/react-query';
import { getAccount, getMedia, getConnectUrl } from '../services/instagram.api.js';

export const useInstagram = () => {

  const accountQuery = useQuery({
    queryKey: ['instagramAccount'],
    queryFn: async () => {
      const res = await getAccount();
      return res.data.data;
    }
  });

  const mediaQuery = useQuery({
    queryKey: ['instagramMedia', accountQuery.data?.id],
    queryFn: async () => {
      const res = await getMedia(accountQuery.data?.id);
      return res.data.data;
    },
    enabled: !!accountQuery.data
  });

  const connectAccount = async () => {
    console.log("useInstagram calll !!!!!!!!!!!!!")
    const res = await getConnectUrl();
  
    if (res.data.data?.url) {
      console.log(res.data.data.url)
      window.location.href = res.data.data.url;
    }
  };

  return {
    account: accountQuery.data,
    media: mediaQuery.data || [],
    isLoading: accountQuery.isLoading || mediaQuery.isLoading,
    refetchMedia: mediaQuery.refetch,
    connectAccount
  };
};
