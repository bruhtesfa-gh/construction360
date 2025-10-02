import { Badge } from "../../../components/ui/badge";

export const ContactTypeCellRenderer = ({
  value,
}: {
  value: string | null;
}) => {
  if (!value) return null;
  const typeColors: Record<string, string> = {
    Customer: "bg-green-100 text-green-800",
    Vendor: "bg-blue-100 text-blue-800",
    Partner: "bg-purple-100 text-purple-800",
    Employee: "bg-orange-100 text-orange-800",
    Other: "bg-gray-100 text-gray-800",
  };
  return (
    <Badge className={typeColors[value] || "bg-gray-100 text-gray-800"}>
      {value}
    </Badge>
  );
};
