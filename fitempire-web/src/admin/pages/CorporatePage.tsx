'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, IconButton
} from '@mui/material';
import { Business, Add, UploadFile, Delete, CheckCircle, Block, Group } from '@mui/icons-material';

interface CorporatePartner {
  id: string;
  companyName: string;
  whitelistedDomain: string;
  subsidyPercentage: number;
  maxQuota: number;
  enrolledCount: number;
  contactPerson: string;
  contactEmail: string;
  active: boolean;
}

const INITIAL_PARTNERS: CorporatePartner[] = [
  {
    id: 'corp-1',
    companyName: 'Infosys Limited',
    whitelistedDomain: 'infosys.com',
    subsidyPercentage: 75,
    maxQuota: 500,
    enrolledCount: 382,
    contactPerson: 'Meera Nambiar (HR Lead)',
    contactEmail: 'meera.nambiar@infosys.com',
    active: true,
  },
  {
    id: 'corp-2',
    companyName: 'Tata Consultancy Services',
    whitelistedDomain: 'tcs.com',
    subsidyPercentage: 50,
    maxQuota: 1000,
    enrolledCount: 714,
    contactPerson: 'Rajesh Kulkarni',
    contactEmail: 'rajesh.k@tcs.com',
    active: true,
  },
  {
    id: 'corp-3',
    companyName: 'Swiggy Technologies',
    whitelistedDomain: 'swiggy.in',
    subsidyPercentage: 100,
    maxQuota: 300,
    enrolledCount: 295,
    contactPerson: 'Ananya Roy (People Operations)',
    contactEmail: 'ananya.roy@swiggy.in',
    active: true,
  },
];

export function CorporatePage() {
  const [partners, setPartners] = useState<CorporatePartner[]>(() => {
    const cached = localStorage.getItem('fitempire_admin_corporates');
    return cached ? JSON.parse(cached) : INITIAL_PARTNERS;
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rosterDialogOpen, setRosterDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<CorporatePartner | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [whitelistedDomain, setWhitelistedDomain] = useState('');
  const [subsidyPercentage, setSubsidyPercentage] = useState('50');
  const [maxQuota, setMaxQuota] = useState('250');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const savePartners = (updated: CorporatePartner[]) => {
    setPartners(updated);
    localStorage.setItem('fitempire_admin_corporates', JSON.stringify(updated));
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanDomain = whitelistedDomain.trim().toLowerCase();
    if (cleanDomain.startsWith('@')) cleanDomain = cleanDomain.slice(1);

    if (!cleanDomain || !cleanDomain.includes('.')) {
      setError('Please provide a valid corporate domain (e.g. google.com or company.in).');
      return;
    }

    const newPartner: CorporatePartner = {
      id: 'corp-' + Date.now().toString().slice(-4),
      companyName: companyName.trim(),
      whitelistedDomain: cleanDomain,
      subsidyPercentage: Number(subsidyPercentage) || 50,
      maxQuota: Number(maxQuota) || 200,
      enrolledCount: 0,
      contactPerson: contactPerson.trim() || 'HR Department',
      contactEmail: contactEmail.trim(),
      active: true,
    };

    savePartners([newPartner, ...partners]);
    setDialogOpen(false);
    setCompanyName('');
    setWhitelistedDomain('');
    setContactPerson('');
    setContactEmail('');
  };

  const toggleStatus = (id: string) => {
    savePartners(
      partners.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleDelete = (id: string) => {
    savePartners(partners.filter((p) => p.id !== id));
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#F0F0FF' }}>
            Corporate Wellness & HR Whitelisting
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage corporate partners, email domain whitelists, pass subsidies & employee quotas (FE-146)
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
          Add Corporate Partner
        </Button>
      </Box>

      {/* Partners Table */}
      <Card sx={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(108, 99, 255, 0.08)' }}>
              <TableRow>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Company</TableCell>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Whitelisted Domain</TableCell>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Pass Subsidy</TableCell>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Employee Quota Utilization</TableCell>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>HR Contact</TableCell>
                <TableCell sx={{ color: '#F0F0FF', fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ color: '#F0F0FF', fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partners.map((partner) => {
                const isNearCapacity = partner.enrolledCount >= partner.maxQuota * 0.9;
                return (
                  <TableRow key={partner.id} hover sx={{ '&:hover': { background: 'rgba(255, 255, 255, 0.03)' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: 2, background: 'rgba(108, 99, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Business sx={{ color: '#6C63FF', fontSize: 18 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: '#FFF', fontSize: '0.9rem' }}>
                            {partner.companyName}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                            ID: {partner.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`@${partner.whitelistedDomain}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          color: '#38BDF8',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#43D787' }}>
                      {partner.subsidyPercentage}% Corporate Paid
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: isNearCapacity ? '#F59E0B' : '#FFF', fontSize: '0.82rem' }}>
                          {partner.enrolledCount} / {partner.maxQuota} Employees
                        </Typography>
                        {isNearCapacity && (
                          <Chip label="Near Cap" size="small" sx={{ height: 18, fontSize: '0.6rem', background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      <div>{partner.contactPerson}</div>
                      <div style={{ color: '#64748B', fontSize: '0.72rem' }}>{partner.contactEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={partner.active ? 'ACTIVE' : 'SUSPENDED'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          backgroundColor: partner.active ? 'rgba(67, 215, 135, 0.15)' : 'rgba(255, 87, 87, 0.15)',
                          color: partner.active ? '#43D787' : '#FF5757',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedPartner(partner);
                          setRosterDialogOpen(true);
                        }}
                        sx={{ textTransform: 'none', color: '#38BDF8', mr: 1, fontSize: '0.75rem' }}
                      >
                        Upload Roster
                      </Button>
                      <Button
                        size="small"
                        onClick={() => toggleStatus(partner.id)}
                        sx={{ textTransform: 'none', color: '#94A3B8', mr: 1, fontSize: '0.75rem' }}
                      >
                        {partner.active ? 'Suspend' : 'Activate'}
                      </Button>
                      <IconButton size="small" onClick={() => handleDelete(partner.id)} sx={{ color: '#FF5757' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Partner Modal */}
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
          Onboard Corporate Wellness Client
        </DialogTitle>

        <form onSubmit={handleAddPartner}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ backgroundColor: 'rgba(255, 87, 87, 0.15)', color: '#FF8080' }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Company Name"
              fullWidth
              required
              placeholder="e.g. Microsoft India"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              InputLabelProps={{ style: { color: '#94A3B8' } }}
              sx={{ input: { color: '#FFF' } }}
            />

            <TextField
              label="Whitelisted Email Domain"
              fullWidth
              required
              placeholder="e.g. microsoft.com"
              value={whitelistedDomain}
              onChange={(e) => setWhitelistedDomain(e.target.value)}
              helperText="Only employees with this domain qualify for corporate subsidized passes"
              FormHelperTextProps={{ style: { color: '#64748B' } }}
              InputLabelProps={{ style: { color: '#94A3B8' } }}
              sx={{ input: { color: '#FFF' } }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Subsidy Percentage (%)"
                type="number"
                required
                inputProps={{ min: '10', max: '100', step: '5' }}
                value={subsidyPercentage}
                onChange={(e) => setSubsidyPercentage(e.target.value)}
                InputLabelProps={{ style: { color: '#94A3B8' } }}
                sx={{ input: { color: '#FFF' } }}
              />

              <TextField
                label="Max Employee Pass Quota"
                type="number"
                required
                inputProps={{ min: '10', step: '10' }}
                value={maxQuota}
                onChange={(e) => setMaxQuota(e.target.value)}
                InputLabelProps={{ style: { color: '#94A3B8' } }}
                sx={{ input: { color: '#FFF' } }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="HR Contact Person"
                placeholder="e.g. Pooja Sharma"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                InputLabelProps={{ style: { color: '#94A3B8' } }}
                sx={{ input: { color: '#FFF' } }}
              />

              <TextField
                label="HR Contact Email"
                type="email"
                required
                placeholder="pooja.sharma@microsoft.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                InputLabelProps={{ style: { color: '#94A3B8' } }}
                sx={{ input: { color: '#FFF' } }}
              />
            </Box>
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
              Whitelisting & Activate Client
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Employee Roster Upload Modal */}
      {rosterDialogOpen && selectedPartner && (
        <Dialog
          open={rosterDialogOpen}
          onClose={() => setRosterDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: '#0F172A',
              border: '1px solid #38BDF8',
              borderRadius: 3,
              color: '#F0F0FF',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>
            Upload Employee Roster — {selectedPartner.companyName}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Upload CSV file with employee corporate email addresses to auto-grant or revoke fitness pass access.
            </Typography>

            <Box
              sx={{
                border: '2px dashed rgba(56, 189, 248, 0.4)',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: 'rgba(56, 189, 248, 0.04)',
                cursor: 'pointer'
              }}
              onClick={() => alert('Employee CSV roster uploaded successfully! 45 new corporate passes provisioned.')}
            >
              <UploadFile sx={{ fontSize: 40, color: '#38BDF8', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: '#FFF' }}>
                Drag and drop employee roster .CSV or click to browse
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                Columns: employee_id, full_name, email, department
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setRosterDialogOpen(false)} sx={{ color: '#FFF', textTransform: 'none' }}>
              Done
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
