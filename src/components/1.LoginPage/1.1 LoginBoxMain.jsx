import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, restoreSession, clearMessage } from "../../redux/authSlice";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Fade,
  Container,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Login as LoginIcon,
} from "@mui/icons-material";
import LeftImage from "./1.2 LeftImage";

export default function LoginBox() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const hideLeftImage = useMediaQuery("(max-width:800px)");

  const { user, loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setOpenSuccess(true);
      const timer = setTimeout(() => {
        navigate("/dashboard");
        dispatch(clearMessage());
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (error) setOpenError(true);
  }, [error]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleTogglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <Box
      display="flex"
      height="100vh"
      width="100vw"
      flexDirection={{ xs: "column", sm: "row" }}
    >
      {!hideLeftImage && <LeftImage />}
      <Box
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ p: { xs: 3, sm: 6 }, backdropFilter: "blur(10px)" }}
      >
        <Container maxWidth="sm">
          <Fade in timeout={800}>
            <Card elevation={12} sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                <Box textAlign="center" mb={4}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: theme.palette.primary.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 40, color: "white" }} />
                  </Box>
                  <Typography variant="h4" fontWeight="700" mb={1}>
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sign in to continue your journey
                  </Typography>
                </Box>
                <Box
                  component="form"
                  onSubmit={handleLogin}
                  noValidate
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleTogglePasswordVisibility}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{ mt: 3, py: 1.5 }}
                  >
                    {loading ? (
                      <CircularProgress size={20} sx={{ color: "inherit" }} />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>

      <Snackbar
        open={openSuccess}
        autoHideDuration={2000}
        onClose={() => setOpenSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Login successful! Redirecting...
        </Alert>
      </Snackbar>

      <Snackbar
        open={openError}
        autoHideDuration={3000}
        onClose={() => setOpenError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenError(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {error || "Login failed. Please try again."}
        </Alert>
      </Snackbar>
    </Box>
  );
}
