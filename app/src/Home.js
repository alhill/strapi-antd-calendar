import React, { Component } from 'react'
import { getToken } from './utils/auth';
import { Layout } from 'antd'
import Frame from './Frame';


class Home extends Component{
    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>Home</h1>
                </Frame>
            </Layout>
        )
    }
}

export default Home