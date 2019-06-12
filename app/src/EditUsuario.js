import React, { Component } from 'react'
import { getToken, getUserInfo } from './utils/auth';
import { Layout, Input, Form, Radio, Button, message } from 'antd'
import { connect } from 'react-redux'
import request from './utils/request'
import Frame from './Frame';
import { fetchUsuarios, fetchES } from './actions'


class EditUsuario extends Component{

    state = {
        usuario: {},
        duracionjornada: "",
        frasesStr: "",
        frases: [],
        frasePr: "",
        frasePrAct: false,
        manager: undefined
    }

    componentDidMount(){
        if(this.props.usuarios.length > 0){
            const usuario = this.props.usuarios.find(u => u._id === this.props.match.params.id) 
            console.log(usuario)
            this.setState({ 
                duracionjornada: usuario.duracionjornada,
                frasesStr: usuario.frases.reduce((a, b) => a + b + "\n", ""),
                frases: usuario.frases,
                frasePr: usuario.frasePrioritaria,
                frasePrAct: usuario.actFrasePrioritaria,
                manager: usuario.manager,
                usuario
            })
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.usuarios && this.props.usuarios !== prevProps.usuarios){
            const usuario = this.props.usuarios.find(u => u._id === this.props.match.params.id) 
            console.log(usuario)
            this.setState({ 
                duracionjornada: usuario.duracionjornada,
                frasesStr: usuario.frases.reduce((a, b) => a + b + "\n", ""),
                frases: usuario.frases,
                frasePr: usuario.frasePrioritaria,
                frasePrAct: usuario.actFrasePrioritaria,
                manager: usuario.manager,
                usuario
            })
        }
        else if( this.state.frasesStr !== prevState.frasesStr ){
            this.setState({ frases: this.state.frasesStr.split(/\n/gm) })
        }
    }

    guardarDatos = () => {
        if(this.state.duracionjornada > 0 && this.state.duracionjornada < 24){
            request("/users/" + this.state.usuario._id, {
                method: "PUT",
                body: {
                    frases: this.state.frases.filter(f => ![undefined, null, ""].includes(f)),
                    frasePrioritaria: this.state.frasePr,
                    actFrasePrioritaria: this.state.frasePrAct,
                    manager: this.state.manager,
                    duracionjornada: this.state.duracionjornada
                }
            }).then(data => {
                //console.log(data)
                message.success("Los cambios se guardaron correctamente")
                this.props.dispatch(fetchES())
                this.props.dispatch(fetchUsuarios())
            }).catch(err => {
                console.log(err)
                message.error("Se produjo un error durante el guardado")
            })
        }
        else{
            message.error("La duración media de la jornada ha de estar entre 0 y 24")
        }
    }

    render(){
        const { usuario } = this.state
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>{ usuario.username }</h1>
                    { getUserInfo().manager && [
                        <Form.Item key="editUserJornada" label="Duración media de su jornada laboral">
                            <Input type="number" value={this.state.duracionjornada} onChange={e => this.setState({ duracionjornada: e.target.value })} />
                        </Form.Item>,
                        <Form.Item key="editUserManager" label="Manager">
                            <Radio.Group  value={ this.state.manager }>
                                <Radio.Button value={true} onClick={() => this.setState({ manager: true })}>Sí</Radio.Button>
                                <Radio.Button value={false} onClick={() => this.setState({ manager: false })}>No</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    ]}
                    <Form.Item label="Frases (una por línea)">
                        <Input.TextArea rows={6} value={this.state.frasesStr} onChange={e => this.setState({ frasesStr: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Frase prioritaria">
                        <Input type="text" value={this.state.frasePr} onChange={e => this.setState({ frasePr: e.target.value })}/>
                        <Radio.Group value={ this.state.frasePrAct }>
                            <Radio.Button value={true} onClick={() => this.setState({ frasePrAct: true })}>Activada</Radio.Button>
                            <Radio.Button value={false} onClick={() => this.setState({ frasePrAct: false })}>Desactivada</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Button onClick={this.guardarDatos}>Guardar</Button>
                </Frame>
            </Layout>
        )
    }
}

const mapStateToProps = state => {
    return {
        usuarios: state.usuarios
    }
}

export default connect(mapStateToProps)(EditUsuario)