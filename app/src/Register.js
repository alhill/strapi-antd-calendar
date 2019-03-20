import React, { Component } from 'react'
import { Form, Icon, Input, Button, Layout, Card, Row, Col } from 'antd';
import { saveAuthData } from './utils/auth';

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class Register extends Component{
    constructor(props){
        super(props)
        this.state = {
            errorUser: false,
            errorEmail: false,
            errorPw: false
        }
    }
    componentDidMount() {
        // To disabled submit button at the beginning.
        this.props.form.validateFields();
    }

    validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
        // console.log('Received values of form: ', values);
            if (!err) {
                if( values.password === values.password2 ){
                    if(this.validateEmail(values.email)){
                        fetch("http://localhost:1337/auth/local/register", {
                            method: "POST",
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ 
                                username: values.userName, password: values.password, email: values.email 
                            })
                        }).then(resp => {
                            resp.json().then(data => {
                                this.saveAuthData(data)
                                this.props.history.push("/nuevousuario")
                            }).catch(err => console.log(err))
                        }).catch(err => console.log(err))
                    }
                    else{
                        this.setState({ errorEmail: true })
                    }
                }
                else{
                    this.setState({ errorPw: true })
                }
          }
        });
    }       

    render(){
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        const userNameError = isFieldTouched('userName') && getFieldError('userName');
        const emailError = isFieldTouched('email') && getFieldError('email');
        const passwordError = isFieldTouched('password') && getFieldError('password');
        const password2Error = isFieldTouched('password2') && getFieldError('password2');

        return (
            <Layout style={{ height: "100vh"}}>
                <Layout.Content style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Card style={{ width: 450, maxWidth: "90%" }}>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Item
                                validateStatus={( userNameError || this.state.errorUser ) ? 'error' : ''}
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
                                validateStatus={( emailError || this.state.errorEmail ) ? 'error' : ''}
                                help={emailError || ''}
                                >
                                { getFieldDecorator('email', { rules: [{ required: true, message: 'Introduce tu email' }] })(
                                    <Input 
                                        onChange={e => this.setState({ email: e.target.value })}
                                        prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                        type="email"
                                        placeholder="Email" 
                                    />
                                )}
                            </Form.Item>
                            <Form.Item
                                validateStatus={( passwordError || this.state.errorPw ) ? 'error' : ''}
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
                            <Form.Item
                                validateStatus={( password2Error || this.state.errorPw ) ? 'error' : ''}
                                help={password2Error || ''}
                                >
                                { getFieldDecorator('password2', { rules: [{ required: true, message: 'Repite la contraseña' }] })(
                                    <Input 
                                        onChange={e => this.setState({ pw: e.target.value })} 
                                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                        type="password" 
                                        placeholder="Repetir contraseña" 
                                    />
                                )}
                            </Form.Item>
                            <Form.Item>
                                <Row>
                                    <Col style={{ justifyContent: "center", display: "flex" }}>
                                        <Button type="primary" onClick={this.handleSubmit}>
                                            Registrarse
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Item>
                        </Form>
                    </Card>
                </Layout.Content>
            </Layout>
        )
    }
}

export default Form.create({ name: 'register_form' })(Register)



