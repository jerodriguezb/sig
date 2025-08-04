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
    codcli: '',
    razonsocial: '',
    domicilio: '',
    telefono: '',
    cuit: '',
    email: '',
    activo: true,
    localidad: null, // Objeto { _id, localidad, codigopostal, … }
    ruta: null,      // Objeto { _id, ruta }
  });
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  // ───────────────────────── opciones para selects
  const [locOpts, setLocOpts] = React.useState([]);
  const [rutaOpts, setRutaOpts] = React.useState([]);
  const [loadingOpts, setLoadingOpts] = React.useState(true);

  /** Obtiene listas de localidades y rutas una vez */
  React.useEffect(() => {
    let isMounted = true;
    const fetchOpts = async () => {
      try {
        const [lRes, rRes] = await Promise.all([
          api.get('/localidades'),
          api.get('/rutas'),
        ]);
        if (!isMounted) return;
        setLocOpts(lRes.data.localidades ?? []);
        setRutaOpts(rRes.data.rutas ?? []);
      } catch (err) {
        console.error('Error al obtener opciones:', err);
      } finally {
        if (isMounted) setLoadingOpts(false);
      }
    };
    if (open) fetchOpts();
    return () => {
      isMounted = false;
    };
  }, [open]);

  // ───────────────────────── carga datos cuando cambia `row`
  React.useEffect(() => {
    if (isEdit) {
      const {
        codcli,
        razonsocial,
        domicilio,
        telefono,
        cuit,
        email,
        activo,
        localidad,
        ruta,
      } = row;
      setForm({
        codcli: codcli ?? '',
        razonsocial: razonsocial ?? '',
        domicilio: domicilio ?? '',
        telefono: telefono ?? '',
        cuit: cuit ?? '',
        email: email ?? '',
        activo: Boolean(activo),
        localidad: localidad ?? null,
        ruta: ruta ?? null,
      });
    } else {
      setForm({
        codcli: '',
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

  // ───────────────────────── manejadores
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (e) => {
    setForm((prev) => ({ ...prev, activo: e.target.checked }));
  };

  const validate = () => {
    const errs = {};
    if (!form.razonsocial.trim()) errs.razonsocial = 'Requerido';
    if (!form.cuit.trim()) errs.cuit = 'Requerido';
    if (
      form.email &&
      !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)
    ) {
      errs.email = 'Email inválido';
    }
    if (!form.localidad) errs.localidad = 'Seleccione una localidad';
    if (!form.ruta) errs.ruta = 'Seleccione una ruta';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Preparamos payload: enviamos solo _id de localidad y ruta
      const payload = {
        ...form,
        localidad: form.localidad?._id,
        ruta: form.ruta?._id,
      };
      if (isEdit) {
        await api.put(`/clientes/${row._id}`, payload);
      } else {
        await api.post('/clientes', payload);
      }
      onClose(true); // trigger refresh
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
              name="codcli"
              label="Código (opcional)"
              value={form.codcli}
              onChange={handleChange}
              type="number"
              fullWidth
            />
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
            <TextField
              name="telefono"
              label="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="cuit"
              label="CUIT"
              value={form.cuit}
              onChange={handleChange}
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
            {/* ──────────────── Autocomplete Localidad */}
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
            {/* ──────────────── Autocomplete Ruta */}
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
              control={<Switch checked={form.activo} onChange={handleToggle} />}
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
