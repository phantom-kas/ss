import api from "@/lib/axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";




 const fetchMomoNetworks = async () => {
  const { data } = await api.get("/recipients/get_bank_options");
  return data.data; 
  // Expected format:
  // [
  //   { name: "MTN", code: "MTN" },
  //   { name: "Vodafone", code: "VOD" },
  //   { name: "AirtelTigo", code: "ATL" }
  // ]
};
export const useMomoNetworks = () => {
  return useQuery({
    queryKey: ["momo-networks"],
    queryFn: fetchMomoNetworks,
    staleTime: 1000 * 60 * 60, // 1 hour (networks rarely change)
    retry: 2,
  });
};
const pageParamEnv = 15

const fetchRecipients = async ({
  pageParam = pageParamEnv,
  method,
}: {
  pageParam?: number;
  method: string | number;
}) => {
  const res = await api.get("/recipients/raw", {
    params: {
      lastId: pageParam,
      limit: 20,
      method,
    },
  });
  // console.log(res.data.data)
  return res.data.data; // assume standardResponse format: { data: [...], meta: {...} }
};

export const useRecipientsInfinite = (method: string) => {
  return useInfiniteQuery({
    queryKey: ["recipients", method],
    queryFn: ({ pageParam }) =>
      fetchRecipients({ pageParam, method }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.length) return undefined;
      return lastPage[lastPage.length - 1].seq_id;
    },
  });
};