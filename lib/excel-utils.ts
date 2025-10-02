import * as XLSX from 'xlsx';

export interface ExcelColumn {
  field: string;
  header?: string;
  headerName?: string;
  required?: boolean;
  type?: 'string' | 'number' | 'date' | 'boolean';
  defaultValue?: any;
  valueFormatter?: (params: { value: any }) => string;
}

export const downloadExcelTemplate = (columns: ExcelColumn[], filename: string) => {
  // Check if columns is defined and is an array
  if (!columns || !Array.isArray(columns)) {
    console.error('downloadExcelTemplate: columns parameter is undefined or not an array', columns);
    alert('Error: Excel columns configuration is missing');
    return;
  }

  // Additional safety check for empty array
  if (columns.length === 0) {
    console.error('downloadExcelTemplate: columns array is empty');
    alert('Error: No columns defined for Excel template');
    return;
  }

  console.log('downloadExcelTemplate called with:', { 
    columnsLength: columns?.length || 0, 
    filename,
    isClient: typeof window !== 'undefined',
    hasXLSX: typeof XLSX !== 'undefined',
    hasUtils: typeof XLSX !== 'undefined' && !!XLSX.utils,
    hasBookNew: typeof XLSX !== 'undefined' && !!XLSX.utils?.book_new
  });

  // This function should only run on the client side
  if (typeof window === 'undefined') {
    console.error('downloadExcelTemplate can only be run in the browser');
    return;
  }

  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    console.log('Workbook created successfully');
  
    // Create headers - support both header and headerName
    const headers = columns && Array.isArray(columns) ? columns.map(col => {
      if (!col || typeof col !== 'object') {
        console.warn('Invalid column object:', col);
        return 'Column';
      }
      const headerValue = col.header || col.headerName || col.field || 'Column';
      return String(headerValue);
    }) : [];
    
    // Create sample data row with placeholder values
    const sampleRow = columns && Array.isArray(columns) ? columns.map(col => {
      if (!col || typeof col !== 'object') return '';
      if (col.defaultValue !== undefined) return col.defaultValue;
      switch (col.type) {
        case 'number': return 0;
        case 'date': return new Date().toISOString().split('T')[0];
        case 'boolean': return 'Yes';
        default: return `Sample ${col.header || col.headerName || col.field}`;
      }
    }) : [];
    
    // Create worksheet data with headers and one sample row
    const wsData = [headers, sampleRow];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = headers.map(header => ({ 
      wch: Math.max((header || '').length + 5, 15) 
    }));
    ws['!cols'] = colWidths;
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  
    // Create a second sheet with instructions
    const columnDescriptions = columns && Array.isArray(columns) ? columns.map(col => {
      if (!col || typeof col !== 'object') return ['Unknown', 'Optional', 'text'];
      return [
        col.header || col.headerName || col.field || 'Unknown',
        col.required ? 'Required' : 'Optional',
        col.type || 'text'
      ];
    }) : [];
    
    const instructions = [
      ['Instructions for Data Import'],
      [''],
      ['1. Fill in the data starting from row 2'],
      ['2. Do not modify the header row'],
      ['3. Required fields are marked with * in the header'],
      ['4. Date format: YYYY-MM-DD'],
      ['5. Boolean fields: Use Yes/No or True/False'],
      [''],
      ['Column Descriptions:'],
      ...columnDescriptions
    ];
  
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
  
  // Write the file - ensure .xlsx extension
  const fullFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  console.log('About to write file:', fullFilename);
  XLSX.writeFile(wb, fullFilename);
  console.log('Excel template download completed');
  } catch (error: any) {
    console.error('Error in downloadExcelTemplate:', {
      error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    alert(`Failed to download Excel template: ${error?.message || 'Unknown error'}`);
    throw error;
  }
};

export const exportToExcel = (data: any[], columns: ExcelColumn[], filename: string) => {
  // This function should only run on the client side
  if (typeof window === 'undefined') {
    console.error('exportToExcel can only be run in the browser');
    return;
  }

  // Check if columns is defined and is an array
  if (!columns || !Array.isArray(columns)) {
    console.error('exportToExcel: columns parameter is undefined or not an array');
    alert('Error: Excel columns configuration is missing');
    return;
  }

  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Create headers - support both header and headerName
  const headers = columns && Array.isArray(columns) ? columns.map(col => {
    if (!col || typeof col !== 'object') {
      console.warn('Invalid column object in exportToExcel:', col);
      return 'Column';
    }
    const headerValue = col.header || col.headerName || col.field || 'Column';
    return String(headerValue);
  }) : [];
  
  // Map data to match column order
  const rows = data && Array.isArray(data) ? data.map(item => {
    if (!item || typeof item !== 'object') return [];
    return columns && Array.isArray(columns) ? columns.map(col => {
      if (!col || typeof col !== 'object') return '';
      const value = item[col.field];
      if (value === null || value === undefined) return '';
      if (col.valueFormatter) {
        try {
          return col.valueFormatter({ value });
        } catch (e) {
          console.error('Error in valueFormatter:', e);
          return String(value);
        }
      }
      if (col.type === 'date' && value) {
        try {
          return new Date(value).toLocaleDateString();
        } catch (e) {
          return String(value);
        }
      }
      if (col.type === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return value;
    }) : [];
  }) : [];
  
  // Create worksheet data with headers
  const wsData = [headers, ...rows];
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  const colWidths = headers.map((header, index) => {
    const headerLength = (header || '').length;
    const maxLength = Math.max(
      headerLength,
      ...rows.map(row => String(row[index] || '').length)
    );
    return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
  });
  ws['!cols'] = colWidths;
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  // Write the file - ensure .xlsx extension
  const fullFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, fullFilename);
};


export const parseExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          dateNF: 'yyyy-mm-dd'
        });
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const validateImportData = (
  data: any[], 
  columns: ExcelColumn[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    errors.push('No data found in the file');
    return { valid: false, errors };
  }
  
  if (!columns || !Array.isArray(columns)) {
    errors.push('Column configuration is missing');
    return { valid: false, errors };
  }
  
  // Check for required columns
  const requiredColumns = columns.filter(col => col && col.required);
  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    errors.push('Invalid data format in the file');
    return { valid: false, errors };
  }
  const headers = Object.keys(firstRow);
  
  requiredColumns.forEach(col => {
    const headerName = col.header || col.headerName || col.field;
    if (!headers.some(h => h.toLowerCase() === headerName.toLowerCase())) {
      errors.push(`Required column "${headerName}" not found`);
    }
  });
  
  // Validate each row
  data.forEach((row, index) => {
    requiredColumns.forEach(col => {
      const headerName = col.header || col.headerName || col.field;
      const value = row[headerName];
      if (!value && value !== 0 && value !== false) {
        errors.push(`Row ${index + 2}: Required field "${headerName}" is empty`);
      }
    });
    
    // Type validation
    columns.forEach(col => {
      const headerName = col.header || col.headerName || col.field;
      const value = row[headerName];
      if (value && col.type) {
        switch (col.type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`Row ${index + 2}: "${headerName}" must be a number`);
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              errors.push(`Row ${index + 2}: "${headerName}" must be a valid date`);
            }
            break;
          case 'boolean':
            const boolValue = String(value).toLowerCase();
            if (!['yes', 'no', 'true', 'false', '1', '0'].includes(boolValue)) {
              errors.push(`Row ${index + 2}: "${headerName}" must be Yes/No or True/False`);
            }
            break;
        }
      }
    });
  });
  
  return { valid: errors.length === 0, errors };
};

export const importFromExcel = async (file: File, columns: ExcelColumn[]): Promise<any[]> => {
  const data = await parseExcelFile(file);
  const { valid, errors } = validateImportData(data, columns);
  
  if (!valid) {
    throw new Error(`Import validation failed:\n${errors.join('\n')}`);
  }
  
  return mapImportData(data, columns);
};

export const mapImportData = (data: any[], columns: ExcelColumn[]): any[] => {
  if (!data || !Array.isArray(data)) return [];
  if (!columns || !Array.isArray(columns)) return [];
  
  return data.map(row => {
    if (!row || typeof row !== 'object') return {};
    const mappedRow: any = {};
    
    columns.forEach(col => {
      if (!col || typeof col !== 'object') return;
      const headerName = col.header || col.headerName || col.field;
      const value = row[headerName];
      const fieldName = col.field;
      
      if (value === null || value === undefined || value === '') {
        if (col.defaultValue !== undefined) {
          mappedRow[fieldName] = col.defaultValue;
        }
        // If no default value, don't set the field at all (omit it)
        return;
      }
      
      switch (col.type) {
        case 'number':
          mappedRow[fieldName] = Number(value);
          break;
        case 'date':
          mappedRow[fieldName] = new Date(value).toISOString();
          break;
        case 'boolean':
          const boolValue = String(value).toLowerCase();
          mappedRow[fieldName] = ['yes', 'true', '1'].includes(boolValue);
          break;
        default:
          const trimmedValue = String(value).trim();
          if (trimmedValue) {
            mappedRow[fieldName] = trimmedValue;
          }
          // If empty string after trim, omit the field
      }
    });
    
    return mappedRow;
  });
};