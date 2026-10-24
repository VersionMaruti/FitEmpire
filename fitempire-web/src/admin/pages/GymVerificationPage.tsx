'use client'
import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Tabs, Tab,
  IconButton, Tooltip
} from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty, Description, OpenInNew } from '../icons';
import { gymsApi } from '../api';
import type { Gym } from '../api';

interface DocItem {
  id: string;
  name: string;
  type: string;
  fileName: string;
  url: string;
  uploadedAt: string;
}

export function GymVerificationPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // 🛡️ FE-122: In-App Document Preview Modal State
  const [previewGym, setPreviewGym] = useState<Gym | null>(null);
  const [docTab, setDocTab] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    fetchPendingGyms();
  }, []);

  const fetchPendingGyms = async () => {
    setLoading(true);
    try {
      const res = await gymsApi.getAll(0, 50, 'PENDING_REVIEW');
      setGyms(res.data.data?.content || []);
    } catch (e) {
      console.warn("Failed to fetch gym verification queue:", e);
      setGyms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await gymsApi.approve(id);
      fetchPendingGyms();
      if (previewGym && previewGym.id === id) {
        setPreviewGym(null);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    setActionLoading(true);
    try {
      await gymsApi.reject(rejectDialog, rejectReason);
      setRejectDialog(null);
      setRejectReason('');
      fetchPendingGyms();
      if (previewGym && previewGym.id === rejectDialog) {
        setPreviewGym(null);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setActionLoading(false);
    }
  };

  const sampleDocs: DocItem[] = [
    {
      id: 'doc-1',
      name: 'Trade & Commercial Establishment License',
      type: 'TRADE_LICENSE',
      fileName: 'MCD_Commercial_Fitness_Permit_2026.pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedAt: 'Today, 11:30 AM'
    },
    {
      id: 'doc-2',
      name: 'State Fire Department NOC & Clearance',
      type: 'FIRE_NOC',
      fileName: 'Fire_Safety_Inspection_Certificate_NOC.pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedAt: 'Today, 11:31 AM'
    },
    {
      id: 'doc-3',
      name: 'GST Registration Certificate & Lease Deed',
      type: 'GST_LEASE',
      fileName: 'GST_Certificate_29AABCU9603R1ZM.pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedAt: 'Today, 11:32 AM'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={1}>Gym Verification Queue</Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Review and approve submitted gym partner applications and legal compliance documents.
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <TableCell><strong>Gym Name</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Owner</strong></TableCell>
              <TableCell><strong>Submitted On</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gyms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  <CheckCircle sx={{ fontSize: 48, color: '#43D787', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6">All caught up!</Typography>
                  <Typography variant="body2">No pending applications requiring verification.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              gyms.map((gym) => (
                <TableRow key={gym.id}>
                  <TableCell sx={{ fontWeight: 700 }}>{gym.name}</TableCell>
                  <TableCell><Chip label={gym.category} size="small" variant="outlined" /></TableCell>
                  <TableCell>{gym.ownerName || 'Gym Owner'}</TableCell>
                  <TableCell>{new Date(gym.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip label="Pending Review" color="warning" size="small" icon={<HourglassEmpty />} />
                  </TableCell>
                  <TableCell align="right">
                    {/* FE-122: Review Compliance Docs Action */}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Description />}
                      onClick={() => {
                        setPreviewGym(gym);
                        setDocTab(0);
                        setZoomLevel(100);
                      }}
                      sx={{ mr: 1, borderColor: 'rgba(108,99,255,0.4)', color: '#6C63FF', fontWeight: 700 }}
                    >
                      Docs (3)
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleApprove(gym.id)}
                      disabled={actionLoading}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => setRejectDialog(gym.id)}
                      disabled={actionLoading}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🛡️ FE-122: In-App Document PDF Preview Dialog */}
      <Dialog
        open={Boolean(previewGym)}
        onClose={() => setPreviewGym(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, height: '85vh', display: 'flex', flexDirection: 'column' } }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Compliance License Inspection: {previewGym?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Verify commercial fitness trade license, fire safety NOC, and municipal permissions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
              >
                +
              </Button>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {zoomLevel}%
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
              >
                -
              </Button>
            </Box>
          </Box>
        </DialogTitle>

        <Box sx={{ px: 2, pt: 1, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <Tabs value={docTab} onChange={(_, val) => setDocTab(val)}>
            <Tab label="1. Trade License (PDF)" />
            <Tab label="2. Fire Safety NOC (PDF)" />
            <Tab label="3. GST & Lease (PDF)" />
          </Tabs>
        </Box>

        <DialogContent sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {sampleDocs[docTab].name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                File: {sampleDocs[docTab].fileName} • Uploaded: {sampleDocs[docTab].uploadedAt}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="text"
              startIcon={<OpenInNew />}
              href={sampleDocs[docTab].url}
              target="_blank"
              rel="noreferrer"
              sx={{ fontSize: '0.72rem' }}
            >
              Open in Tab
            </Button>
          </Box>

          {/* Inline Document Preview Box with Zoom */}
          <Box
            sx={{
              flex: 1,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.12)',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <iframe
              src={`${sampleDocs[docTab].url}#toolbar=0&navpanes=0`}
              title="Compliance Document Viewer"
              style={{
                width: `${zoomLevel}%`,
                height: '100%',
                border: 'none',
                transition: 'width 0.2s ease',
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Button onClick={() => setPreviewGym(null)}>Close Preview</Button>
          {previewGym && (
            <>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  setRejectDialog(previewGym.id);
                }}
              >
                Reject Listing
              </Button>
              <Button
                color="success"
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => handleApprove(previewGym.id)}
                disabled={actionLoading}
              >
                Approve & Activate Gym
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={Boolean(rejectDialog)} onClose={() => setRejectDialog(null)}>
        <DialogTitle>Reject Application</DialogTitle>
        <DialogContent sx={{ minWidth: 360, pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Specify missing documents or guidelines violation..."
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleReject} disabled={actionLoading}>
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
