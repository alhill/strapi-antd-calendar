import React, { Component } from 'react'
import { Menu, Layout, Typography, Avatar, Badge, Dropdown, Icon, message } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { getUserInfo, clearData, getAvatar } from './utils/auth';
import { socketConnect } from 'socket.io-react';
import PrivateComponent from './PrivateComponent';

const { Header, Footer, Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

class Frame extends Component{

    state = {
        user: {
            username: " ",
            avatar: {}
        },
        userNotif: 0
    }

    cerrarSesion = () => {
        clearData();
        message.info("¡Vuelve pronto!")
        this.props.history.push("/login")
    }

    async componentDidMount(){
        const user = getUserInfo()
//console.log(await getAvatar())
        console.log( user )
        this.props.socket.on('notification', msg => {
            if(user.equipo === msg.equipo && user.manager === true){
                console.log(msg)
                this.setState({ userNotif: this.state.userNotif + 1 })
            }
        });
        this.setState({ user })
    }

    render(){
        const { user } = this.state
        const menuAvatar = (
            <Menu>
                <Menu.Item>
                    <Link to="/perfil">Perfil</Link>
                </Menu.Item>
                <Menu.Item onClick={this.cerrarSesion}>
                    <span>Cerrar sesión</span>
                </Menu.Item>
            </Menu>
        );
        return [
            <Header key="header" style={{ backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Title style={{ color: "#f0f0f0", margin: "0.25em", display: "flex", alignItems: "center" }}>
                    <img src={process.env.REACT_APP_API_URL + "/logo.png"} alt="Blacknosaur Logo" style={{ filter: "invert(1)", height: 45, marginRight: 20 }} /> Portal del Blacknosaurio
                </Title>
                <Dropdown overlay={menuAvatar}>
                    <Avatar src={user.avatar && (process.env.REACT_APP_API_URL + user.avatar.url)}>{ user.username[0].toUpperCase() }</Avatar>
                </Dropdown>
            </Header>,
            <Layout key="layout">
                <Sider style={{ backgroundColor: "#191919" }}>
                    <Menu theme="dark" style={{ backgroundColor: "#191919" }} mode="vertical-left">
                        <Menu.Item><Link to="/calendario">Calendario</Link></Menu.Item>
                        <Menu.Item><Link to="/documentos">Documentos</Link></Menu.Item>
                        <Menu.Item><Link to="/registro">Registro E/S</Link></Menu.Item>
                        <Menu.Item style={{display: user.manager ? "flex" : "none"}}>
                            <Badge count={this.state.userNotif}>
                                <Link to="/usuarios">Usuarios</Link>
                            </Badge>
                        </Menu.Item>
                        <Menu.Item style={{display: user.manager ? "flex" : "none"}}><Link to="/analitica">Analítica</Link></Menu.Item>
                        <Menu.Item style={{display: user.manager ? "flex" : "none"}}><Link to="/configuracion">Configuración</Link></Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Content style={{ padding: "2em", overflowY: "auto" }}>
                        { this.props.children }
                    </Content>
                    <Footer>
                        <Paragraph>&reg; 2019 - Made with <span role="img" aria-label="heart">❤️</span>, <span role="img" aria-label="beer">🍺</span> and <span role="img" aria-label="poo">💩</span> by <a href="https://blacknosaur.com" target="_blank" rel="noopener noreferrer">Blacknosaur</a> & <a href="https://alhill.dev" target="_blank" rel="noopener noreferrer">AlHill Development</a></Paragraph>
                    </Footer>
                </Layout>
            </Layout>
        ]
    }
}

export default socketConnect(withRouter(Frame))