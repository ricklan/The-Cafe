import React from 'react';
import styles from './Protectedroute.module.scss';
import {Route, Redirect, RouteProps} from 'react-router-dom';

export const ProtectedRoute = ({
   component: Component,
   ...rest
}) => {
    return (
    <Route
        {...rest}
        render={(props: RouteProps) => {
            let path = props.location.pathname.split('/');
            if (props.location.state === path[path.length-1]) {
                return <Component {...props} />;
            } else {
                return (
                    <Redirect
                        to={{
                            pathname: "/dashboard",
                            state: {
                                from: props.location
                            }
                        }}
                    />
                );
            }
        }}
    />
    );
};

