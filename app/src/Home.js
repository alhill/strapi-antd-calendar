import React, { Component } from 'react'
import { Layout } from 'antd'
import Frame from './Frame';


class Home extends Component{
    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame>
                    <h1>Home</h1>
                </Frame>
            </Layout>
        )
    }
}

export default Home