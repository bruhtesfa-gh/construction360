import { Badge } from "../../../components/ui/badge";

export const ActiveStatusCellRenderer = ({ value }: { value: boolean }) => {
  return (
    <Badge
      className={
        value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }
    >
      {value ? "Active" : "Inactive"}
    </Badge>
  );
};
