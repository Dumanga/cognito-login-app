/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Typography, Box, CircularProgress, Card, CardContent, Button } from "@mui/material";
import axios from "axios";

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // because need to use these details in multiple places
  const CONFIG = {
    userPool: "hexagon-imi",
    awsRegion: "ap-southeast-1",
    clientId: "5is7m8qlgsk60m7seu3sfqnune",
    redirectUri: "http://localhost:3000",
    logoutUri: "http://localhost:3000/"
  };

  const getTokenFromURL = () => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const token = hashParams.get("access_token");
    if (token) {
      localStorage.setItem("access_token", token);
      window.location.hash = "";
    }
    return token;
  };

  const isValidToken = (token) => {
    if (!token || typeof token !== "string") return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    try {
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000;
      return exp > Date.now();
    } catch (error) {
      return false;
    }
  };

  const redirectToCognito = () => {
    const { userPool, awsRegion, clientId, redirectUri } = CONFIG;
    const responseType = "token";
    const scope = "email openid profile";

    const cognitoLoginUrl = `https://${userPool}.auth.${awsRegion}.amazoncognito.com/login?client_id=${clientId}&response_type=${responseType}&scope=${scope}&redirect_uri=${redirectUri}`;
    window.location.href = cognitoLoginUrl;
  };

  const fetchUserInfo = async (token) => {
    try {
      const { userPool, awsRegion } = CONFIG;
      const response = await axios.get(`https://${userPool}.auth.${awsRegion}.amazoncognito.com/oauth2/userInfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");

    if (storedToken && isValidToken(storedToken)) {
      fetchUserInfo(storedToken);
    } else {
      const token = getTokenFromURL();
      if (token && isValidToken(token)) {
        fetchUserInfo(token);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const handleLogout = () => {
    const { userPool, awsRegion, clientId, logoutUri } = CONFIG;
    localStorage.removeItem("access_token");
    
    const cognitoLogoutUrl = `https://${userPool}.auth.${awsRegion}.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
    window.location.href = cognitoLogoutUrl;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      {userInfo ? (
        <Card>
          <CardContent>
            <Typography variant="h4">Welcome, {userInfo.name}</Typography>
            <Typography variant="body1">Email: {userInfo.email}</Typography>
            <Button
              variant="contained"
              color="error"
              sx={{ marginTop: 2 }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Welcome to the Application
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={redirectToCognito}
            >
              Login with Cognito
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default App;