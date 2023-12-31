import { Link, Outlet, useLocation } from "react-router-dom";
import { Avatar } from "@mui/material";
import AService from "../utils/Avatar";
import { useQuery } from "@apollo/client";
import "../styles/Layout.css";
import { QUERY_USER, QUERY_ME } from "../utils/query";
import Auth from "../utils/auth";
import { BottomNavigation, BottomNavigationAction, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect } from "react";
import * as React from "react";
import UserIcon from "../components/UserIcon";
import { useNavigate } from "react-router-dom";
const Layout = () => {
  const [value, setValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [loggedIn, setLoggedIn] = useState();
  const location = useLocation();

  const { data: ME_DATA, loading, refetch } = useQuery(QUERY_ME);

  const navigate = useNavigate();

  useEffect(
    function () {
      handlePageChange();
      setUsers(ME_DATA?.me?.friends);
      setLoggedIn(Auth.loggedIn());
      console.log(loggedIn);
    },
    [location, users, loading]
  );

  const handlePageChange = () => {
    const friendRe = /^\/friends\/?[a-zA-Z0-9]*$/i;
    const echoRe = /^\/echo\/?[A-Za-z0-9]*$/i;

    if (friendRe.test(location.pathname)) {
      setValue(1);
      return;
    } else if (echoRe.test(location.pathname)) {
      setValue(2);
      return;
    } else if (location.pathname === "/") {
      setValue(0);
      return;
    }

    setValue(-1);
  };

  const handleClick = (loc) => {
    navigate(loc);
  };

  const isLoggedIn = () => {
    const isLogged = Auth.loggedIn();

    if (isLogged && ME_DATA) {
      return (
        <>
          <UserIcon username={ME_DATA.me.username} id={ME_DATA.me._id} />
        </>
      );
    } else {
      return;
    }
  };

  const showUsers = () => {
    if (loading) {
      return <></>;
    }
    return (
      users &&
      users.map(({ username, _id }) => {
        return (
          <li className="friend" key={_id}>
            <Link to={`/message/${_id}`}>
              <Avatar
                alt="User icon"
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: AService.stringToColor(username),
                }}
                className="userIcon"
              >
                {AService.stringAvatar(username)}
              </Avatar>
            </Link>
          </li>
        );
      })
    );
  };

  return (
    <>
      <article className="home-main">
        <aside className="user-section">
          {isLoggedIn()}
          <div className="friendList">
            {users && users.length != 0 ? (
              <h3>Friends</h3>
            ) : Auth.loggedIn() ? (
              <h3>Click the friends tab to add people</h3>
            ) : (
              <h3>Login to begin</h3>
            )}
            <ul>{showUsers()}</ul>
          </div>

          <Box
            sx={{
              width: "100%",
              bottom: "0",
              left: "0",
              color: "white",
            }}
            className="navBox"
          >
            <BottomNavigation
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
              sx={{ backgroundColor: "#151515", color: "white" }}
            >
              <BottomNavigationAction
                label="Home"
                icon={<HomeIcon />}
                sx={{ color: "white" }}
                onClick={() => handleClick("")}
              />
              <BottomNavigationAction
                label="Friends"
                icon={<PeopleIcon />}
                sx={{
                  color: loggedIn ? "white" : "grey",
                }}
                onClick={() => handleClick("friends")}
                disabled={!loggedIn}
              />
              <BottomNavigationAction
                label="Echos"
                icon={<SearchIcon />}
                sx={{ color: loggedIn ? "white" : "grey" }}
                onClick={() => {
                  handleClick("echo");
                }}
                disabled={!loggedIn}
              />
            </BottomNavigation>
          </Box>
        </aside>
        <div className="mainMessageSection">
          <Outlet />
        </div>
      </article>
    </>
  );
};

export default Layout;
