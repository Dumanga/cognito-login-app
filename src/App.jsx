import { useEffect, useState } from "react";
import { Typography, Box, CircularProgress, Card, CardContent } from "@mui/material";
import axios from "axios";

const App = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTokenFromURL = () => {
      // Get the access token from the URL hash parameters
      const hashParams = new URLSearchParams(window.location.hash.slice(1)); 
      return hashParams.get("access_token");
    };

    const redirectToCognito = () => {
      const userPool = "hexagon-imi";
      const awsRegion = "ap-southeast-1";
      const clientId = "5is7m8qlgsk60m7seu3sfqnune";
      const responseType = "token";
      const scope = "email openid profile";
      const redirectUri = "https://dumanga.github.io/cognito-login-app/";

      const cognitoLoginUrl = `https://${userPool}.auth.${awsRegion}.amazoncognito.com/login?client_id=${clientId}&response_type=${responseType}&scope=${scope}&redirect_uri=${redirectUri}`;
      window.location.href = cognitoLoginUrl; 
    };

    const fetchUserInfo = async (token) => {
      try {
        const response = await axios.get("https://hexagon-imi.auth.ap-southeast-1.amazoncognito.com/oauth2/userInfo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    const token = getTokenFromURL();
    if (token) {
      fetchUserInfo(token);
    } else {
      redirectToCognito();
    }
  }, []);

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
      {loading ? (
        <>
          <CircularProgress />
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Loading...
          </Typography>
        </>
      ) : userInfo ? (
        <Card>
          <CardContent>
            <Typography variant="h4">Welcome, {userInfo.name}</Typography>
            <Typography variant="body1">Email: {userInfo.email}</Typography>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="h6">Unable to fetch user information.</Typography>
      )}
    </Box>
  );
};

export default App;
