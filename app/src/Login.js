import React, { Component } from 'react'
import Frame from './Frame'
import { Form, Icon, Input, Button, Layout, Card, Row, Col, message } from 'antd';
import { saveAuthData, getToken } from './utils/auth';
import { connect } from 'react-redux'
import { fetchCalendario, fetchUsuarios, fetchES } from './actions'

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class Login extends Component{
    constructor(props){
        super(props)
        this.state = {
            error: false
        }
    }
    componentDidMount() {
        // To disabled submit button at the beginning.
        this.props.form.validateFields();
        if(getToken()){ this.props.history.push("/") }
    }
    
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
          if (!err) {
            //console.log('Received values of form: ', values);
            fetch(process.env.REACT_APP_API_URL + "/auth/local", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ identifier: values.userName, password: values.password })
            }).then(resp => {
                resp.json().then(data => {
                    console.log(data.user)
                    if(data.statusCode === 400){
                        this.setState({ error: true })
                    }
                    else if(!data.user.confirmed){
                        message.info("Tu acceso al equipo de trabajo todavía no ha sido aprobado")
                    }
                    else{
                        this.setState({ error: false })
                        saveAuthData(data);
                        this.props.dispatch(fetchUsuarios())
                        this.props.dispatch(fetchCalendario())
                        this.props.dispatch(fetchES())
                        this.props.history.push("/calendario")
                    }
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
          }
        });
    }       

    render(){
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        const userNameError = isFieldTouched('userName') && getFieldError('userName');
        const passwordError = isFieldTouched('password') && getFieldError('password');

        return (
            <Layout style={{ height: "100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <Layout.Content style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Card style={{ width: 450, maxWidth: "90%" }}>
                            <Form onSubmit={this.handleSubmit}>
                                <Form.Item
                                    validateStatus={( userNameError || this.state.error ) ? 'error' : ''}
                                    help={userNameError || ''}
                                    >
                                    { getFieldDecorator('userName', { rules: [{ required: true, message: 'Introduce tu nombre de usuario' }] })(
                                        <Input 
                                        onChange={e => this.setState({ user: e.target.value })}
                                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                        placeholder="Nombre de usuario" 
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    validateStatus={( passwordError || this.state.error ) ? 'error' : ''}
                                    help={passwordError || ''}
                                    >
                                    { getFieldDecorator('password', { rules: [{ required: true, message: 'Introduce tu contraseña' }] })(
                                        <Input 
                                            onChange={e => this.setState({ pw: e.target.value })} 
                                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                            type="password" 
                                            placeholder="Contraseña" 
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item>
                                    <Row>
                                        <Col span={12} style={{ justifyContent: "center", display: "flex" }}>
                                            <Button type="primary" onClick={() => this.props.history.push("/register")}>
                                                Registrarse
                                            </Button>
                                        </Col>
                                        <Col span={12} style={{ justifyContent: "center", display: "flex" }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                disabled={hasErrors(getFieldsError())}
                                                >
                                                Acceder
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Layout.Content>
                </Frame>
            </Layout>
        )
    }
}

export default Form.create({ name: 'login_form' })(connect()(Login))



