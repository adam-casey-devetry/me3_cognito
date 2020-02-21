import React, { Component } from "react";
import Amplify, { Auth } from "aws-amplify";
import config from "../config";

Amplify.configure({
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: config.cognito.IDENTITY_POOL_ID
  }
});

// Wait for the Facebook JS SDK to load
// Once loaded, enable the Login With Facebook button
function waitForInit() {
  return new Promise((res, rej) => {
    const hasFbLoaded = () => {
      if (window.FB) {
        res();
        console.log("SDK Loaded");
      } else {
        setTimeout(hasFbLoaded, 100);
      }
    };
    hasFbLoaded();
  });
}

export default class FacebookButton extends Component {
  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.state = {
      isLoading: true
    };
  }

  async componentDidMount() {
    console.log("FB button is mkounted");
    await waitForInit();
    this.createScript();
    this.setState({ isLoading: false });
  }

  // #1
  handleClick = () => {
    console.log("Login to FB attempt");
    window.FB.login(this.checkLoginState, { scope: "public_profile, email" });
  };

  // #2
  checkLoginState = () => {
    console.log("Checking login state");
    window.FB.getLoginStatus(this.statusChangeCallback);
  };

  // #3
  statusChangeCallback = response => {
    if (response.status === "connected") {
      console.log("You are connected");
      this.handleResponse(response.authResponse);
    } else {
      console.log("You're not connected!");
      this.handleError(response);
    }
  };

  signIn() {
    const fb = window.FB;
    fb.getLoginStatus(response => {
      if (response.status === "connected") {
        this.getAWSCredentials(response.authResponse);
      } else {
        fb.login(
          response => {
            if (!response || !response.authResponse) {
              return;
            }
            this.getAWSCredentials(response.authResponse);
          },
          {
            // the authorized scopes
            scope: "public_profile,email"
          }
        );
      }
    });
  }

  getAWSCredentials(response) {
    console.log("Get AWS credentials response: " + response);
    const { accessToken, expiresIn } = response;
    const date = new Date();
    const expires_at = expiresIn * 1000 + date.getTime();
    if (!accessToken) {
      return;
    }

    const fb = window.FB;
    fb.api("/me", { fields: "name,email" }, response => {
      const user = {
        name: response.name,
        email: response.email
      };

      Auth.federatedSignIn(
        "facebook",
        { token: accessToken, expires_at },
        user
      ).then(credentials => {
        console.log("User 2: " + user.name);
        console.log(credentials);
      });
    });
  }

  fbAsyncInit() {
    // init the fb sdk client
    const fb = window.FB;
    fb.init({
      appId: config.social.FB,
      cookie: true,
      xfbml: true,
      version: "v6.0"
    });
  }

  initFB() {
    const fb = window.FB;
    console.log("FB SDK inited");
  }

  createScript() {
    // load the sdk
    window.fbAsyncInit = this.fbAsyncInit;
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.onload = this.initFB;
    //script.onload = this.waitForInit;
    document.body.appendChild(script);
  }

  handleError(error) {
    console.log("Error encountered: " + error);
    alert(error);
  }

  async handleResponse(data) {
    const { email, accessToken: token, expiresIn } = data;
    console.log("accessToken: " + token);
    const expires_at = expiresIn * 1000 + new Date().getTime();
    const user = { email };
    console.log("User: " + user);
    this.setState({ isLoading: true });

    try {
      console.log("Calling FB");
      const response = await Auth.federatedSignIn(
        "facebook",
        { token, expires_at },
        user
      );
      console.log("After federatedSignIn attempt: " + response);
      this.setState({ isLoading: false });
      this.props.onLogin(response);
    } catch (e) {
      console.log("Federated Signin attempt failed");
      this.setState({ isLoading: false });
      this.handleError(e);
    }
  }

  render() {
    return (
      <div>
        <div>
          <button
            type="button"
            className="btn btn-primary"
            data-toggle="button"
            aria-pressed="false"
            autoComplete="off"
            onClick={this.handleClick}
            disabled={this.state.isLoading}
          >
            Login With Facebook
          </button>
        </div>
      </div>
    );
  }
}
