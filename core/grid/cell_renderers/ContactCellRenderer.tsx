import { CreateCustomerInput } from "@/core/schemas/customer.schema";
import { Mail, Phone } from "lucide-react";

export const ContactCellRenderer = ({
  data,
}: {
  data: CreateCustomerInput;
}) => {
  const email = data?.email;
  const phone = data?.cell_phone || data?.home_phone;

  return (
    <div className="flex items-center gap-2 h-full">
      {email && (
        <div className="flex items-center gap-1 text-blue-600 dark:text-yellow-400">
          <Mail className="h-3 w-3" />
          <span className="text-xs truncate max-w-[120px]">{email}</span>
        </div>
      )}
      {phone && (
        <div className="flex items-center gap-1 text-green-600">
          <Phone className="h-3 w-3" />
          <span className="text-xs">{phone}</span>
        </div>
      )}
      {!email && !phone && (
        <span className="text-muted-foreground text-xs">No contact info</span>
      )}
    </div>
  );
};
