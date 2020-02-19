import React, { Component } from "react";
import Amplify, { Auth } from "aws-amplify";

// Wait for the Facebook JS SDK to load
// Once loaded, enable the Login With Facebook button
function waitForInit() {
  console.log("SDK Loaded");
  return new Promise((res, rej) => {
    const hasFbLoaded = () => {
      if (window.FB) {
        res();
      } else {
        setTimeout(hasFbLoaded, 100);
      }
    };
    hasFbLoaded();
  });
}

Amplify.configure({
  Auth: {
    domain: "me3.auth.us-east-2.amazoncognito.com/",
    redirectSignIn: "https://localhost:3000/",
    redirectSignOut: "https://localhost:3000/",
    responsetype: "token"
  }
});

export default class FacebookButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  async componentDidMount() {
    console.log("mounted");
    await waitForInit();
    this.setState({ isLoading: false });
  }

  statusChangeCallback = response => {
    if (response.status === "connected") {
      this.handleResponse(response.authResponse);
    } else {
      this.handleError(response);
    }
  };

  checkLoginState = () => {
    console.log("Checking login state");
    window.FB.getLoginStatus(this.statusChangeCallback);
  };

  handleClick = () => {
    console.log("test");
    window.FB.login(this.checkLoginState, { scope: "public_profile, email" });
  };

  handleError(error) {
    alert(error);
  }

  async handleResponse(data) {
    const { email, accessToken: token, expiresIn } = data;
    const expires_at = expiresIn * 1000 + new Date().getTime();
    const user = { email };
    this.setState({ isLoading: true });

    try {
      const response = await Auth.federatedSignIn(
        "Facebook",
        { token, expires_at },
        user
      );
      this.setState({ isLoading: false });
      this.props.onLogin(response);
    } catch (e) {
      this.setState({ isLoading: false });
      this.handleError(e);
    }
  }

  render() {
    return (
      <div>
        <div
          className="fb-login-button"
          data-width=""
          data-size="large"
          data-button-type="continue_with"
          data-auto-logout-link="false"
          data-use-continue-as="false"
          onClick={this.handleClick}
          disabled={this.state.isLoading}
        ></div>
      </div>
    );
  }
}
