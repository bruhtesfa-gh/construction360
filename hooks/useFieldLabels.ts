import { z } from 'zod';
import { useAppSelector } from '../store/hooks';

const fieldLabelSchema = z.object({
  table_name: z.string(),
  column_name: z.string(),
  custom_label: z.string(),
  placeholder_text: z.string().optional(),
  help_text: z.string().optional(),
  is_visible: z.boolean(),
  is_required: z.boolean().optional(),
  validation_rules: z.record(z.string(), z.any()).optional(),
  display_order: z.number().optional(),
  field_group: z.string().optional(),
});

export interface FieldLabelConfig {
  field_label_id: string;
  custom_label: string;
  placeholder_text?: string;
  help_text?: string;
  is_visible: boolean;
  is_required?: boolean;
  validation_rules?: Record<string, any>;
  display_order?: number;
  field_group?: string;
}

export interface UseFieldLabelsReturn {
  getLabel: (columnName: string, defaultLabel: string) => string;
  getPlaceholder: (columnName: string, defaultPlaceholder?: string) => string | undefined;
  getHelpText: (columnName: string) => string | undefined;
  isVisible: (columnName: string) => boolean;
  isRequired: (columnName: string) => boolean | undefined;
  getValidationRules: (columnName: string) => Record<string, any> | undefined;
  getDisplayOrder: (columnName: string) => number | undefined;
  getFieldGroup: (columnName: string) => string | undefined;
  fieldLabels: Record<string, FieldLabelConfig> | undefined;
  isLoading: boolean;
  error: any;
}

/**
 * Hook for accessing customized field labels for a specific table
 * @param tableName - Database table name to get labels for
 * @returns Object with helper functions and field label data
 */
export const useFieldLabels = (tableName: string): UseFieldLabelsReturn => {

  const builderId = useAppSelector((state) => state.user?.userProfile?.builderId);

  const { 
    data: fieldLabels, 
    isLoading, 
    error 
  } = api.fieldLabels.getByTable.useQuery(
    { 
      builderId: builderId!, 
      tableName 
    },
    { 
      enabled: !!builderId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    }
  );

  const getLabel = (columnName: string, defaultLabel: string): string => {
    return fieldLabels?.[columnName]?.custom_label || defaultLabel;
  };

  const getPlaceholder = (columnName: string, defaultPlaceholder?: string): string | undefined => {
    return fieldLabels?.[columnName]?.placeholder_text || defaultPlaceholder;
  };

  const getHelpText = (columnName: string): string | undefined => {
    return fieldLabels?.[columnName]?.help_text;
  };

  const isVisible = (columnName: string): boolean => {
    return fieldLabels?.[columnName]?.is_visible ?? true;
  };

  const isRequired = (columnName: string): boolean | undefined => {
    return fieldLabels?.[columnName]?.is_required;
  };

  const getValidationRules = (columnName: string): Record<string, any> | undefined => {
    return fieldLabels?.[columnName]?.validation_rules;
  };

  const getDisplayOrder = (columnName: string): number | undefined => {
    return fieldLabels?.[columnName]?.display_order;
  };

  const getFieldGroup = (columnName: string): string | undefined => {
    return fieldLabels?.[columnName]?.field_group;
  };

  return {
    getLabel,
    getPlaceholder,
    getHelpText,
    isVisible,
    isRequired,
    getValidationRules,
    getDisplayOrder,
    getFieldGroup,
    fieldLabels,
    isLoading,
    error,
  };
};

/**
 * Hook for managing field labels (admin functionality)
 */
export const useFieldLabelsAdmin = () => {
  const { data: session } = useSession();
  const builderId = session?.user?.builderId;

  const utils = api.useContext();

  const upsertMutation = api.fieldLabels.upsert.useMutation({
    onSuccess: () => {
      // Invalidate cache to refresh labels
      utils.fieldLabels.invalidate();
    },
  });

  const bulkUpsertMutation = api.fieldLabels.bulkUpsert.useMutation({
    onSuccess: () => {
      utils.fieldLabels.invalidate();
    },
  });

  const deleteMutation = api.fieldLabels.delete.useMutation({
    onSuccess: () => {
      utils.fieldLabels.invalidate();
    },
  });

  const upsertFieldLabel = async (data: z.infer<typeof fieldLabelSchema>) => {
    if (!builderId) throw new Error('No builder ID available');
    
    return upsertMutation.mutateAsync({
      builderId,
      ...data,
    });
  };

  const bulkUpsertFieldLabels = async (fieldLabels: z.infer<typeof fieldLabelSchema>[]) => {
    if (!builderId) throw new Error('No builder ID available');
    
    return bulkUpsertMutation.mutateAsync({
      builderId,
      fieldLabels,
    });
  };

  const deleteFieldLabel = async (tableName: string, columnName: string) => {
    if (!builderId) throw new Error('No builder ID available');
    
    return deleteMutation.mutateAsync({
      builderId,
      tableName,
      columnName,
    });
  };

  return {
    upsertFieldLabel,
    bulkUpsertFieldLabels,
    deleteFieldLabel,
    isUpsertLoading: upsertMutation.isPending,
    isBulkUpsertLoading: bulkUpsertMutation.isPending,
    isDeleteLoading: deleteMutation.isPending,
  };
};