// File: src/components/ClientTable.jsx
import React from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import api from '../api/axios.js';

export default function ClientTable({ onEdit }) {
  // ───────────────────────── state
  const [rows, setRows]   = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // ───────────────────────── fetch
  const fetchData = async () => {
    setLoading(true);
    try {
      // backend → http://localhost:3000/clientes
      const { data } = await api.get('/clientes');   // { ok, clientes, cantidad }
      setRows(data.clientes ?? []);
    } catch (err) {
      console.error('Error al obtener clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // ───────────────────────── columnas
  const columns = React.useMemo(
    () => [
      { field: 'codcli',      headerName: 'Código',      width: 100 },
      { field: 'razonsocial', headerName: 'Razón Social', flex: 1, minWidth: 200 },
      { field: 'domicilio',   headerName: 'Domicilio',    flex: 1.2, minWidth: 200 },
      { field: 'telefono',    headerName: 'Teléfono',    width: 130 },
      { field: 'email',       headerName: 'E-mail',       flex: 1, minWidth: 200 },
      { field: 'cuit',        headerName: 'CUIT',        width: 140 },
      {
        field: 'localidad',
        headerName: 'Localidad',
        width: 120,
        valueGetter: (params) => params?.row?.localidad?.localidad ?? '',
      },
      {
        field: 'ruta',
        headerName: 'Ruta',
        width: 110,
        valueGetter: (params) => params?.row?.ruta?.ruta ?? '',
      },
      { field: 'activo',      headerName: 'Activo', type: 'boolean', width: 90 },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Acciones',
        width: 90,
        getActions: (params) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Editar"
            onClick={() => onEdit(params.row)}
          />,
        ],
      },
    ],
    [onEdit],
  );

  // ───────────────────────── render
  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row._id}      // usa _id de Mongo como identificador
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
      />
    </div>
  );
}
