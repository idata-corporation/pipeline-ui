/* eslint-disable */
import React, { Component } from "react";
import Dashboard from "components/Dashboard";
import Nav from "components/Nav";
import axios from "axios";
import { trackPromise } from 'react-promise-tracker';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Login from "components/forms/components/FirstTimeLogin";
import ForgotPassword from 'components/forms/components/ForgotPassword';
import ChangePassword from 'components/forms/components/ChangePassword';
import Reset from 'components/forms/components/PasswordReset';
import { Auth } from 'aws-amplify';
import Amplify from "aws-amplify";
/**
 * @componentName App
 * @description App Component is the main component in React which acts as a container for all other components.
 */
const ENDPOINT = process.env.REACT_APP_API_GATEWAY_ENDPOINT;
const X_API_KEY = process.env.REACT_APP_X_API_KEY;
const COGNITO_USER_APP_CLIENT_ID = process.env.REACT_APP_COGNITO_USER_APP_CLIENT_ID;
const COGNITO_USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID;
const REACT_APP_REQUIRE_LOGIN = process.env.REACT_APP_REQUIRE_LOGIN.toLowerCase() === 'true' ? true : false;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataset: [],
      user: null,
      isEmptyState: true,
      isAddTripState: false,
      isLogin: false,
      isAuthenticated: false,
      isAuthenticating: true,
      username: "Account"
    };
  }

  /** Function for getting datasets that are displayed on home page.*/ 
  fetchData(statusType) {
    let activeTab = "dataset";
    if (localStorage.getItem('tabType') !== null) {
      activeTab = localStorage.getItem('tabType');
    }
    trackPromise(
      axios
        .get(ENDPOINT + `/${activeTab}/status?page=1`, { mode: "no-cors",  headers: { "X-API-Key": X_API_KEY} })
        .then((res) => {
          const dataset = res.data;
          this.setState({dataset});
        })
        .catch((err) => {
          console.log(err);
        })
    );
  };

  componentDidMount() {
    console.warn = () => {};
    this.setUserProfile();
    this.configureAmplify(); 
    this.userAuthentication();  
  };

  isLogin(isLogin) {
    this.setState({ isLogin: isLogin });
  };
  
  setUserProfile = () => {
    if (this.state.user) {
      const token = this.state.user.username;
      if (token) {
        this.setState({
          username: token
        })
      }
    }
  };

  setAuthStatus = authenticated => {
    this.setState({ isAuthenticated: authenticated })
  };

  setUser = user => {
    this.setState({ user: user });
  };

  /** Function for geting currentSession and check if user is authenticated, if YES- call functions for fetch app data */
  async userAuthentication() {
    try {
      if (REACT_APP_REQUIRE_LOGIN === true) {
        await Auth.currentSession();
        this.setAuthStatus(true);
        const user = await Auth.currentAuthenticatedUser();
        this.setState(user);
      }

      this.fetchData('dataset');
    } catch (error) {
      console.log(error);
    }
    this.setState({ isAuthenticating: false });
  };

  handleClick = () => {
    this.setState({
      ...this.state,
      isEmptyState: true,
      isAddTripState: false,
    });
  };

  configureAmplify() {
    if (REACT_APP_REQUIRE_LOGIN === true) {
      Amplify.configure({
        Auth: {
            mandatorySignId: true,
            region: "us-east-1",
            userPoolId: COGNITO_USER_POOL_ID,
            userPoolWebClientId: COGNITO_USER_APP_CLIENT_ID
        }
      })
    }
  };

  render() {
    const authProps = {
      isAuthenticated: this.state.isAuthenticated,
      user: this.state.user,
      setAuthStatus: this.setAuthStatus,
      setUser: this.setUser
    }

    return (
      !this.state.isAuthenticating &&
      <Router>
        <Nav onClick={() => this.handleClick.bind(this)} auth={authProps} isLogin={this.state.isLogin} username={this.state.username}/>
        {
          REACT_APP_REQUIRE_LOGIN === true ? (
            <Route exact path="/" >
              <Login
                isLogin={this.isLogin.bind(this)}
                auth={authProps}
              />
            </Route>
          ) : (
            <Route exact path="/" >
              <Redirect to="/monitoring" />
            </Route>
            )
        }   
        <Switch>
          <Route exact path="/monitoring">
              <Dashboard
                isDataset={false}
                isAddTripState={false}
                dataSource={this.state.dataset}
                loadMoreData={this.fetchData.bind(this)}
                isLogin={this.isLogin.bind(this)}
                auth={authProps}
              />
          </Route>
          <Route exact path="/forgotpassword">
            <ForgotPassword
              isLogin={this.isLogin.bind(this)}
              auth={authProps}
            />
          </Route>
          <Route exact path="/changePassword">
            <ChangePassword
              auth={authProps}
            />
          </Route>
          <Route exact path="/reset">
            <Reset
              isLogin={this.isLogin.bind(this)}
              auth={authProps}
            />
          </Route>
        </Switch>
      </Router>
    );
  }
}
export default App;
