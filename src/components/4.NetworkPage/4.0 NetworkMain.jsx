import React from "react";
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
} from "@mui/material";
import { Build as BuildIcon, Map, Construction } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Network() {
  const navigate = useNavigate();

  const handleOpenTools = () => navigate("/network/allToolContainer");

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        GIS Network Tools
      </Typography>

      {/* Map Tools Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={4}>
          <Card
            sx={{
              height: "100%",
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <CardHeader
              title="🔧 Working Distance Tool"
              subheader="NEW - Enhanced measurement with India boundaries"
              titleTypographyProps={{ fontSize: "1.1rem", fontWeight: "bold" }}
              sx={{ pb: 1 }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Professional distance measurement tool with hybrid maps, India
                boundary restrictions, save/load functionality, and real-time
                calculations.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="warning"
                startIcon={<Construction />}
                onClick={() => navigate("/workingMap")}
                fullWidth
              >
                Open Working Tool
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Legacy Tools */}
      <Typography variant="h6" fontWeight="bold" mb={2} color="text.secondary">
        Legacy Interface
      </Typography>

      <Grid container spacing={2}>
      
        <Grid item xs={12} md={6}>
          <Card sx={{ opacity: 0.7 }}>
            <CardActionArea
              onClick={() => navigate("/gisProfessionalDashboard")}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <BuildIcon sx={{ mr: 1, fontSize: 24, color: "#666" }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "medium", color: "text.secondary" }}
                  >
                    Testing: GIS Tool Interface (UI Only)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Interface mockup for testing UI components. Not fully
                  functional.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
