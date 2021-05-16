import React, { useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import './App.scss';
import Dashboard from './dashboard/Dashboard';
import Queue from './queue/Queue';
import Room from './Room/Room';
import { ProtectedRoute } from "./Protectedroute/Protectedroute";
import { getUserDemographic } from '../data/api';

// this component deals with all routing.
export default function App() {
  useEffect(() => {
    // wrap in useeffect so it runs only onMount
    getUserDemographic(); // probe for session
  }, []);

  return (
    <div id="host">
      <Switch>
        {/*  route definitions */}
        <Route exact={true} path="/dashboard">
          <Dashboard></Dashboard>
        </Route>
        <ProtectedRoute exact={true} path="/room/:id" component={Room} />
        <Route exact={true} path="/Queue/" component={Queue} />
        <Route path="/">
          {/* on any undefined path, redirect to dashboard (dashboard will redirect to login if no auth)*/}
          <Redirect to={'/dashboard'} />
        </Route>
      </Switch>
    </div>
  );
}
