import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import "@fontsource/roboto";

import App from "./App";
import SignIn from "pages/SignIn/";
import Anecdotes from "pages/Anecdotes/";
import ForceMail from "pages/ForceMail/";
import MailCustomPhoto from "pages/MailCustomPhoto/";
import ModerateFriday from "pages/ModerateFriday/ModerateFriday";

import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/signin" component={SignIn} />
        <Route path="/anecdotes" component={Anecdotes} />
        <Route path="/forcemail" component={ForceMail} />
        <Route path="/customphoto" component={MailCustomPhoto} />
        <Route path="/moderate" component={ModerateFriday} />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
