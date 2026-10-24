'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
  FormControl, InputLabel, Alert, IconButton
} from '@mui/material';
import { Add, Delete, Refresh, LocalOffer, CheckCircle, Cancel } from '@mui/icons-material';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FLAT_INR';
  value: number;
  minOrderValue: number;
  maxUsageLimit: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'FITNEW50',
    type: 'PERCENTAGE',
    value: 50,
    minOrderValue: 999,
    maxUsageLimit: 500,
    usedCount: 142,
    expiresAt: '2026-12-31',
    active: true,
  },
  {
    id: 'cpn-2',
    code: 'EMPIRE500',
    type: 'FLAT_INR',
    value: 500,
    minOrderValue: 1999,
    maxUsageLimit: 200,
    usedCount: 78,
    expiresAt: '2026-11-30',
    active: true,
  },
  {
    id: 'cpn-3',
    code: 'CORPORATE20',
    type: 'PERCENTAGE',
    value: 20,
    minOrderValue: 499,
    maxUsageLimit: 1000,
    usedCount: 384,
    expiresAt: '2027-01-31',
    active: true,
  },
];

export function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const cached = localStorage.getItem('fitempire_admin_coupons');
    return cached ? JSON.parse(cached) : INITIAL_COUPONS;
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FLAT_INR'>('PERCENTAGE');
  const [value, setValue] = useState<string>('10');
  const [minOrder, setMinOrder] = useState<string>('499');
  const [maxUsage, setMaxUsage] = useState<string>('100');
  const [expiresAt, setExpiresAt] = useState('2026-12-31');
  const [validationError, setValidationError] = useState<string | null>(null);

  const saveCoupons = (updated: Coupon[]) => {
    setCoupons(updated);
    localStorage.setItem('fitempire_admin_coupons', JSON.stringify(updated));
  };

  // 🛡️ FE-125: Strict Validation Guard against negative values & zero limits
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const numValue = Number(value);
    const numMinOrder = Number(minOrder);
    const numMaxUsage = Number(maxUsage);

    if (!code.trim()) {
      setValidationError('Coupon code is required.');
      return;
    }

    if (isNaN(numValue) || numValue <= 0) {
      setValidationError('Discount value must be strictly greater than 0.');
      return;
    }

    if (type === 'PERCENTAGE' && numValue > 100) {
      setValidationError('Percentage discount cannot exceed 100%.');
      return;
    }

    if (isNaN(numMaxUsage) || numMaxUsage <= 0) {
      setValidationError('Maximum usage limit must be at least 1.');
      return;
    }

    if (isNaN(numMinOrder) || numMinOrder < 0) {
      setValidationError('Minimum order value cannot be negative.');
      return;
    }

    const newCoupon: Coupon = {
      id: 'cpn-' + Date.now().toString().slice(-4),
      code: code.trim().toUpperCase(),
      type,
      value: numValue,
      minOrderValue: numMinOrder,
      maxUsageLimit: numMaxUsage,
      usedCount: 0,
      expiresAt,
      active: true,
    };

    saveCoupons([newCoupon, ...coupons]);
    setDialogOpen(false);
    setCode('');
    setValue('10');
    setMinOrder('499');
    setMaxUsage('100');
  };

  const toggleStatus = (id: string) => {
    saveCoupons(
      coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleDelete = (id: string) => {
    saveCoupons(coupons.filter((c) => c.id !== id));
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#F0F0FF' }}>
            Promotional Coupons & Discount Rules
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage checkout vouchers, percentage discounts, and corporate subsidies
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 2.5,
            px: 2.5,
          }}
        >
          Create New Coupon
        </Button>
      </Box>

      {/* Coupons Table */}
      <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(108, 99, 255, 0.08)' }}>
              <TableRow>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Discount</TableCell>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Min Order</TableCell>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Usage Limit</TableCell>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Expires On</TableCell>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ color: '#F0F0FF', fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id} hover sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.03)' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalOffer sx={{ color: '#6C63FF', fontSize: 18 }} />
                      <Typography sx={{ fontWeight: 800, color: '#38BDF8', fontFamily: 'monospace' }}>
                        {coupon.code}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#43D787' }}>
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT OFF`}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>₹{coupon.minOrderValue}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {coupon.usedCount} / {coupon.maxUsageLimit} used
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{coupon.expiresAt}</TableCell>
                  <TableCell>
                    <Chip
                      label={coupon.active ? 'ACTIVE' : 'DISABLED'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        backgroundColor: coupon.active ? 'rgba(67, 215, 135, 0.15)' : 'rgba(255, 87, 87, 0.15)',
                        color: coupon.active ? '#43D787' : '#FF5757',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => toggleStatus(coupon.id)}
                      sx={{ textTransform: 'none', color: '#94A3B8', mr: 1 }}
                    >
                      {coupon.active ? 'Disable' : 'Enable'}
                    </Button>
                    <IconButton size="small" onClick={() => handleDelete(coupon.id)} sx={{ color: '#FF5757' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Coupon Modal with Strict Non-Negative / Non-Zero Validation (FE-125) */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: '#0F172A',
            border: '1px solid rgba(108, 99, 255, 0.3)',
            borderRadius: 3,
            color: '#F0F0FF',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          Create Promotional Coupon
        </DialogTitle>

        <form onSubmit={handleCreateCoupon}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
            {validationError && (
              <Alert severity="error" sx={{ backgroundColor: 'rgba(255, 87, 87, 0.15)', color: '#FF8080' }}>
                {validationError}
              </Alert>
            )}

            <TextField
              label="Coupon Promo Code"
              fullWidth
              required
              placeholder="e.g. SUMMER50"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              InputLabelProps={{ style: { color: '#94A3B8' } }}
              sx={{ input: { color: '#FFF' } }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#94A3B8' }}>Discount Type</InputLabel>
                <Select
                  value={type}
                  label="Discount Type"
                  onChange={(e) => setType(e.target.value as any)}
                  sx={{ color: '#FFF' }}
                >
                  <MenuItem value="PERCENTAGE">Percentage (% OFF)</MenuItem>
                  <MenuItem value="FLAT_INR">Flat Discount (₹ OFF)</MenuItem>
                </Select>
              </FormControl>

              {/* 🛡️ Strict min="1" validation preventing negative/zero values (FE-125) */}
              <TextField
                label={type === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                type="number"
                required
                inputProps={{ min: '1', max: type === 'PERCENTAGE' ? '100' : '10000', step: '1' }}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                helperText="Must be greater than 0"
                FormHelperTextProps={{ style: { color: '#64748B' } }}
                InputLabelProps={{ style: { color: '#94A3B8' } }}
                sx={{ input: { color: '#FFF' } }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Minimum Order Value (₹)"
                type="number"
                inputProps={{ min: '0', step: '1' }}
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                InputLabelProps={{ style: { color: '#94A3B8' } }}
                sx={{ input: { color: '#FFF' } }}
              />

              <TextField
                label="Max Usage Limit"
                type="number"
                required
                inputProps={{ min: '1', step: '1' }}
                value={maxUsage}
                onChange={(e) => setMaxUsage(e.target.value)}
                helperText="Must be at least 1"
                FormHelperTextProps={{ style: { color: '#64748B' } }}
                InputLabelProps={{ style: { color: '#94A3B8' } }}
                sx={{ input: { color: '#FFF' } }}
              />
            </Box>

            <TextField
              label="Expiration Date"
              type="date"
              required
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              InputLabelProps={{ shrink: true, style: { color: '#94A3B8' } }}
              sx={{ input: { color: '#FFF' } }}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: '#94A3B8', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Save Coupon
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
