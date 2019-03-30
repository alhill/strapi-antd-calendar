import React, { Component } from 'react'
import { Layout } from 'antd'
import Frame from './Frame';


class Analitica extends Component{
    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame>
                    <h1>Analitica</h1>
                </Frame>
            </Layout>
        )
    }
}

export default Analitica