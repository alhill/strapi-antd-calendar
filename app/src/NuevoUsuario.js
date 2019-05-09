import React, { Component } from 'react'
import { Form, Icon, Input, Button, Layout, Card, Row, Col, message } from 'antd';
import { getHeaders, getUserInfo, getToken } from './utils/auth';
import { Typography } from 'antd';
import gql from './utils/gql';
import Frame from './Frame';

const { Title } = Typography;

const query = `{
    equipos(where: {nombre: "$nombre$"}){
        _id
    }
}`
class NuevoUsuario extends Component{
    constructor(props){
        super(props)
        this.state = {
            errorUser: false,
            errorEmail: false,
            errorPw: false
        }
    }
    // componentDidMount() {
    //     // To disabled submit button at the beginning.
    //     this.props.form.validateFields();
    // }
    
    solicitarAcceso = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            fetch(process.env.REACT_APP_API_URL + gql(query, { nombre: values.unirse }), { headers: getHeaders() })
                .then(response => {
                    console.log(response)
                    response.json().then(data => {
                        console.log(data)
                        if(data.data.equipos[0]){
                            fetch(process.env.REACT_APP_API_URL + "/users/" + getUserInfo()._id, {
                                method: "PUT",
                                headers: getHeaders(),
                                body: JSON.stringify({
                                    equipo: data.data.equipos[0]._id,
                                    confirmed: false
                                })
                            }).then(data => {
                                console.log(data)
                                if(data.ok){
                                    message.info(`Se ha solicitado con éxito el acceso al equipo "${values.unirse}"`)
                                }
                            })
                        }
                        else{
                            message.error(`No se ha encontrado ningún equipo "${values.unirse}"`); 
                        }
                    }).catch(err => console.log(err))
                }).catch(err => console.log(err))
        })
    }

    crearEquipo = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            fetch(process.env.REACT_APP_API_URL + "/equipos", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    nombre: values.crear,
                    users: [getUserInfo()._id]
                })
            }).then(response => {
                response.json().then(data => {
                    fetch(process.env.REACT_APP_API_URL + "/users/" + getUserInfo()._id, {
                        method: "PUT",
                        headers: getHeaders(),
                        body: JSON.stringify({
                            confirmed: true,
                            manager: true
                        })
                    }).then(() => {
                        this.props.history.push("/")
                    })
                }).catch(err => { console.log(err); message.error("Se ha producido un error al asignar el usuario al equipo recien creado") })
            }).catch(err => { console.log(err); message.error("Se ha producido un error al crear el equipo") })
        })
    }   

    render(){
        const { getFieldDecorator, getFieldError, isFieldTouched } = this.props.form;
        const unirseError = isFieldTouched('unirse') && getFieldError('unirse');
        const crearError = isFieldTouched('crear') && getFieldError('crear');

        return (
            <Layout style={{ height: "100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <Layout.Content style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <Form onSubmit={this.handleSubmit}>
                            <Card style={{ width: 450, maxWidth: "90%", marginBottom: "1em" }}>
                                <Title level={2}>Unirse a un equipo</Title>
                                <Form.Item
                                    validateStatus={( unirseError || this.state.errorUnirse ) ? 'error' : ''}
                                    help={unirseError || ''}
                                    >
                                    { getFieldDecorator('unirse', { rules: [{ required: true, message: 'Introduce el nombre del equipo' }] })(
                                        <Input 
                                            onChange={e => this.setState({ pw: e.target.value })} 
                                            prefix={<Icon type="team" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                            type="text" 
                                            placeholder="Nombre del equipo al que te quieres unir" 
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item>
                                    <Row>
                                        <Col style={{ justifyContent: "center", display: "flex" }}>
                                            <Button type="primary" onClick={this.solicitarAcceso}>
                                                Solicitar acceso
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Card>
                            <Card style={{ width: 450, maxWidth: "90%" }}>
                                <Title level={2}>Crear un equipo</Title>
                                <Form.Item
                                    validateStatus={( crearError || this.state.errorCrear ) ? 'error' : ''}
                                    help={crearError || ''}
                                    >
                                    { getFieldDecorator('crear', { rules: [{ required: true, message: 'Introduce el nombre del equipo' }] })(
                                        <Input 
                                            onChange={e => this.setState({ pw: e.target.value })} 
                                            prefix={<Icon type="usergroup-add" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                            type="password" 
                                            placeholder="Nombre del equipo a crear" 
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item>
                                    <Row>
                                        <Col style={{ justifyContent: "center", display: "flex" }}>
                                            <Button type="primary" onClick={this.crearEquipo}>
                                                Crear equipo
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Card>
                        </Form>
                    </Layout.Content>
                </Frame>
            </Layout>
        )
    }
}

export default Form.create({ name: 'nuevousuario_form' })(NuevoUsuario)



