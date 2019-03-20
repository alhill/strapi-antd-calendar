import React, { Component } from 'react'
import { Menu, Layout, Typography, Calendar, Modal, message, Avatar } from 'antd'
import moment from 'moment';
const { Header, Footer, Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

class Home extends Component{
    constructor(props){
        super(props)
        this.state = {
            modalPedirDia: false,
            dias: [{ fecha: "" }]
        }
    }
    componentDidMount(){
        fetch("http://localhost:1337/dias", {
            method: "GET"
        }).then(resp => {
            resp.json().then(dias => {
                this.setState({ dias })
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    }
   
    getListData = value => {
        let listData;
        const arrDias = this.state.dias.map(dia => {
            return moment(dia.fecha).format("YYYYMMDD")
        })
        if( arrDias.includes(moment(value).format("YYYYMMDD"))){
            listData = [{ user: "Akukule", fecha: moment(value)}]
        }
        return listData || [];
    }

    dateCellRender = value => {
        const listData = this.getListData(value);
        return (
            <ul className="events">
            {
                listData.map(item => (
                    <Avatar key={item.fecha}>{ item.user[0] }</Avatar>
                ))
            }
            </ul>
        );
    }

    solicitarDia = fecha => {
        fetch("http://localhost:1337/dias", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fecha
            })
        }).then(resp => {
            resp.json().then(dia => {
                message.info(`Has solicitado como día libre el ${moment(this.state.dia).format("DD/MM/YYYY")}. Tu solicitud está pendiente de aprobación`); 
                this.setState({ modalPedirDia: false, dias: [...this.state.dias, dia] })
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))

    }

    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Header>
                        <Title style={{ color: "#f0f0f0", margin: "0.25em" }}>Blacknosaur Calendar</Title>
                </Header>
                <Layout>
                    <Sider>
                        <Menu theme="dark" mode="vertical-left">
                            <Menu.Item>Blacknosaur Calendar Option 1</Menu.Item>
                            <Menu.Item>Blacknosaur Calendar Option 2</Menu.Item>
                            <Menu.Item>Blacknosaur Calendar Option 3</Menu.Item>
                            <Menu.Item>Blacknosaur Calendar Option 4</Menu.Item>
                        </Menu>
                    </Sider>
                    <Layout>
                        <Content style={{ padding: "2em" }}>
                            <Calendar
                                onSelect={evt => this.setState({
                                    dia: evt,
                                    modalPedirDia: true
                                })} 
                                dateCellRender={this.dateCellRender}
                            />
                        </Content>
                        <Footer>
                            <Paragraph>&reg;2019 Blacknosaur & AlHill Development</Paragraph>
                        </Footer>
                    </Layout>
                </Layout>
                <Modal
                    title="Solicitar día libre"
                    visible={this.state.modalPedirDia}
                    onOk={() => this.solicitarDia( this.state.dia )}
                    onCancel={() => this.setState({ modalPedirDia: false })}
                >
                    <p>¿Quieres solicitar como día libre el { moment(this.state.dia).format("DD/MM/YYYY") }?</p>
                </Modal>
            </Layout>
        )
    }
}

export default Home