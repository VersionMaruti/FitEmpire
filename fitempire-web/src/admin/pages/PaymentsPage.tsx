'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Chip,
  TextField, InputAdornment, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import { Search, Refresh } from '../icons';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api';
import type { Payment } from '../api';
import dayjs from 'dayjs';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  COMPLETED: { bg: 'rgba(67,215,135,0.1)', color: '#43D787' },
  FAILED: { bg: 'rgba(255,87,87,0.1)', color: '#FF5757' },
  REFUNDED: { bg: 'rgba(255,176,56,0.1)', color: '#FFB038' },
  PENDING: { bg: 'rgba(108,99,255,0.1)', color: '#6C63FF' },
};

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [refundDialog, setRefundDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const { data: paymentsRes, isLoading, isError } = useQuery({
    queryKey: ['payments', page, rowsPerPage],
    queryFn: () => paymentsApi.getAll(page, rowsPerPage).then((res) => res.data.data),
    placeholderData: (prev) => prev,
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      paymentsApi.processRefund(id, amount, reason),
    onSuccess: () => {
      enqueueSnackbar('Refund initiated successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setRefundDialog(false);
      setRefundReason('');
    },
    onError: (err: any) => {
      enqueueSnackbar(err.response?.data?.message || 'Failed to initiate refund', { variant: 'error' });
    },
  });

  const payments = paymentsRes?.content || [];
  const totalElements = paymentsRes?.totalElements || 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);


  const handleExportCSV = () => {
    if (!payments || payments.length === 0) {
      enqueueSnackbar('No transaction records available to export', { variant: 'warning' });
      return;
    }

    // 1. Column headers matching FE-130 spec
    const headers = [
      'Transaction ID',
      'User / Customer',
      'Amount (INR)',
      'Payment Method',
      'Status',
      'Date & Time',
    ];

    // Helper to safely escape CSV cell content
    const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    // 2. Format rows
    const rows = payments.map((p) => [
      escapeCSV(p.id),
      escapeCSV(p.userName || 'Customer'),
      escapeCSV(p.netAmount || p.amount || 0),
      escapeCSV(p.paymentMethod || 'RAZORPAY'),
      escapeCSV(p.status || 'COMPLETED'),
      escapeCSV(p.createdAt ? dayjs(p.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''),
    ]);

    // 3. Prepend UTF-8 BOM (\uFEFF) for Excel compatibility on Windows
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    // 4. Trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fitEmpire_transactions_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    enqueueSnackbar(`Exported ${payments.length} transaction(s) to CSV`, { variant: 'success' });
  };

  const handleConfirmRefund = () => {
    if (!selectedPayment) return;
    refundMutation.mutate({
      id: selectedPayment.id,
      amount: selectedPayment.netAmount || selectedPayment.amount || 0,
      reason: refundReason || 'Customer requested refund',
    });
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Transactions & Revenue</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Real-time financial payment records and refund processing
          </Typography>
        </Box>
        <Chip
          label={`${totalElements.toLocaleString('en-IN')} Transactions`}
          sx={{ background: 'rgba(67,215,135,0.15)', color: '#43D787', fontWeight: 800, p: 1 }}
        />
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="Search by transaction ID or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 340 }}
            />

            <Button
              variant="outlined"
              onClick={handleExportCSV}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                borderColor: '#43D787',
                color: '#43D787',
                '&:hover': {
                  borderColor: '#2bb66a',
                  background: 'rgba(67,215,135,0.08)',
                },
              }}
            >
              📊 Export to CSV
            </Button>
          </Box>


          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="error">Failed to load live payments from backend API.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Customer / User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No payment records found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => {
                      const style = STATUS_STYLE[p.status] || STATUS_STYLE.COMPLETED;
                      return (
                        <TableRow key={p.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                              {p.id ? p.id.substring(0, 18) : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.userName || 'Customer'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                              {formatCurrency(p.netAmount || p.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={p.paymentMethod || 'RAZORPAY'} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={p.status}
                              size="small"
                              sx={{
                                bgcolor: style.bg,
                                color: style.color,
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {p.createdAt ? dayjs(p.createdAt).format('DD MMM YYYY, HH:mm') : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {p.status === 'COMPLETED' && (
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => { setSelectedPayment(p); setRefundDialog(true); }}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                              >
                                Refund
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={refundDialog} onClose={() => setRefundDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Initiate Transaction Refund</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Confirm refund of <strong>{formatCurrency(selectedPayment?.netAmount || selectedPayment?.amount || 0)}</strong> to customer:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Reason for refund (e.g. Accidental double payment)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmRefund} variant="contained" color="error" disabled={refundMutation.isPending}>
            Process Refund
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
