import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
  Fade,
  Slide,
  IconButton,
  Checkbox
} from '@mui/material';
import {
  CellTower,
  Satellite,
  LocationOn,
  Business,
  ContactPhone,
  CalendarToday,
  Settings,
  Save,
  Cancel,
  Info,
  CheckCircle,
  Error,
  Warning,
  Close
} from '@mui/icons-material';

const AddLocationForm = ({ 
  open, 
  onClose, 
  type, 
  position, 
  onSubmit,
  initialData = {},
  isEditing = false,
  isInsideIndia = null
}) => {
  // Remove step navigation - single page form
  // const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    id: 0,
    unique_id: '',
    network_id: '',
    ref_code: '',
    status: 'Active',
    created_on: new Date().toISOString(),
    updated_on: new Date().toISOString(),
    
    // Contact & Address
    address: '',
    contact_name: '',
    contact_no: '',
    
    // Rental Information
    is_rented: false,
    rent_amount: 0,
    agreement_start_date: '',
    agreement_end_date: '',
    
    // Technical Information
    nature_of_business: '',
    structure_type: '',
    ups_availability: false,
    backup_capacity: '',
    
    // Coordinates
    latitude: 0,
    longitude: 0,
    
    // Manual Addition
    manually_added: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boundaryCheckResult, setBoundaryCheckResult] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false); // Track submission attempts for better validation UX

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open && type && position) {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const uniqueCode = `${timestamp}${randomPart}`;
      const newId = Math.floor(Math.random() * 900000) + 100000; // 6 digit random ID
      
      setFormData(prev => ({
        ...prev,
        id: newId,
        unique_id: type === 'pop' ? `POP.${uniqueCode}` : `SUB.${uniqueCode}`,
        network_id: type === 'pop' ? `BHARAT-POP.${uniqueCode}` : `BHARAT-SUB.${uniqueCode}`,
        latitude: position.lat,
        longitude: position.lng,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        nature_of_business: type === 'pop' ? 'Primary Operations' : 'Secondary Operations',
        manually_added: !isEditing, // Only true for new additions, false for edits
        ...initialData
      }));
      setErrors({});
    }
  }, [open, type, position?.lat, position?.lng, isEditing]);
  
  // Separate effect for boundary check to avoid dependency issues
  useEffect(() => {
    if (open && position && isInsideIndia) {
      try {
        const boundaryResult = isInsideIndia({ lat: position.lat, lng: position.lng });
        setBoundaryCheckResult(boundaryResult);
      } catch (error) {
        console.warn('Error checking India boundary:', error);
        setBoundaryCheckResult(null);
      }
    } else if (open && position) {
      setBoundaryCheckResult(null);
    }
  }, [open, position?.lat, position?.lng]);

  // Remove steps - single form
  // const steps = [...]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updated_on: new Date().toISOString()
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic Info validation
    if (!formData.name.trim()) newErrors.name = 'Location name is required';
    
    // Contact validation
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (formData.contact_no && !/^\d{10,}$/.test(formData.contact_no.replace(/\D/g, ''))) {
      newErrors.contact_no = 'Enter a valid phone number';
    }
    
    // Business validation
    if (formData.is_rented) {
      if (!formData.rent_amount || formData.rent_amount <= 0) {
        newErrors.rent_amount = 'Rent amount is required when location is rented';
      }
      if (!formData.agreement_start_date) {
        newErrors.agreement_start_date = 'Agreement start date is required';
      }
      if (!formData.agreement_end_date) {
        newErrors.agreement_end_date = 'Agreement end date is required';
      }
    }
    
    // Technical validation
    if (formData.ups_availability && !formData.backup_capacity.trim()) {
      newErrors.backup_capacity = 'Backup capacity is required when UPS is available';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setFormSubmitted(true);
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        position,
        data: formData
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormContent = () => {
    return (
      <Grid container spacing={3}>
        {/* Basic Information Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            Basic Information
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Location Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="primary" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
            
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="ID"
            value={formData.id}
            variant="outlined"
            disabled
            helperText="Auto-generated"
            InputProps={{
              readOnly: true,
              sx: { bgcolor: 'grey.50' }
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <MenuItem value="Active">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} fontSize="small" />
                  Active
                </Box>
              </MenuItem>
              <MenuItem value="RFS">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning sx={{ mr: 1, color: 'warning.main' }} fontSize="small" />
                  RFS (Ready for Service)
                </Box>
              </MenuItem>
              <MenuItem value="Maintenance">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Error sx={{ mr: 1, color: 'error.main' }} fontSize="small" />
                  Maintenance
                </Box>
              </MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Unique ID"
            value={formData.unique_id}
            helperText={`Format: ${type?.toUpperCase()}.XXXXXX (Auto-generated)`}
            variant="outlined"
            disabled
            InputProps={{
              readOnly: true,
              sx: { bgcolor: 'grey.50' }
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Network ID"
            value={formData.network_id}
            helperText={`Format: BHARAT-${type?.toUpperCase()}.XXXXXX (Auto-generated)`}
            variant="outlined"
            disabled
            InputProps={{
              readOnly: true,
              sx: { bgcolor: 'grey.50' }
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Reference Code"
            value={formData.ref_code}
            onChange={(e) => handleInputChange('ref_code', e.target.value)}
            variant="outlined"
          />
        </Grid>
        
        {/* Contact Information Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
            <ContactPhone sx={{ mr: 1, verticalAlign: 'middle' }} />
            Contact Information
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address || 'Enter the complete address for this location'}
            required
            variant="outlined"
            multiline
            rows={3}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                  <LocationOn color="primary" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact Name"
            value={formData.contact_name}
            onChange={(e) => handleInputChange('contact_name', e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ContactPhone color="primary" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact Number"
            value={formData.contact_no}
            onChange={(e) => handleInputChange('contact_no', e.target.value)}
            error={!!errors.contact_no}
            helperText={errors.contact_no}
            variant="outlined"
            type="tel"
          />
        </Grid>
        
        {/* Coordinates Section */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
                Coordinates
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Chip 
                    label={`Lat: ${position?.lat.toFixed(6) || 'N/A'}`} 
                    variant="outlined" 
                    color="primary" 
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip 
                    label={`Lng: ${position?.lng.toFixed(6) || 'N/A'}`} 
                    variant="outlined" 
                    color="primary" 
                  />
                </Grid>
                <Grid item xs={12}>
                  {boundaryCheckResult === true && (
                    <Chip 
                      icon={<CheckCircle />}
                      label="Location within India's boundaries" 
                      variant="outlined" 
                      color="success"
                      size="small"
                    />
                  )}
                  {boundaryCheckResult === false && (
                    <Chip 
                      icon={<Error />}
                      label="Location outside India's boundaries" 
                      variant="outlined" 
                      color="error"
                      size="small"
                    />
                  )}
                  {boundaryCheckResult === null && (
                    <Chip 
                      icon={<Warning />}
                      label="Boundary check unavailable" 
                      variant="outlined" 
                      color="warning"
                      size="small"
                    />
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Business Information Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
            <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
            Business Information
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Card 
            variant="outlined" 
            sx={{ 
              borderColor: formData.is_rented ? 'primary.main' : 'divider',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.2)'
              }
            }}
          >
            <CardContent>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_rented}
                    onChange={(e) => handleInputChange('is_rented', e.target.checked)}
                    color="primary"
                    sx={{ 
                      '& .MuiSvgIcon-root': { fontSize: 28 },
                      color: formData.is_rented ? 'primary.main' : 'text.secondary'
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={formData.is_rented ? 'bold' : 'medium'}>
                      Rented Property
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Is this location rented or leased?
                    </Typography>
                  </Box>
                }
                sx={{ margin: 0 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {formData.is_rented && (
          <Fade in={formData.is_rented}>
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Monthly Rent Amount"
                    value={formData.rent_amount === 0 ? '' : formData.rent_amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === null) {
                        handleInputChange('rent_amount', 0);
                      } else {
                        handleInputChange('rent_amount', parseFloat(value) || 0);
                      }
                    }}
                    error={!!errors.rent_amount}
                    helperText={errors.rent_amount}
                    variant="outlined"
                    type="number"
                    placeholder="Enter amount"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Agreement Start Date"
                    value={formData.agreement_start_date}
                    onChange={(e) => handleInputChange('agreement_start_date', e.target.value)}
                    error={!!errors.agreement_start_date}
                    helperText={errors.agreement_start_date}
                    variant="outlined"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Agreement End Date"
                    value={formData.agreement_end_date}
                    onChange={(e) => handleInputChange('agreement_end_date', e.target.value)}
                    error={!!errors.agreement_end_date}
                    helperText={errors.agreement_end_date}
                    variant="outlined"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Fade>
        )}
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nature of Business"
            value={formData.nature_of_business}
            onChange={(e) => handleInputChange('nature_of_business', e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business color="primary" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        {/* Technical Information Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
            <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
            Technical Information
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Structure Type</InputLabel>
            <Select
              value={formData.structure_type}
              label="Structure Type"
              onChange={(e) => handleInputChange('structure_type', e.target.value)}
            >
              <MenuItem value="Tower">📡 Tower</MenuItem>
              <MenuItem value="Building">🏢 Building</MenuItem>
              <MenuItem value="Rooftop">🏠 Rooftop</MenuItem>
              <MenuItem value="Ground">🌍 Ground</MenuItem>
              <MenuItem value="Other">❓ Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card 
            variant="outlined" 
            sx={{ 
              borderColor: formData.ups_availability ? 'success.main' : 'divider',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'success.main',
                boxShadow: '0 0 0 1px rgba(76, 175, 80, 0.2)'
              }
            }}
          >
            <CardContent>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.ups_availability}
                    onChange={(e) => handleInputChange('ups_availability', e.target.checked)}
                    color="success"
                    sx={{ 
                      '& .MuiSvgIcon-root': { fontSize: 28 },
                      color: formData.ups_availability ? 'success.main' : 'text.secondary'
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={formData.ups_availability ? 'bold' : 'medium'}>
                      UPS Available
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Uninterruptible Power Supply
                    </Typography>
                  </Box>
                }
                sx={{ margin: 0 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {formData.ups_availability && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Backup Capacity"
              value={formData.backup_capacity}
              onChange={(e) => handleInputChange('backup_capacity', e.target.value)}
              error={!!errors.backup_capacity}
              helperText={errors.backup_capacity}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">KVA</InputAdornment>
              }}
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Card 
            variant="outlined" 
            sx={{ 
              bgcolor: 'grey.50',
              borderStyle: 'dashed'
            }}
          >
            <CardContent>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.manually_added}
                    onChange={(e) => handleInputChange('manually_added', e.target.checked)}
                    color="default"
                    disabled
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary">
                      Manually Added Point
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This location was added through the map interface (read-only)
                    </Typography>
                  </Box>
                }
                sx={{ margin: 0 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{
        direction: "up",
        mountOnEnter: true,
        unmountOnExit: true
      }}
    >
      <DialogTitle 
        sx={{ 
          background: type === 'pop' 
            ? 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)' 
            : 'linear-gradient(135deg, #26A69A 0%, #00897B 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {type === 'pop' ? <CellTower sx={{ mr: 2 }} /> : <Satellite sx={{ mr: 2 }} />}
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              {isEditing ? 'Edit' : 'Add'} {type?.toUpperCase()} Location
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Complete all sections to {isEditing ? 'update' : 'add'} this infrastructure location
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, maxHeight: '70vh' }}>
        {/* Form Content */}
        <Box sx={{ p: 3 }}>
          {formSubmitted && Object.keys(errors).length > 0 && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={(
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setFormSubmitted(false)}
                >
                  <Close fontSize="inherit" />
                </IconButton>
              )}
            >
              Please fix the highlighted fields before continuing.
            </Alert>
          )}
          
          {boundaryCheckResult === false && (
            <Alert 
              severity="warning" 
              sx={{ mb: 3 }}
              variant="outlined"
              icon={<LocationOn />}
            >
              This location appears to be outside India's boundaries. Please verify the coordinates are correct.
            </Alert>
          )}
          
          <Box sx={{ maxHeight: 'calc(70vh - 160px)', overflow: 'auto' }}>
            {renderFormContent()}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={onClose}
          color="inherit"
          startIcon={<Cancel />}
        >
          Cancel
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        <Button 
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={<Save />}
          sx={{
            background: type === 'pop' 
              ? 'linear-gradient(135deg, #1E88E5, #1565C0)' 
              : 'linear-gradient(135deg, #26A69A, #00897B)',
            '&:hover': {
              background: type === 'pop' 
                ? 'linear-gradient(135deg, #1565C0, #0D47A1)' 
                : 'linear-gradient(135deg, #00897B, #00695C)'
            }
          }}
        >
          {isSubmitting 
            ? `${isEditing ? 'Updating' : 'Adding'} Location...` 
            : `${isEditing ? 'Update' : 'Add'} ${type?.toUpperCase()} Location`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLocationForm;
