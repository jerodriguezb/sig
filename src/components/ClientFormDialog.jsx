// File: src/components/ClientFormDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Switch,
  FormControlLabel,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import api from '../api/axios.js';

export default function ClientFormDialog({ open, onClose, row }) {
  const isEdit = Boolean(row);

  // ───────────────────────── estado del formulario
  const [form, setForm] = React.useState({
    razonsocial: '',
    domicilio: '',
    telefono: '',
    cuit: '',
    email: '',
    activo: true,
    localidad: null,
    ruta: null,
  });
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  // ───────────────────────── opciones Select
  const [locOpts, setLocOpts]   = React.useState([]);
  const [rutaOpts, setRutaOpts] = React.useState([]);
  const [loadingOpts, setLoadingOpts] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const fetchOpts = async () => {
      try {
        const [lRes, rRes] = await Promise.all([
          api.get('/localidades'),
          api.get('/rutas'),
        ]);
        if (isMounted) {
          setLocOpts(lRes.data.localidades ?? []);
          setRutaOpts(rRes.data.rutas ?? []);
          setLoadingOpts(false);
        }
      } catch (err) {
        console.error('Error al obtener opciones:', err);
        if (isMounted) setLoadingOpts(false);
      }
    };
    if (open) fetchOpts();
    return () => { isMounted = false; };
  }, [open]);

  // ───────────────────────── carga fila a editar
  React.useEffect(() => {
    if (isEdit) {
      const {
        razonsocial, domicilio, telefono,
        cuit, email, activo, localidad, ruta,
      } = row;
      setForm({
        razonsocial: razonsocial ?? '',
        domicilio:   domicilio   ?? '',
        telefono:    telefono    ?? '',
        cuit:        cuit        ?? '',
        email:       email       ?? '',
        activo:      Boolean(activo),
        localidad:   localidad   ?? null,
        ruta:        ruta        ?? null,
      });
    } else {
      setForm({
        razonsocial: '',
        domicilio: '',
        telefono: '',
        cuit: '',
        email: '',
        activo: true,
        localidad: null,
        ruta: null,
      });
    }
    setErrors({});
  }, [row, isEdit]);

  // ───────────────────────── handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleToggle = (e) =>
    setForm((prev) => ({ ...prev, activo: e.target.checked }));

  // ───────────────────────── validación
  const validate = () => {
    const errs = {};

    if (!form.razonsocial.trim()) errs.razonsocial = 'Requerido';

    // Teléfono: 10 dígitos exactos
    if (!/^\d{10}$/.test(form.telefono))
      errs.telefono = 'Debe contener 10 dígitos numéricos';

    // CUIT: 1–11 dígitos numéricos
    if (!form.cuit.trim()) {
      errs.cuit = 'Requerido';
    } else if (!/^\d{11}$/.test(form.cuit)) {
      errs.cuit = 'Sólo números (máx. 11 dígitos)';
    }

    if (
      form.email &&
      !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)
    ) errs.email = 'Email inválido';

    if (!form.localidad) errs.localidad = 'Seleccione una localidad';
    if (!form.ruta)      errs.ruta      = 'Seleccione una ruta';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ───────────────────────── submit
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        localidad: form.localidad?._id,
        ruta:      form.ruta?._id,
      };
      if (isEdit) {
        await api.put(`/clientes/${row._id}`, payload);
      } else {
        await api.post('/clientes', payload);
      }
      onClose(true); // refrescar tabla
    } catch (err) {
      console.error('Error al guardar:', err);
    } finally {
      setSaving(false);
    }
  };

  // ───────────────────────── render
  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>

      <DialogContent dividers>
        {loadingOpts ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              name="razonsocial"
              label="Razón social"
              value={form.razonsocial}
              onChange={handleChange}
              error={Boolean(errors.razonsocial)}
              helperText={errors.razonsocial}
              required
              fullWidth
            />

            <TextField
              name="domicilio"
              label="Domicilio"
              value={form.domicilio}
              onChange={handleChange}
              fullWidth
            />

            {/* Teléfono (10 dígitos) */}
            <TextField
              name="telefono"
              label="Teléfono (10 dígitos)"
              value={form.telefono}
              onChange={handleChange}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 10,
              }}
              error={Boolean(errors.telefono)}
              helperText={errors.telefono}
              required
              fullWidth
            />

            {/* CUIT (1–11 dígitos) */}
            <TextField
              name="cuit"
              label="CUIT"
              value={form.cuit}
              onChange={handleChange}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 11,
              }}
              error={Boolean(errors.cuit)}
              helperText={errors.cuit}
              required
              fullWidth
            />

            <TextField
              name="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
            />

            {/* Autocomplete Localidad */}
            <Autocomplete
              options={locOpts}
              getOptionLabel={(opt) =>
                `${opt.localidad} (${opt.codigopostal})`
              }
              value={form.localidad}
              onChange={(_, newVal) =>
                setForm((prev) => ({ ...prev, localidad: newVal }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Localidad"
                  error={Boolean(errors.localidad)}
                  helperText={errors.localidad}
                  required
                />
              )}
            />

            {/* Autocomplete Ruta */}
            <Autocomplete
              options={rutaOpts}
              getOptionLabel={(opt) => opt.ruta}
              value={form.ruta}
              onChange={(_, newVal) =>
                setForm((prev) => ({ ...prev, ruta: newVal }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ruta"
                  error={Boolean(errors.ruta)}
                  helperText={errors.ruta}
                  required
                />
              )}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.activo}
                  onChange={handleToggle}
                />
              }
              label="Activo"
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || loadingOpts}
        >
          {isEdit ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
