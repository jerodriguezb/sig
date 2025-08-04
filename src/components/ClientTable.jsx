// File: src/components/ClientTable.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  DataGrid,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Typography, Button, Stack } from '@mui/material';
import api from '../api/axios.js';

// ───────── footer con total de códigos
function CustomFooter({ totalCodcli }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        px: 2,
        py: 0.5,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle1">
        Total Código: {totalCodcli}
      </Typography>
    </Box>
  );
}

// ───────── tabla principal
const ClientTable = forwardRef(function ClientTable({ onEdit }, ref) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  // paginación
  const [page, setPage]       = useState(0);   // 0-based
  const pageSize              = 10;
  const [rowCount, setCount]  = useState(0);

  /* ------------------------- fetch datos ------------------------- */
  const fetchData = async (pageParam) => {
    setLoading(true);
    try {
      const { data } = await api.get('/clientes', {
        params: { limit: pageSize, page: pageParam + 1 }, // backend 1-based
      });
      const flat = (data.clientes ?? []).map((c) => ({
        ...c,
        localidadNombre: c.localidad?.localidad ?? '',
        rutaNombre:      c.ruta?.ruta          ?? '',
      }));
      setRows(flat);
      setCount(data.total || 0);
    } catch (err) {
      console.error('Error al obtener clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  /* carga inicial */
  useEffect(() => { fetchData(0); }, []);

  /* expone refresh */
  useImperativeHandle(ref, () => ({
    refresh: () => fetchData(page),
  }));

  /* total codcli para el footer */
  const totalCodcli = useMemo(
    () => rows.reduce((acc, r) => acc + (+r.codcli || 0), 0),
    [rows],
  );

  /* columnas */
  const columns = useMemo(
    () => [
      { field: 'codcli', headerName: 'Código', width: 100, type: 'number' },
      { field: 'razonsocial', headerName: 'Razón Social', flex: 1, minWidth: 200 },
      { field: 'domicilio', headerName: 'Domicilio', flex: 1.2, minWidth: 200 },
      { field: 'telefono', headerName: 'Teléfono', width: 130 },
      { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 200 },
      { field: 'cuit', headerName: 'CUIT', width: 140 },
      { field: 'localidadNombre', headerName: 'Localidad', width: 120 },
      { field: 'rutaNombre', headerName: 'Ruta', width: 110 },
      { field: 'activo', headerName: 'Activo', type: 'boolean', width: 90 },
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

  /* total de páginas */
  const totalPages = Math.ceil(rowCount / pageSize);

  /* helpers */
  const goToPage = (newPage) => {
    setPage(newPage);
    fetchData(newPage);
  };

  /* ------------------------- render ------------------------- */
  return (
    <Stack spacing={1}>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          pagination
          paginationMode="server"
          rowCount={rowCount}
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => goToPage(newPage)}
          disableRowSelectionOnClick
          slots={{ footer: CustomFooter }}
          slotProps={{ footer: { totalCodcli } }}
          hideFooterPagination           // ocultamos paginador built-in si prefieres
        />
      </Box>

      {/* Botones de navegación */}
      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button
          variant="outlined"
          onClick={() => goToPage(page - 1)}
          disabled={loading || page === 0}
        >
          Anterior
        </Button>

        <Button
          variant="outlined"
          onClick={() => goToPage(page + 1)}
          disabled={loading || page + 1 >= totalPages}
        >
          Siguiente
        </Button>
      </Box>
    </Stack>
  );
});

export default ClientTable;
