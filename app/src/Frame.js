import React, { Component } from 'react'
import { Menu, Layout, Typography, Avatar, Badge, Dropdown, Icon, message } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { getUserInfo, clearData, getAvatar } from './utils/auth';
import { socketConnect } from 'socket.io-react';
import { connect } from 'react-redux';
import { fetchES, cambiarBlueCollar } from './actions';
import ScrollWatch from './ScrollWatch';
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
        this.props.socket.on('notification', msg => {
            //console.log(msg)
            // if(user.equipo === msg.equipo && user.manager === true){
            //     this.setState({ userNotif: this.state.userNotif + 1 })
            // }
            if(msg.es){
                this.props.dispatch(fetchES())
            }
        });
        this.setState({ user })
    }

    render(){
        const { user } = this.state
        const { isLogged } = this.props
        const menuAvatar = (
            <Menu>
                <Menu.Item>
                    <Link to="/perfil">Perfil</Link>
                </Menu.Item>
                <Menu.Item onClick={this.cerrarSesion}>
                    <span>Cerrar sesión</span>
                </Menu.Item>
                {(user && user.manager) && 
                    <Menu.Item onClick={() => this.props.dispatch(cambiarBlueCollar(!this.props.blueCollar))}>
                        <span>{ this.props.blueCollar ? "Modo Manager" : "Modo Blue Collar" }</span>
                    </Menu.Item>
                }
            </Menu>
        );

        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Header key="header" style={{ backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Title style={{ color: "#f0f0f0", margin: "0.25em", display: "flex", alignItems: "center" }}>
                        <img src={process.env.REACT_APP_API_URL + "/logo.png"} alt="Blacknosaur Logo" style={{ filter: "invert(1)", height: 45, marginRight: 20 }} /> Portal del Blacknosaurio
                    </Title>
                    { isLogged &&
                        <Dropdown overlay={menuAvatar}>
                            <Avatar style={{ boxShadow: this.props.blueCollar ? "inset 0 0 4px 1px blue" : "none" }} src={(user && user.avatar) && (process.env.REACT_APP_API_URL + user.avatar.url)}>{ user && user.username[0].toUpperCase() }</Avatar>
                        </Dropdown>
                    }
                </Header>
                <Layout key="layout" style={{ flex: 1 }}>
                    { isLogged &&
                        <Sider style={{ backgroundColor: "#191919" }}>
                            <Menu 
                                theme="dark" 
                                style={{ backgroundColor: "#191919" }} 
                                mode="vertical-left"
                                selectedKeys={[window.location.pathname]}
                            >
                                <Menu.Item key="/calendario"><Link to="/calendario">Calendario</Link></Menu.Item>
                                <Menu.Item key="/documentos"><Link to="/archivos">Documentos</Link></Menu.Item>
                                <Menu.Item key="/registro"><Link to="/registro">Registro E/S</Link></Menu.Item>
                                <Menu.Item key="/usuarios" style={{display: (user && (user.manager && !this.props.blueCollar)) ? "flex" : "none"}}>
                                    {/*<Badge count={this.state.userNotif}>*/}
                                        <Link to="/usuarios">Usuarios</Link>
                                    {/*</Badge>*/}
                                </Menu.Item>
                                {/* <Menu.Item key="/analitica" style={{display: (user && (user.manager && !this.props.blueCollar)) ? "flex" : "none"}}><Link to="/analitica">Analítica</Link></Menu.Item> */}
                                <Menu.Item key="/configuracion" style={{display: (user && (user.manager && !this.props.blueCollar)) ? "flex" : "none"}}><Link to="/configuracion">Configuración</Link></Menu.Item>
                            </Menu>
                        </Sider>
                    }
                    <Layout>
                        <Content style={{ padding: "2em", display: "flex", flexDirection: "column" }}>
                            <div style={{ flex: 1 }}>
                                { this.props.children }
                            </div>
                            <Footer style={{paddingBottom: 0}}>
                                <Paragraph>&reg; 2019 - Made with <span role="img" aria-label="heart">❤️</span>, <span role="img" aria-label="beer">🍺</span> and <span role="img" aria-label="poo">💩</span> by <a href="https://blacknosaur.com" target="_blank" rel="noopener noreferrer">Blacknosaur</a> & <a href="https://www.alhill.dev" target="_blank" rel="noopener noreferrer">AlHill Development</a></Paragraph>
                            </Footer>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        blueCollar: state.blueCollar,
    }
}

export default socketConnect(connect(mapStateToProps)(withRouter(Frame)))