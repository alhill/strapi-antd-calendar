import React, { Component } from 'react'
import { Layout, Typography, Calendar, Modal, message, Avatar, Button, Popover, Radio, Row, Table, Popconfirm, Tag } from 'antd'
import moment from 'moment';
import { getHeaders, getUserInfo, getToken } from './utils/auth';
import request from './utils/request';
import Frame from './Frame';
import PrivateComponent from './PrivateComponent';
import { connect } from 'react-redux'
import { fetchCalendario } from './actions';

const query = getUserInfo() ? `{
    dias(where: { equipo: "${getUserInfo().equipo }" }){
        _id
        fecha
        tipo
        aprobado
        user{
            _id
            username
            avatar{
                url
            }
        }
    }
}` : "{}"

class Calendario extends Component{
    state = {
        modalPedirDia: false,
        dias: [],
        diasFilter: [],
        diasPorAprobar: [],
        sel1: "libres",
        sel2: "global"
    }

    componentDidMount(){
        
        const columns = [{
            title: 'Nombre de usuario',
            key: 'user',
            render: r => r.user && r.user.username
        }, {
            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo'
        }, {
            title: 'Fecha',
            key: 'fecha',
            render: fecha => moment(fecha).format("YYYY-MM-DD")
        }, {
            title: 'Acción',
            key: 'action',
            render: (text, record) => (
              <span>
                <Popconfirm title={`¿Estás seguro de que deseas aceptar la solicitud de día ${record.tipo} para el día ${moment(record.fecha).format("YYYY-MM-DD")} a ${record.user && record.user.username}?`} onConfirm={evt => this.responderSolicitud(record, true)}>
                    <Tag color="green" key={`${record._id}_aceptar`}>Aprobar</Tag>
                </Popconfirm>
                <Popconfirm title={`¿Estás seguro de que deseas denegar la solicitud de día ${record.tipo} para el día ${moment(record.fecha).format("YYYY-MM-DD")} a ${record.user && record.user.username}?`} onConfirm={evt => this.responderSolicitud(record, false)}>
                    <Tag color="volcano" key={`${record._id}_denegar`}>Denegar</Tag>
                </Popconfirm>
              </span>
            ),
        }]
        this.setState({ columns })
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.sel1 !== this.state.sel1 || prevState.sel2 !== this.state.sel2){
            this.setState({ diasFilter: this.filtrarDias(this.state.dias) })
        }
        else if(prevProps.dias !== this.props.dias){
            this.organizarDias()
        }
    }

    fetchDias = async () => {         
        await this.props.dispatch(fetchCalendario())
        this.organizarDias()
    }

    organizarDias = () => {
        const { dias } = this.props
        this.setState({ dias, diasFilter: this.filtrarDias(dias), diasPorAprobar:dias.filter(d => !d.aprobado).map(d => ({...d, key: d._id})) })
    }
   
    filtrarDias = (dias) => {
        const primerFiltro = this.state.sel1 === "libres" ?
        dias.filter(d => d.tipo === "libre") :
        dias.filter(d => d.tipo === "remoto")

        const diasFilter = this.state.sel2 === "aprobados" ?  primerFiltro.filter(d => ( d.aprobado && d.user._id === getUserInfo()._id )) : (
                           this.state.sel2 === "pendientes" ? primerFiltro.filter(d => ( !d.aprobado && d.user._id === getUserInfo()._id )) :
                                                              primerFiltro.filter(d => d.aprobado))
                                                              
        return diasFilter
    }

    responderSolicitud = (dia, bool) => {
        if(bool){ //Aceptar
            request("/dias/" + dia._id, {
                method: "PUT",
                body: { aprobado: true }
            }).then(resp => {
                message.success(`Se ha aprobado la solicitud de ${dia.user.username} de día ${dia.tipo} el día ${moment(dia.fecha).format("YYYY-MM-DD")}`)
                this.fetchDias()
            }).catch(err => {
                console.error(err)
                message.error(`Se ha producido un error durante la aprobación del día ${dia.tipo} solicitado`)                    
            })
        }
        else{ //Denegar
            request("/dias/" + dia._id, {
                method: "DELETE",
            }).then(resp => {
                message.info("Se ha denegado la solicitud de día " + dia.tipo)
                this.fetchDias()    
            }).catch(err => {
                message.error(`Se ha producido un error durante la denegación del día ${dia.tipo} solicitado`)       
                console.error(err)
            })
        }
    }

    getListData = value => {
        const listData = this.state.diasFilter
            .filter(d => moment(d.fecha).format("YYYYMMDD") === moment(value).format("YYYYMMDD"))
            .map(d => ({
                user: d.user.username,
                fecha: moment(d.fecha),
                avatar: d.user.avatar && (process.env.REACT_APP_API_URL + d.user.avatar.url)
            }))
        return listData || [];
    }

    dateCellRender = value => {
        const listData = this.getListData(value);
        return (
            <ul className="events">
            {
                listData.map(item => (
                    <Popover key={item.fecha} content={<span>{item.user}</span>}>
                        <Avatar src={item.avatar}>{ item.user[0].toUpperCase() }</Avatar>
                    </Popover>
                ))
            }
            </ul>
        );
    }

    solicitarDia = (fecha, tipo) => {
        const { _id, equipo } = getUserInfo()
        console.log(getUserInfo())
        console.log(tipo)
        fetch(process.env.REACT_APP_API_URL + "/dias", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                fecha, tipo, user: _id, equipo
            })
        }).then(resp => {
            resp.json().then(dia => {
                console.log(dia)
                message.info(`Has solicitado como día ${tipo} el ${moment(this.state.dia).format("DD/MM/YYYY")}. Tu solicitud está pendiente de aprobación`); 
                this.fetchDias()
                this.setState({ modalPedirDia: false, dias: [...this.state.dias, dia] })
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))

    }

    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <Row style={{ justifyContent: "space-around", display: "flex"}}>
                        <Radio.Group defaultValue={this.state.sel1} buttonStyle="solid">
                            <Radio.Button onClick={() => this.setState({ sel1: "libres" }) } value="libres">Libres</Radio.Button>
                            <Radio.Button onClick={() => this.setState({ sel1: "remotos" }) } value="remotos">Remotos</Radio.Button>
                        </Radio.Group>
                        <Radio.Group defaultValue={this.state.sel2} buttonStyle="solid">
                            <Radio.Button onClick={() => this.setState({ sel2: "global" }) } value="global">Global aprobados</Radio.Button>
                            <Radio.Button onClick={() => this.setState({ sel2: "aprobados" }) } value="aprobados">Mis días aprobados</Radio.Button>
                            <Radio.Button onClick={() => this.setState({ sel2: "pendientes" }) } value="pendientes">Mis días pendientes de aprobación</Radio.Button>
                        </Radio.Group>
                    </Row>
                    <Calendar
                        onSelect={evt => this.setState({
                            dia: evt,
                            modalPedirDia: true
                        })} 
                        dateCellRender={this.dateCellRender}
                    />
                    <PrivateComponent>
                        <h1>Días pendientes de revisión</h1>
                        <Table dataSource={this.state.diasPorAprobar} columns={this.state.columns || []} />
                    </PrivateComponent>
                </Frame>
                <Modal
                    visible={this.state.modalPedirDia}
                    onCancel={() => this.setState({ modalPedirDia: false })}
                    footer={[
                        <Button key="libre" onClick={() => this.solicitarDia( this.state.dia, "libre")}>Día libre</Button>,
                        <Button key="remoto" type="primary" onClick={() => this.solicitarDia( this.state.dia, "remoto")}>Día remoto</Button>
                      ]}
                >
                    <p>Solicitar el día { moment(this.state.dia).format("DD/MM/YYYY") } como... </p>
                </Modal>
            </Layout>
        )
    }
}

const mapStateToProps = state => {
    return {
        dias: state.dias
    }
}

export default connect(mapStateToProps)(Calendario)