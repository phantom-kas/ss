import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";




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
