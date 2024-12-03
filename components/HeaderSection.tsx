import { Clock } from "lucide-react";
import { Badge } from "./ui/badge";

function HeaderSection() {
  return (
    <div className="flex items-center justify-end gap-4">
      <Badge className="rounded-lg font-thin text-sm bg-transparent border-[1px] border-white py-2 px-3">
        🏛️ Zeko
      </Badge>
      <Badge className="rounded-lg font-thin text-sm bg-transparent border-[1px] border-white py-2 px-3 flex items-center gap-2">
        <Clock size={16} className="text-red-400" />
        <p>10 Minutes</p>
      </Badge>
    </div>
  );
}

export default HeaderSection;
