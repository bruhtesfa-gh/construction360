# DataGrid Component - Inline Editing Guide

The DataGrid component now supports inline editing using AG-Grid Community Edition features.

## Enabling Inline Editing

To enable inline editing in your DataGrid:

```tsx
<DataGrid
  data={contacts}
  columnDefs={columnDefs}
  excelColumns={excelColumns}
  enableEditing={true}  // Enable editing
  onCellValueChanged={(event) => {
    // Handle the cell value change
    console.log('Cell changed:', event.data);
    // Update your data source here
  }}
/>
```

## Column-Specific Editing

You can control which columns are editable:

```tsx
const columnDefs = [
  {
    field: 'name',
    headerName: 'Name',
    editable: true,  // This column is editable
  },
  {
    field: 'email',
    headerName: 'Email',
    editable: true,
  },
  {
    field: 'id',
    headerName: 'ID',
    editable: false,  // This column is NOT editable
  },
];
```

## Custom Cell Editors

You can use custom cell editors for specific columns:

```tsx
const columnDefs = [
  {
    field: 'status',
    headerName: 'Status',
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['Active', 'Inactive', 'Pending'],
    },
  },
  {
    field: 'date',
    headerName: 'Date',
    editable: true,
    cellEditor: 'agDateCellEditor',
  },
];
```

## Handling Value Changes

```tsx
const handleCellValueChanged = async (event: CellValueChangedEvent) => {
  const { data, colDef, newValue, oldValue } = event;
  
  // Only process if value actually changed
  if (newValue === oldValue) return;
  
  try {
    // Update your backend
    await updateRecord(data.id, { [colDef.field]: newValue });
    
    // Show success message
    toast.success('Updated successfully');
  } catch (error) {
    // Revert the change on error
    event.node.setDataValue(colDef.field, oldValue);
    toast.error('Failed to update');
  }
};
```

## Validation

You can add validation to your editable cells:

```tsx
const columnDefs = [
  {
    field: 'email',
    headerName: 'Email',
    editable: true,
    valueSetter: (params) => {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(params.newValue)) {
        // Show error and prevent update
        toast.error('Invalid email format');
        return false;
      }
      params.data[params.column.getColId()] = params.newValue;
      return true;
    },
  },
];
```

## Keyboard Navigation

- **Double-click** or **Enter**: Start editing
- **Tab**: Move to next editable cell
- **Shift+Tab**: Move to previous editable cell
- **Escape**: Cancel editing
- **Enter**: Confirm edit and move down

## Example Implementation

```tsx
export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  
  const columnDefs = [
    { field: 'name', editable: true },
    { field: 'email', editable: true },
    { field: 'phone', editable: true },
    { 
      field: 'status', 
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['Active', 'Inactive'] }
    },
  ];
  
  const handleCellValueChanged = async (event) => {
    try {
      await api.contacts.update.mutate({
        id: event.data.id,
        [event.colDef.field]: event.newValue,
      });
    } catch (error) {
      // Revert on error
      event.node.setDataValue(event.colDef.field, event.oldValue);
    }
  };
  
  return (
    <DataGrid
      data={contacts}
      columnDefs={columnDefs}
      enableEditing={true}
      onCellValueChanged={handleCellValueChanged}
    />
  );
}
```

## Limitations in Community Edition

The Community Edition provides robust editing features, but some advanced features require the Enterprise license:

- ✅ **Available**: Cell editing, custom editors, validation, keyboard navigation
- ❌ **Enterprise Only**: Full row editing, undo/redo, clipboard operations with editing