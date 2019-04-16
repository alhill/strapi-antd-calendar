import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { getUserInfo } from './utils/auth';

export const PrivateRoute = ({ component: Component, onlyManager = false, ...rest }) => {
    return(
    <Route
        {...rest}
        render={props => 
            ( !onlyManager || ( onlyManager && getUserInfo().manager )) ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: "/",
                        state: { from: props.location }
                    }}
                />
            )
        }
    />
)}