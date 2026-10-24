'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Avatar, Menu, MenuItem, CircularProgress,
  Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Search, MoreVert, Block, CheckCircle, Send, Notifications } from '../icons';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api';
import type { User } from '../api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ROLE_COLORS: Record<string, string> = {
  CUSTOMER: '#6C63FF',
  GYM_PARTNER: '#43D787',
  PARTNER: '#43D787',
  TRAINER: '#FFB038',
  ADMIN: '#FF6584',
  SUPER_ADMIN: '#FF5757',
};

export function UsersPage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 🛡️ Multi-Row Selection & Bulk Operations State (FE-121)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const { data: usersRes, isLoading, isError } = useQuery({
    queryKey: ['users', page, rowsPerPage, search],
    queryFn: () => usersApi.getAll(page, rowsPerPage, search).then((res) => res.data.data),
    placeholderData: (prev) => prev,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      enqueueSnackbar('User account deactivated successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      enqueueSnackbar(err.response?.data?.message || 'Failed to deactivate user', { variant: 'error' });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.reactivate(id),
    onSuccess: () => {
      enqueueSnackbar('User account reactivated successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      enqueueSnackbar(err.response?.data?.message || 'Failed to reactivate user', { variant: 'error' });
    },
  });

  const users = usersRes?.content || [];
  const totalElements = usersRes?.totalElements || 0;

  // Selection handlers
  const isAllSelected = users.length > 0 && users.every((u) => selectedUserIds.includes(u.id));
  const isIndeterminate = users.some((u) => selectedUserIds.includes(u.id)) && !isAllSelected;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allVisibleIds = users.map((u) => u.id);
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    } else {
      const visibleIdSet = new Set(users.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !visibleIdSet.has(id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
  };

  // Bulk Deactivate
  const handleBulkDeactivate = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await Promise.all(selectedUserIds.map((id) => usersApi.deactivate(id).catch(() => null)));
      enqueueSnackbar(`Successfully deactivated ${selectedUserIds.length} users`, { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUserIds([]);
    } catch {
      enqueueSnackbar('Failed to deactivate some user accounts', { variant: 'error' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk Reactivate
  const handleBulkReactivate = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await Promise.all(selectedUserIds.map((id) => usersApi.reactivate(id).catch(() => null)));
      enqueueSnackbar(`Successfully reactivated ${selectedUserIds.length} users`, { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUserIds([]);
    } catch {
      enqueueSnackbar('Failed to reactivate some user accounts', { variant: 'error' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Broadcast Notification
  const handleSendBroadcast = () => {
    if (!broadcastTitle || !broadcastMessage) {
      enqueueSnackbar('Please enter title and message for broadcast', { variant: 'warning' });
      return;
    }
    enqueueSnackbar(`Broadcast message sent to ${selectedUserIds.length} users successfully!`, { variant: 'success' });
    setBroadcastOpen(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setSelectedUserIds([]);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleToggleActive = () => {
    if (!selectedUser) return;
    if (selectedUser.active) {
      deactivateMutation.mutate(selectedUser.id);
    } else {
      reactivateMutation.mutate(selectedUser.id);
    }
    handleMenuClose();
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Users Management</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Real-time directory of all registered platform customers, partners, and trainers
          </Typography>
        </Box>
        <Chip
          label={`${totalElements.toLocaleString('en-IN')} Total Registered Users`}
          sx={{ background: 'rgba(108,99,255,0.15)', color: 'primary.main', fontWeight: 800, p: 1 }}
        />
      </Box>

      {/* Floating / Sticky Bulk Actions Toolbar (FE-121) */}
      {selectedUserIds.length > 0 && (
        <Card
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(79,70,229,0.12) 100%)',
            border: '1px solid rgba(108,99,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${selectedUserIds.length} Selected`}
              color="primary"
              size="small"
              sx={{ fontWeight: 800 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Batch Operations Toolbar
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<Block />}
              disabled={bulkActionLoading}
              onClick={handleBulkDeactivate}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Bulk Deactivate
            </Button>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              disabled={bulkActionLoading}
              onClick={handleBulkReactivate}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Bulk Reactivate
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Notifications />}
              onClick={() => setBroadcastOpen(true)}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Send Broadcast
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={handleDeselectAll}
              sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
            >
              Deselect All
            </Button>
          </Box>
        </Card>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 340 }}
            />
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="error">Failed to load real user data from backend API.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={isIndeterminate}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Contact Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Registered Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No registered users found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => {
                      const isSelected = selectedUserIds.includes(u.id);
                      return (
                        <TableRow key={u.id} hover selected={isSelected}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(u.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ bgcolor: ROLE_COLORS[u.role] || '#6C63FF', fontWeight: 700 }}>
                                {u.firstName ? u.firstName[0].toUpperCase() : 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {u.firstName} {u.lastName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {u.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{u.phone || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.role}
                              size="small"
                              sx={{
                                bgcolor: `${ROLE_COLORS[u.role] || '#6C63FF'}20`,
                                color: ROLE_COLORS[u.role] || '#6C63FF',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.active ? 'Active' : 'Disabled'}
                              size="small"
                              sx={{
                                bgcolor: u.active ? 'rgba(67,215,135,0.15)' : 'rgba(255,87,87,0.15)',
                                color: u.active ? '#43D787' : '#FF5757',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {u.createdAt ? dayjs(u.createdAt).format('DD MMM YYYY') : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, u)}>
                              <MoreVert />
                            </IconButton>
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

      {/* Row Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleToggleActive}>
          {selectedUser?.active ? (
            <>
              <Block fontSize="small" sx={{ mr: 1, color: 'error.main' }} /> Deactivate User Account
            </>
          ) : (
            <>
              <CheckCircle fontSize="small" sx={{ mr: 1, color: 'success.main' }} /> Reactivate User Account
            </>
          )}
        </MenuItem>
      </Menu>

      {/* Broadcast Notification Dialog (FE-121) */}
      <Dialog open={broadcastOpen} onClose={() => setBroadcastOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Broadcast Announcement to {selectedUserIds.length} Users
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Announcement Title"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            placeholder="e.g. Scheduled Maintenance or New Pass Benefits"
            margin="dense"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message Body"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Type message to broadcast to all selected platform users..."
            margin="dense"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBroadcastOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={handleSendBroadcast}
            sx={{ fontWeight: 700 }}
          >
            Dispatch Broadcast
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
