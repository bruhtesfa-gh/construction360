import { Button } from "../../../components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Contact } from "../../../types/database";

export const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}) => {
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={() => onEdit(data)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onDelete(data)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
