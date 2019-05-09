import React from 'react'
import Frame from './Frame'
import { Typography, Layout, Card } from 'antd'
import { getToken } from './utils/auth'

const FourOhFour = () => (
    <Layout style={{ height: "100vh"}}>
        <Frame isLogged={ getToken() ? true : false }>
            <Layout.Content style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Card style={{ width: 450, maxWidth: "90%" }}>
                    <Typography.Title style={{ margin: 0, textAlign: "center" }}>404!</Typography.Title>
                </Card>
            </Layout.Content>
        </Frame>
    </Layout>
)

export default FourOhFour