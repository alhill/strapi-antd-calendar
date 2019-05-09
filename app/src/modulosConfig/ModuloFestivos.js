import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Tag, Popconfirm, Icon, Form, DatePicker, Input, Button, message } from 'antd'
import moment from 'moment'
import request from '../utils/request';
import { getUserInfo } from '../utils/auth'
import { fetchCalendario } from '../actions'

class ModuloFestivos extends Component{

    state = {}

    addFestivo = () => {
        if(!this.state.nombre){ message.warning("No se ha asignado nombre al festivo") }
        else if(!this.state.fecha){ message.warning("No se ha seleccionado ninguna fecha") }
        else{
            request("/dias", {
                method: "POST",
                body: {
                    fecha: moment.utc(this.state.fecha).format(),
                    tipo: "festivo",
                    nombre: this.state.nombre,
                    equipo: getUserInfo().equipo,
                    aprobado: true
                }
            }).then(data => {
                //console.log(data)
                message.success("El nuevo festivo se ha añadido correctamente")
                this.props.dispatch(fetchCalendario())
                this.setState({ nombre: undefined, fecha: undefined })
            }).catch(err => {
                console.log(err)
                message.error("Se ha producido un error durante la creación del nuevo festivo")
            })
        }
    }

    borrarFestivo = dia => {
        request("/dias/" + dia._id, { method: "DELETE" })
            .then(data => {
                //console.log(data)
                message.success("Se ha borrado el festivo correctamente")
                this.props.dispatch(fetchCalendario())
            }).catch(err => {
                console.log(err)
                message.error("Ha ocurrido un error durante el borrado del festivo")
            })
    }

    render(){
        return(
            <div>
                <h3>Lista de festivos</h3>
                <Table dataSource={this.props.dias.filter(d => d.tipo === "festivo")} rowKey="_id" columns={[
                    {
                        title: 'Nombre',
                        dataIndex: 'nombre',
                        key: 'nombre',
                    }, {
                        title: 'Día',
                        key: 'fecha',
                        render: dia => moment(dia.fecha).format("YYYY-MM-DD")
                    }, {
                        key: "botones",
                        render: dia => (
                            <div key={dia._id} style={{ display: "flex", justifyContent: "flex-end" }}>
                                <Popconfirm 
                                    title={`¿Estás seguro de que quieres borrar el día festivo?`} 
                                    onConfirm={() => this.borrarFestivo(dia)}
                                    icon={<Icon type="warning" style={{ color: 'red' }} />}
                                >
                                    <Tag color="volcano" key={`${dia._id}_dia`}><Icon type="delete" /> Borrar</Tag>
                                </Popconfirm>
                            </div>
                        )
                    }
                ]}/>

                <h3 style={{ marginTOp: 20 }}>Añadir festivo</h3>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    <Form.Item label="Nombre" style={{ marginRight: 20 }}>
                        <Input type="text" onChange={e => this.setState({ nombre: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Fecha" style={{ marginRight: 20 }}>
                        <DatePicker onChange={fecha => this.setState({ fecha })} style={{ width: 250 }} />
                    </Form.Item>
                    <Form.Item label=" " colon={false}>
                        <Button onClick={this.addFestivo}>Añadir</Button>                
                    </Form.Item>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        dias: state.dias
    }
}

export default connect(mapStateToProps)(ModuloFestivos)