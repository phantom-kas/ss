import { Building } from "lucide-react";
import { useMomoNetworks } from "@/hooks/useMomoNetworks";

export default function MomoNetworkSelect({
  value,
  onChange,
  disabled,
}: Props) {
  const { data: networks, isLoading } = useMomoNetworks();

  const handleChange = (code: string) => {
    const selected = networks?.find((n: any) => n.code === code);

    if (!selected) {
      onChange(null);
      return;
    }

    onChange({
      code: selected.code,
      name: selected.name,
    });
  };

  return (
    <div className="relative">
      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 z-10" />

      <select
        className="w-full pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
        value={value}
        disabled={disabled || isLoading}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">
          {isLoading ? "Loading networks..." : "Select network"}
        </option>

        {networks?.map((network: any) => (
          <option key={network.code} value={network.code}>
            {network.name}
          </option>
        ))}
      </select>
    </div>
  );
}
