import React, { Component } from 'react'
import { Layout, Typography, Calendar, Modal, message, Avatar, Button, Popover, Radio, Row, Table, Popconfirm, Tag, Statistic } from 'antd'
import moment from 'moment';
import { getHeaders, getUserInfo, getToken } from './utils/auth';
import request from './utils/request';
import Frame from './Frame';
import PrivateComponent from './PrivateComponent';
import { connect } from 'react-redux'
import { fetchCalendario, fetchAuth } from './actions';

class Calendario extends Component{
    state = {
        modalPedirDia: false,
        dias: [],
        diasFilter: [],
        diasPorAprobar: [],
        festivos: [],
        festivosArrUTC: [],
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
            render: row => moment(row.fecha).format("YYYY-MM-DD")
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
        if(this.props.dias){
            this.organizarDias()
            this.calcularVacaciones()
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.sel1 !== this.state.sel1 || prevState.sel2 !== this.state.sel2){
            this.setState({ diasFilter: this.filtrarDias(this.state.dias) })
        }
        else if(prevProps.dias !== this.props.dias){
            this.organizarDias()
            this.calcularVacaciones()
        }
    }

    fetchDias = async () => {         
        await this.props.dispatch(fetchCalendario())
        await this.props.dispatch(fetchAuth())
        this.organizarDias()
    }

    organizarDias = () => {
        const { dias } = this.props
        if(dias){
            const festivos = dias.filter(d => d.tipo === "festivo").map(f => ({
                ...f,
                fecha: moment.utc(f.fecha).hour(0).minute(0).seconds(0).milliseconds(0).format()
            }))
            const festivosArrUTC = festivos.map(f => moment.utc(f.fecha).hour(2).minute(0).seconds(0).milliseconds(0).format())
            this.setState({ 
                dias, 
                festivos,
                festivosArrUTC,
                diasFilter: this.filtrarDias(dias), 
                diasPorAprobar:dias.filter(d => !d.aprobado).map(d => ({...d, key: d._id})) 
            })
        }
    }
   
    filtrarDias = (dias) => {
        const primerFiltro = this.state.sel1 === "libres" ? dias.filter(d => d.tipo === "libre") : dias.filter(d => d.tipo === "remoto")
        const diasFilter = this.state.sel2 === "mios" ? primerFiltro.filter(d => d.user._id === getUserInfo()._id ) : primerFiltro                                                 
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
                aprobado: d.aprobado,
                tipo: d.tipo,
                _id: d._id,
                fecha: moment(d.fecha),
                avatar: d.user.avatar && (process.env.REACT_APP_API_URL + d.user.avatar.url)
            }))
        return listData || [];
    }

    dateFullCellRender = value => {
        const listData = this.getListData(value);
        const valueUTC = moment.utc(value.hour(2).minute(0).seconds(0).milliseconds(0)).format()
        
        const festivo = this.state.festivos.find(f => { return moment.utc(f.fecha).format() === valueUTC })

        const tc = {
            title: festivo ? festivo.nombre : value.format("LL"),
            color: festivo ? "rgba(255, 40, 30, 0.5)" : ( [0, 6].includes(value.day()) ? "rgba(255, 200, 100, 0.5)" : "transparent" )
        }

        return (
            <div className="ant-fullcalendar-date" style={{ backgroundColor: tc.color, margin: "-1px 0", borderRadius: 3 }} title={tc.title} onClick={evt => this.handleCellClick(evt, value)}>
                <div className="ant-fullcalendar-value">{ value.date() }</div>
                <div className="ant-fullcalendar-content">
                    <ul className="events" style={{ margin: 0, padding: 2 }}>
                    {
                        listData.map(item => (
                            <Popover 
                                className={!item.aprobado ? "sinactimel" : ""} 
                                key={item.user + item.fecha} 
                                content={
                                    <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                                        <span>{item.user}</span>
                                        { (!item.aprobado && getUserInfo().manager) && 
                                            <div style={{ display: "flex", marginTop: "1em" }}>
                                                <Popconfirm title={`¿Estás seguro de que deseas aceptar la solicitud de día ${item.tipo} para el día ${moment(item.fecha).format("YYYY-MM-DD")} a ${item.user}?`} onConfirm={evt => this.responderSolicitud(item, true)}>
                                                    <Tag color="green" key={`${item._id}_aceptar`}>Aprobar</Tag>
                                                </Popconfirm>
                                                <Popconfirm title={`¿Estás seguro de que deseas denegar la solicitud de día ${item.tipo} para el día ${moment(item.fecha).format("YYYY-MM-DD")} a ${item.user}?`} onConfirm={evt => this.responderSolicitud(item, false)}>
                                                    <Tag color="volcano" key={`${item._id}_denegar`}>Denegar</Tag>
                                                </Popconfirm>
                                            </div>
                                        }
                                    </div>
                                }
                            >
                                <Avatar style={{ margin: 1 }} src={item.avatar ? item.avatar : null}>{ item.user[0].toUpperCase() }</Avatar>
                            </Popover>
                        ))
                    }
                    </ul>
                </div>
            </div>
        );
    }

    handleCellClick = (evt, value) => {
        evt.persist()
        if(!["span", "img", "button"].includes(evt._targetInst.elementType) && ![...evt._targetInst.stateNode.classList].includes("ant-tag")){
            this.lanzarModalDia(value)
        }
    }

    solicitarDia = (fecha, tipo) => {
        const { _id, equipo } = getUserInfo()
        console.log(getUserInfo())
        console.log(tipo)
        fetch(process.env.REACT_APP_API_URL + "/dias", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                fecha, tipo, 
                user: _id, 
                aprobado: getUserInfo().manager,
                equipo
            })
        }).then(resp => {
            resp.json().then(dia => {
                if(dia.aprobado){
                    message.info(`Te has asignado como día ${tipo} el ${moment(this.state.dia).format("DD/MM/YYYY")}`); 
                }
                else{
                    message.info(`Has solicitado como día ${tipo} el ${moment(this.state.dia).format("DD/MM/YYYY")}. Tu solicitud está pendiente de aprobación`); 
                }
                this.fetchDias()
                this.setState({ modalPedirDia: false, dias: [...this.state.dias, dia] })
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    }

    lanzarModalDia = dia => {
        console.log(dia)
        const misDias = this.state.dias.filter(d => d.user && (d.user._id === getUserInfo()._id ))
        if( moment().isSameOrBefore(dia, "day") ){
            if( this.state.festivos.find(f => moment(f.fecha).isSame(dia, "day")) === undefined ){
                const pedido = misDias.find(d => moment(d.fecha).isSame(dia, "day"))
                if(!pedido){
                    this.setState({
                        dia,
                        modalPedirDia: true
                    })
                }
                else{ 
                    if(!pedido.aprobado){
                        message.warning("La solicitud de ese día todavía se encuentra pendiente de aprobación") 
                    }
                }
            }
            else{ message.warning("No puedes solicitar un día festivo") }
        }
        else{ message.warning("No puedes solicitar un día pasado") }
    }

    calcularVacaciones = () => {
        const { auth } = this.props
        const diasAno = 365 + (moment().isLeapYear() ? 1 : 0)
        const duracionActualContrato = auth.iniciocontrato ? moment().diff(moment(auth.iniciocontrato), "days") : undefined
        const c = (this.props.auth.correccion && this.props.auth.correccion.length > 0) ? this.props.auth.correccion.find(c => parseInt(c.ano, 10) === moment().year()) : { correccion: 0 }
        const diasTotales = duracionActualContrato ? (duracionActualContrato <= diasAno ? (Math.trunc((duracionActualContrato / diasAno) * 23) + (parseInt(c.correccion, 10) || 0)) : (23 + (parseInt(c.correccion, 10) || 0))) : " - "
        const diasLibresFuturos = this.props.auth.dias ? this.props.auth.dias.filter(d => d.tipo === "libre" && d.aprobado && moment(d.fecha).isAfter(moment())).length : ""
        const diasLibresPasados = this.props.auth.dias ? this.props.auth.dias.filter(d => d.tipo === "libre" && d.aprobado && moment(d.fecha).isBetween(moment().startOf("year"), moment(), "days", "[]")).length : ""
        const diasLibresPendientes = this.props.auth.dias ? this.props.auth.dias.filter(d => d.tipo === "libre" && !d.aprobado && moment(d.fecha).isAfter(moment())).length : ""
        this.setState({
            diasTotales,
            diasLibresFuturos,
            diasLibresPasados,
            diasLibresPendientes
        })
    }

    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <Row style={{ justifyContent: "space-around", display: "flex", marginBottom: 20 }}>
                        <Statistic title={"Días de vacaciones"} value={this.state.diasTotales} />
                        <Statistic title={"Días de vacaciones disfrutados"} value={this.state.diasLibresPasados} />
                        <Statistic title={"Días de vacaciones solicitados"} value={this.state.diasLibresFuturos} />
                        <Statistic title={"Días de vacaciones pendientes de aprobar"} value={this.state.diasLibresPendientes} />
                    </Row>
                    <Row style={{ justifyContent: "space-around", display: "flex"}}>
                        <Radio.Group defaultValue={this.state.sel1} buttonStyle="solid">
                            <Radio.Button onClick={() => this.setState({ sel1: "libres" }) } value="libres">Libres</Radio.Button>
                            <Radio.Button onClick={() => this.setState({ sel1: "remotos" }) } value="remotos">Remotos</Radio.Button>
                        </Radio.Group>
                        <Radio.Group defaultValue={this.state.sel2} buttonStyle="solid">
                            <Radio.Button onClick={() => this.setState({ sel2: "global" }) } value="global">Global</Radio.Button>
                            <Radio.Button onClick={() => this.setState({ sel2: "mios" }) } value="mios">Mis días</Radio.Button>
                        </Radio.Group>
                    </Row>
                    <Calendar
                        dateFullCellRender={this.dateFullCellRender}
                        style={{ margin: "-1px 0"}}
                    />
                    
                    <PrivateComponent blue={this.props.blueCollar}>
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
        dias: state.dias,
        auth: state.auth,
        blueCollar: state.blueCollar
    }
}

export default connect(mapStateToProps)(Calendario)