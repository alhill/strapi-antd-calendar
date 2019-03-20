import React from 'react'
import { Typography, Layout, Card } from 'antd';

const FourOhFour = () => (
    <Layout style={{ height: "100vh"}}>
        <Layout.Content style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Card style={{ width: 450, maxWidth: "90%" }}>
                <Typography.Title style={{ margin: 0, textAlign: "center" }}>404!</Typography.Title>
            </Card>
        </Layout.Content>
    </Layout>
)

export default FourOhFour