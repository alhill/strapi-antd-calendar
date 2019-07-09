import React, { Component } from 'react'
import { Menu, Layout, Typography, Avatar, Badge, Dropdown, Icon, message, Button, Modal, Tag } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { getUserInfo, clearData } from './utils/auth';
import { mayusculizer } from './utils/func';
import request from './utils/request';
import { socketConnect } from 'socket.io-react';
import { connect } from 'react-redux';
import moment from 'moment'
import { fetchES, cambiarBlueCollar, fetchCalendario, fetchUsuarios, falloCarga } from './actions';

const { Header, Footer, Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

class Frame extends Component{
    state = {
        user: {
            username: " "
        },
        local: false,
        hoy: [],
        loading: true
    }

    iframe = React.createRef()

    cerrarSesion = () => {
        clearData();
        message.info("¡Vuelve pronto!")
        this.props.history.push("/login")
    }

    async componentDidMount(){
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

        if(this.props.es.users && this.props.dias){
            const registros = [].concat.apply([], this.props.es.users.map(u => u.registros)).map(r => r.aprobado)
            const diasPorConfirmar = this.props.dias.map(u => u.aprobado).includes(null) || this.props.dias.map(u => u.aprobado).includes(false) ? true : false
            const registrosPorConfirmar = registros.includes(false) || registros.includes(null) ? true : false
            const usuariosPorConfirmar = this.props.usuarios.map(u => u.confirmed).includes(false) ? true : false

            this.setState({ 
                diasPorConfirmar,
                registrosPorConfirmar,
                usuariosPorConfirmar
            })
        }

        if(this.props.auth && this.props.auth.registros){
            const hoy = this.props.auth.registros.filter(r => moment(r.fecha).isSame(moment(), "day"))
            this.setState({ hoy })
        }
    }

    componentDidUpdate(prevProps, prevState){
        const { errorCarga } = this.props
        if(errorCarga.error){
            this.props.dispatch(falloCarga({ error: false }))
            this.props.history.push(errorCarga.redirectTo || "/login")
        }

        if(this.props.dias !== prevProps.dias && this.props.dias){
            console.log(this.props.dias)
            if(this.props.dias.map(u => u.aprobado).includes(null) || this.props.dias.map(u => u.aprobado).includes(false)){
                this.setState({ diasPorConfirmar: true })
            }
            else{ this.setState({ diasPorConfirmar: false }) }
        }
        else if(this.props.es !== prevProps.es && this.props.es){
            const registros = [].concat.apply([], this.props.es.users.map(u => u.registros)).map(r => r.aprobado)
            if(registros.includes(false) || registros.includes(null)){
                this.setState({ registrosPorConfirmar: true})
            }
            else{ this.setState({ registrosPorConfirmar: false }) }
        }
        else if(this.props.usuarios !== prevProps.usuarios && this.props.usuarios){
            if(this.props.usuarios.map(u => u.confirmed).includes(false)){
                this.setState({ usuariosPorConfirmar: true })
            }
            else{ this.setState({ usuariosPorConfirmar: false }) }
        }
        else if((this.props.auth !== prevProps.auth) && this.props.auth){
            const hoy = this.props.auth.registros.filter(r => moment(r.fecha).isSame(moment(), "day"))
            this.setState({ hoy })
        }
    }

    fichar = () => {
        Modal.confirm({
            title: `${ mayusculizer(this.props.auth.nombre) } - ${ moment().format("LLL")}`,
            content: `Vas a fichar para ${this.state.hoy.length % 2 ? "salir." : "entrar."}
            ${ this.state.hoy.length > 0 ? ("Has fichado hoy " + this.state.hoy.length + " ve" + (this.state.hoy.length === 1 ? "z" : "ces")) 
                                         : "No has fichado todavía hoy"}`,
            onOk: () => {
                request("/registros", {
                    method: "POST",
                    body: {
                        fecha: moment().format(),
                        user: this.props.auth._id,
                        ultimoEditor: this.props.auth._id,
                        aprobado: true
                    }
                }).then(data => {
                    message.success("Has fichado correctamente a las " + moment().format("HH:mm"))
                }).catch(err => {
                    message.error("Se ha producido un error")
                    console.log(err)
                })
            }
        })
    }

    abrirPuerta = () => {
        this.iframe.current.src = null
        this.iframe.current.src = "http://192.168.1.65:24491/puerta"
    }

    render(){
        const { user } = this.state
        const { isLogged, auth } = this.props
        const menuAvatar = (
            <Menu>
                <Menu.Item>
                    <Link to="/perfil">Perfil</Link>
                </Menu.Item>
                <Menu.Item onClick={this.cerrarSesion}>
                    <span>Cerrar sesión</span>
                </Menu.Item>
                {(auth && auth.manager) && 
                    <Menu.Item onClick={() => this.props.dispatch(cambiarBlueCollar(!this.props.blueCollar))}>
                        <span>{ this.props.blueCollar ? "Modo Manager" : "Modo Blue Collar" }</span>
                    </Menu.Item>
                }
            </Menu>
        );
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Header key="header" style={{ backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link to="/">
                        <Title style={{ color: "#f0f0f0", margin: "0.25em", display: "flex", alignItems: "center" }}>
                            <img src={process.env.REACT_APP_API_URL + "/logo.png"} alt="Blacknosaur Logo" style={{ filter: "invert(1)", height: 45, marginRight: 20 }} /> Portal del Blacknosaurio
                        </Title>
                    </Link>
                    { isLogged &&
                        <Dropdown overlay={menuAvatar}>
                            <Avatar style={{ objectFit: "cover", boxShadow: this.props.blueCollar ? "inset 0 0 4px 1px blue" : "none" }} src={(auth && auth.avatar) && (process.env.REACT_APP_API_URL + auth.avatar.url)}>{ user && user.username && user.username[0].toUpperCase() }</Avatar>
                        </Dropdown>
                    }
                </Header>
                <Layout key="layout" style={{ flex: 1 }}>
                    { isLogged &&
                        <Sider style={{ backgroundColor: "#191919" }}>
                            <Menu 
                                theme="dark" 
                                style={{ backgroundColor: "#191919", height: "100%", position: "relative" }} 
                                mode="vertical-left"
                                selectedKeys={[window.location.pathname]}
                            >
                                <Menu.Item key="/"><Link to="/">Home</Link></Menu.Item>
                                <Menu.Item key="/calendario" style={{ display: "flex", alignItems: "center" }}>
                                    <Link to="/calendario">Calendario</Link>
                                    {( this.state.diasPorConfirmar && (auth && (auth.manager && !this.props.blueCollar))) &&
                                        <Badge style={{ transform: "initial", position: "static", marginLeft: 10 }} count={<Icon type="bell" style={{ color: '#f5222d' }} />}></Badge>
                                    }
                                </Menu.Item>
                                <Menu.Item key="/archivos"><Link to="/archivos">Documentos</Link></Menu.Item>
                                <Menu.Item key="/registro" style={{ display: "flex", alignItems: "center" }}>
                                    <Link to="/registro">Registro E/S</Link>
                                    {( this.state.registrosPorConfirmar && (auth && (auth.manager && !this.props.blueCollar))) &&
                                        <Badge style={{ transform: "initial", position: "static", marginLeft: 10 }} count={<Icon type="bell" style={{ color: '#f5222d' }} />}></Badge>
                                    }
                                </Menu.Item>
                                <Menu.Item key="/exportacion" style={{ alignItems: "center", display: (auth && (auth.manager && !this.props.blueCollar)) ? "flex" : "none"}}>
                                    <Link to="/exportacion">Exportación</Link>
                                </Menu.Item>
                                <Menu.Item key="/usuarios" style={{ alignItems: "center" }}>
                                    <Link to="/usuarios">Usuarios</Link>
                                    {( this.state.usuariosPorConfirmar && (auth && (auth.manager && !this.props.blueCollar))) &&
                                        <Badge style={{ transform: "initial", position: "static", marginLeft: 10 }} count={<Icon type="bell" style={{ color: '#f5222d' }} />}></Badge>       
                                    }
                                </Menu.Item>
                                <Menu.Item key="/grupos" style={{ alignItems: "center", display: (auth && (auth.manager && !this.props.blueCollar)) ? "flex" : "none"}}>
                                    <Link to="/grupos">Grupos</Link>
                                </Menu.Item>
                                <Menu.Item key="/passwords" style={{ alignItems: "center" }}>
                                    <Link to="/passwords">Contraseñas</Link>
                                </Menu.Item>
                                <Menu.Item key="/configuracion" style={{ alignItems: "center", display: (auth && (auth.manager && !this.props.blueCollar)) ? "flex" : "none"}}>
                                    <Link to="/configuracion">Configuración</Link>
                                </Menu.Item>
                                <Menu.Item key="telefonillo" className="telefonillo" style={{ alignItems: "center", display: "flex", justifyContent: "space-between"  }}>
                                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <a style={{ flex: 1, color: "rgba(255, 255, 255, 0.65)" }} href="http://192.168.1.65:24491" target="_blank" rel="noopener noreferrer">Telefonillo </a>
                                        <Tag type="primary" onClick={() => this.abrirPuerta()}>Abrir&nbsp;<Icon  style={{ margin: 0 }} type="login"/></Tag>
                                    </div>
                                </Menu.Item> 
                                <Menu.Item key="fichar" style={{ position: "absolute", bottom: 10, width: "100%", display: "flex", justifyContent: "center" }}>
                                    <Button onClick={this.fichar}>
                                        <Icon type={this.state.hoy.length % 2 ? "smile" : "meh"} /> Fichar
                                    </Button> 
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
                <iframe style={{ height: 0, width: 0, border: 0 }} ref={this.iframe} src="" ></iframe>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        blueCollar: state.blueCollar,
        es: state.es,
        usuarios: state.usuarios,
        dias: state.dias,
        auth: state.auth,
        errorCarga: state.errorCarga
    }
}

export default socketConnect(connect(mapStateToProps)(withRouter(Frame)))