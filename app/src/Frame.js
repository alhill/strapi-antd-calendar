import React from 'react'
import { Menu, Layout, Typography, Avatar } from 'antd'
import { Link } from 'react-router-dom'
import { getUserInfo } from './utils/auth';
const { Header, Footer, Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

const user = getUserInfo()
console.log( user )
const Frame = ({ children }) => [
    <Header key="header" style={{ backgroundColor: "black", display: "flex", alignItems: "center" }}>
        <Title style={{ color: "#f0f0f0", margin: "0.25em", display: "flex", alignItems: "center" }}>
            <img src={process.env.REACT_APP_API_URL + "/logo.png"} alt="Blacknosaur Logo" style={{ filter: "invert(1)", height: 45, marginRight: 20 }} /> Portal del Blacknosaurio
        </Title>
        <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
    </Header>,
    <Layout key="layout">
        <Sider style={{ backgroundColor: "#191919" }}>
            <Menu theme="dark" style={{ backgroundColor: "#191919" }} mode="vertical-left">
                <Menu.Item><Link to="/calendario">Calendario</Link></Menu.Item>
                <Menu.Item><Link to="/documentos">Documentos</Link></Menu.Item>
                <Menu.Item><Link to="/usuarios">Usuarios</Link></Menu.Item>
                <Menu.Item><Link to="/analitica">Analítica</Link></Menu.Item>
                <Menu.Item><Link to="/configuracion">Configuración</Link></Menu.Item>
            </Menu>
        </Sider>
        <Layout>
            <Content style={{ padding: "2em" }}>
                { children }
            </Content>
            <Footer>
                <Paragraph>&reg; 2019 - Made with <span role="img" aria-label="heart">❤️</span>, <span role="img" aria-label="beer">🍺</span> and <span role="img" aria-label="poo">💩</span> by <a href="https://blacknosaur.com" target="_blank" rel="noopener noreferrer">Blacknosaur</a> & <a href="https://alhill.dev" target="_blank" rel="noopener noreferrer">AlHill Development</a></Paragraph>
            </Footer>
        </Layout>
    </Layout>
]

export default Frame