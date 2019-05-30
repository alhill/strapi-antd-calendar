import React, { Component } from 'react'
import { Menu, Layout, Typography, Avatar, Badge, Dropdown, Icon, message, Button } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { getUserInfo, clearData, getAvatar } from './utils/auth';
import { socketConnect } from 'socket.io-react';
import { connect } from 'react-redux';
import { fetchES, cambiarBlueCollar, fetchCalendario, fetchUsuarios } from './actions';
import ScrollWatch from './ScrollWatch';
import PrivateComponent from './PrivateComponent';
import request from './utils/request';

const { Header, Footer, Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

class Frame extends Component{
    state = {
        user: {
            username: " ",
            avatar: {}
        },
        local: false
    }

    cerrarSesion = () => {
        clearData();
        message.info("¡Vuelve pronto!")
        this.props.history.push("/login")
    }

    async componentDidMount(){
        const user = getUserInfo()
        this.props.socket.on('notification', msg => {
            if(msg.es){
                this.props.dispatch(fetchES())
            }
            else if(msg.dia){
                this.props.dispatch(fetchCalendario())
            }
            else if(msg.user){
                this.props.dispatch(fetchUsuarios())
            }
        });

        // const local = await fetch("http://192.168.1.65:24491/holi")
        // if(local.ok){ this.setState({ local: true })}

        const registros = [].concat.apply([], this.props.es.map(u => u.registros)).map(r => r.aprobado)
        const diasPorConfirmar = this.props.dias.map(u => u.aprobado).includes(null) || this.props.dias.map(u => u.aprobado).includes(false) ? true : false
        const registrosPorConfirmar = registros.includes(false) || registros.includes(null) ? true : false
        const usuariosPorConfirmar = this.props.usuarios.map(u => u.confirmed).includes(false) ? true : false

        this.setState({ 
            user,
            diasPorConfirmar,
            registrosPorConfirmar,
            usuariosPorConfirmar
        })
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.dias !== prevProps.dias){
            if(this.props.dias.map(u => u.aprobado).includes(null) || this.props.dias.map(u => u.aprobado).includes(false)){
                this.setState({ diasPorConfirmar: true })
            }
            else{ this.setState({ diasPorConfirmar: false }) }
        }
        else if(this.props.es !== prevProps.es){
            const registros = [].concat.apply([], this.props.es.map(u => u.registros)).map(r => r.aprobado)
            if(registros.includes(false) || registros.includes(null)){
                this.setState({ registrosPorConfirmar: true})
            }
            else{ this.setState({ registrosPorConfirmar: false }) }
        }
        else if(this.props.usuarios !== prevProps.usuarios){
            if(this.props.usuarios.map(u => u.confirmed).includes(false)){
                this.setState({ usuariosPorConfirmar: true })
            }
            else{ this.setState({ usuariosPorConfirmar: false }) }
        }
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
                                <Menu.Item key="/calendario" style={{ display: "flex", alignItems: "center" }}>
                                    <Link to="/calendario">Calendario</Link>
                                    {( this.state.diasPorConfirmar && (user && (user.manager && !this.props.blueCollar))) &&
                                        <Badge style={{ transform: "initial", position: "static", marginLeft: 10 }} count={<Icon type="bell" style={{ color: '#f5222d' }} />}></Badge>
                                    }
                                </Menu.Item>
                                <Menu.Item key="/archivos"><Link to="/archivos">Documentos</Link></Menu.Item>
                                <Menu.Item key="/registro" style={{ display: "flex", alignItems: "center" }}>
                                    <Link to="/registro">Registro E/S</Link>
                                    {( this.state.registrosPorConfirmar && (user && (user.manager && !this.props.blueCollar))) &&
                                        <Badge style={{ transform: "initial", position: "static", marginLeft: 10 }} count={<Icon type="bell" style={{ color: '#f5222d' }} />}></Badge>
                                    }
                                </Menu.Item>
                                <Menu.Item key="/usuarios" style={{ alignItems: "center" }}>
                                    <Link to="/usuarios">Usuarios</Link>
                                    {( this.state.usuariosPorConfirmar && (user && (user.manager && !this.props.blueCollar))) &&
                                        <Badge style={{ transform: "initial", position: "static", marginLeft: 10 }} count={<Icon type="bell" style={{ color: '#f5222d' }} />}></Badge>       
                                    }
                                </Menu.Item>
                                <Menu.Item key="/grupos" style={{ alignItems: "center", display: (user && (user.manager && !this.props.blueCollar)) ? "flex" : "none"}}>
                                    <Link to="/grupos">Grupos</Link>
                                </Menu.Item>
                                <Menu.Item key="/configuracion" style={{ alignItems: "center", display: (user && (user.manager && !this.props.blueCollar)) ? "flex" : "none"}}>
                                    <Link to="/configuracion">Configuración</Link>
                                </Menu.Item>
                                {/*
                                    this.state.local &&
                                    <Menu.Item key="telefonillo" className="telefonillo" style={{ alignItems: "center", display: "flex", justifyContent: "space-between"  }}>
                                        <a href="http://192.168.1.65:24491" target="_blank" rel="noopener noreferrer">Telefonillo </a>
                                        <Button shape="circle" onClick={() => fetch("http://192.168.1.65:24491/puerta")}>
                                            <Icon style={{ margin: 0 }} type="alert" />
                                        </Button>
                                    </Menu.Item>          
                                */}
                                <Menu.Item key="telefonillo" className="telefonillo" style={{ alignItems: "center", display: "flex", justifyContent: "space-between"  }}>
                                    <a href="http://192.168.1.65:24491" target="_blank" rel="noopener noreferrer">Telefonillo </a>
                                </Menu.Item> 
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
        es: state.es,
        usuarios: state.usuarios,
        dias: state.dias
    }
}

export default socketConnect(connect(mapStateToProps)(withRouter(Frame)))