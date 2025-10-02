import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ActionsCellRendererProps<T = any> {
  data: T;
  onEdit: (data: T) => void;
  onDelete: (data: T) => void;
}

export const ActionsCellRenderer = <T,>({
  data,
  onEdit,
  onDelete,
}: ActionsCellRendererProps<T>) => {
  return (
    <div className="flex items-center gap-2 h-full">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(data)}
        className="h-8 w-8 p-0 bg-white dark:bg-white hover:bg-gray-100 dark:hover:bg-gray-200 border-gray-300 dark:border-gray-400 text-gray-700 dark:text-gray-900"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(data)}
        className="h-8 w-8 p-0 bg-white dark:bg-white hover:bg-gray-100 dark:hover:bg-gray-200 border-gray-300 dark:border-gray-400 text-red-600 hover:text-red-700 dark:text-red-600 dark:hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
