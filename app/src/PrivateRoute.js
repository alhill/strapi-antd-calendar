import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { getUserInfo } from './utils/auth';

export const PrivateRoute = ({ component: Component, onlyManager = false, ...rest }) => {
    const userInfo = getUserInfo();
    return(
        <Route
            {...rest}
            render={props => 
                userInfo && (!onlyManager || ( onlyManager && userInfo.manager )) ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: { from: props.location }
                        }}
                    />
                )
            }
        />
    )
}