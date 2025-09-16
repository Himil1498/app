import React from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CardActionArea,
  Grid,
  Button,
  CardActions,
  CardHeader,
  Stack,
  Chip,
  Divider
} from "@mui/material";
import { 
  Build as BuildIcon, 
  Map, 
  Construction, 
  LocationOn,
  AdminPanelSettings,
  Engineering
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../../redux/slices/authSlice";
import { hasPermission, FEATURES } from "../../utils/permissions";
import { formatRegionNames } from "../../utils/mapUtils";

export default function Network() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const availableTools = [
    {
      id: 'professional-gis',
      title: 'Professional GIS Dashboard',
      description: 'Comprehensive GIS tools with region-based access control and advanced mapping features.',
      icon: <Engineering />,
      color: 'primary',
      path: '/gis-dashboard',
      requiredFeature: FEATURES.INFRASTRUCTURE,
      featured: true
    },
    {
      id: 'working-map',
      title: 'Measurement Tools',
      description: 'Distance measurement and basic mapping tools with boundary restrictions.',
      icon: <Map />,
      color: 'secondary', 
      path: '/workingMap',
      requiredFeature: FEATURES.DISTANCE,
      featured: false
    }
  ];

  const featuredTools = availableTools.filter(tool => tool.featured && hasPermission(user, tool.requiredFeature));
  const otherTools = availableTools.filter(tool => !tool.featured && hasPermission(user, tool.requiredFeature));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={1}>
          GIS Network Tools
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={2}>
          Access region-restricted GIS tools and mapping interfaces
        </Typography>
        
        {/* User Access Info */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Chip
            icon={<LocationOn />}
            label={user?.isAdmin ? 'Full Access (Admin)' : `${user?.regions?.length || 0} Regions`}
            color={user?.isAdmin ? 'success' : 'primary'}
            variant="outlined"
          />
          {!user?.isAdmin && user?.regions && user.regions.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Regions: {formatRegionNames(user.regions)}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            🌟 Featured Tools
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {featuredTools.map((tool) => (
              <Grid item xs={12} md={6} lg={4} key={tool.id}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": { 
                      transform: "translateY(-4px)",
                      boxShadow: 4
                    },
                    border: '2px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  <CardHeader
                    avatar={tool.icon}
                    title={tool.title}
                    subheader="Enhanced with region access control"
                    titleTypographyProps={{ fontSize: "1.1rem", fontWeight: "bold" }}
                    sx={{ pb: 1 }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {tool.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      color={tool.color}
                      onClick={() => navigate(tool.path)}
                      fullWidth
                      startIcon={tool.icon}
                    >
                      Open Tool
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Other Available Tools */}
      {otherTools.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Additional Tools
          </Typography>
          <Grid container spacing={3}>
            {otherTools.map((tool) => (
              <Grid item xs={12} md={6} key={tool.id}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <CardActionArea onClick={() => navigate(tool.path)}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        {tool.icon}
                        <Typography
                          variant="h6"
                          sx={{ ml: 1, fontWeight: "medium" }}
                        >
                          {tool.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {tool.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* No Access Message */}
      {featuredTools.length === 0 && otherTools.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No GIS Tools Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contact your administrator to request access to GIS tools.
          </Typography>
        </Card>
      )}
    </Box>
  );
}
