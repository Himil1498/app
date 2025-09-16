import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Map,
  Timeline,
  Close,
  Build,
} from '@mui/icons-material';

/**
 * Quick access floating button for map testing
 */
const QuickMapAccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Don't show on login page
  if (location.pathname === '/') {
    return null;
  }

  const actions = [
    {
      icon: <Map />,
      name: 'Professional GIS',
      action: () => navigate('/gisProfessionalDashboard'),
      color: 'primary'
    },
    {
      icon: <Timeline />,
      name: 'Network Tools',
      action: () => navigate('/network'),
      color: 'success'
    },
    {
      icon: <Build />,
      name: 'Measurement Tools',
      action: () => navigate('/workingMap'),
      color: 'secondary'
    },
  ];

  const handleActionClick = (action) => {
    action.action();
    setOpen(false);
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 24, 
      right: 24, 
      zIndex: 1300 
    }}>
      <SpeedDial
        ariaLabel="Quick Map Access"
        sx={{ position: 'absolute', bottom: 0, right: 0 }}
        icon={<SpeedDialIcon icon={<Map />} openIcon={<Close />} />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        direction="up"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleActionClick(action)}
            sx={{
              '& .MuiSpeedDialAction-fab': {
                bgcolor: `${action.color}.main`,
                '&:hover': {
                  bgcolor: `${action.color}.dark`,
                }
              }
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default QuickMapAccess;
