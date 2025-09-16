import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Box, Typography, Grid, Paper, Card, CardContent, Stack, Chip } from "@mui/material";
import { LocationOn, Person, Dashboard as DashboardIcon } from "@mui/icons-material";
import RoleSummaryCards from "./3.1 RoleSummaryCards";
import UserActivityTable from "./3.2 UserActivityTable";
import { selectUser, selectIsAdmin } from "../../../redux/slices/authSlice";

export default function Dashboard() {
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const isManagerOrAdmin = user?.role === 'Admin' || user?.role === 'Manager';
  
  const [allUsers, setAllUsers] = useState(
    JSON.parse(localStorage.getItem("allUsers")) || []
  );
  const [loggedInUser, setLoggedInUser] = useState(
    JSON.parse(localStorage.getItem("loggedInUser")) || null
  );

  const [roleData, setRoleData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const handleStorageChange = () => {
      setAllUsers(JSON.parse(localStorage.getItem("allUsers")) || []);
      setLoggedInUser(JSON.parse(localStorage.getItem("loggedInUser")) || null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // Role counts
    const adminCount = allUsers.filter((u) => u.role === "Admin").length;
    const managerCount = allUsers.filter((u) => u.role === "Manager").length;
    const normalCount = allUsers.filter((u) => u.role === "Normal User").length;

    setRoleData([
      { role: "Admin", value: adminCount },
      { role: "Manager", value: managerCount },
      { role: "Normal User", value: normalCount },
    ]);

    // Logged-in user activity
    if (loggedInUser) {
      const user = allUsers.find((u) => u.username === loggedInUser.username);
      setRecentUsers(user ? [user] : []);
    }
  }, [allUsers, loggedInUser]);

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Welcome, {user?.username || 'User'}
      </Typography>

      {/* Admin & Manager Dashboard */}
      {isManagerOrAdmin && (
        <>
          {/* Role Summary Cards */}
          <RoleSummaryCards data={roleData} />

          {/* Logged-in User Activity */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Your Activity
              </Typography>
              <UserActivityTable users={recentUsers} />
            </Grid>
          </Grid>
        </>
      )}

      {/* Normal User Dashboard */}
      {!isManagerOrAdmin && (
        <Grid container spacing={3}>
          {/* User Info Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Person color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Your Profile
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {user?.username}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {user?.role}
                    </Typography>
                  </Box>
                  {user?.regions && user.regions.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Assigned Regions
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {user.regions.map((region, index) => (
                          <Chip
                            key={region.id || index}
                            label={region.name || region}
                            size="small"
                            color="primary"
                            variant="outlined"
                            icon={<LocationOn />}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Tools Panel */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <DashboardIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Quick Access
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => window.location.href = '/network'}
                  >
                    <Typography variant="body1" fontWeight="500">
                      🗺️ Access GIS Tools
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View maps and available tools for your region
                    </Typography>
                  </Paper>
                  
                  {user?.permissions?.infrastructure && (
                    <Paper 
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => window.location.href = '/gisProfessionalDashboard'}
                    >
                      <Typography variant="body1" fontWeight="500">
                        🏗️ Infrastructure Tools
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Access infrastructure management tools
                      </Typography>
                    </Paper>
                  )}
                  
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body1" fontWeight="500" color="text.secondary">
                      📈 Region Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Region status updates coming soon...
                    </Typography>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
