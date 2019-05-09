import React, { Component } from 'react'
import { Select, Form, DatePicker, TimePicker, Button, message } from 'antd'
import { connect } from 'react-redux'
import moment from 'moment'
import { getUserInfo } from '../utils/auth';
import request from '../utils/request';

class ModuloRegistros extends Component{

    addRegistro = async () => {
        if(![this.state.fechaNuevoRegistro, this.state.horaEntradaNuevoRegistro, this.state.horaSalidaNuevoRegistro, this.state.selectedUser].includes(undefined)){
            const fechaEntrada = this.state.fechaNuevoRegistro.clone().hour(this.state.horaEntradaNuevoRegistro.hour()).minute(this.state.horaEntradaNuevoRegistro.minute())
            const fechaSalida = this.state.fechaNuevoRegistro.clone().hour(this.state.horaSalidaNuevoRegistro.hour()).minute(this.state.horaSalidaNuevoRegistro.minute())

            const ePasado = fechaEntrada.isBefore(moment())
            const sPasado = fechaSalida.isBefore(moment())
            const eAntesDeS = fechaEntrada.isBefore(fechaSalida)

            if( ePasado && sPasado && eAntesDeS ){
                const registroEntrada = {
                    user: this.state.selectedUser._id,
                    fecha: moment.utc(fechaEntrada).format(),
                    ultimoEditor: getUserInfo._id
                }
                const registroSalida = {
                    user: this.state.selectedUser._id,
                    fecha: moment.utc(fechaSalida).format(),
                    ultimoEditor: getUserInfo._id
                }

                try{
                    const respEntrada = await request("/registros", { method: "POST", body: registroEntrada })
                    const respSalida = await request("/registros", { method: "POST", body: registroSalida })
                    // console.log({ respEntrada, respSalida })
                    message.success("El registro se añadió correctamente")
                    this.setState({ 
                        fechaNuevoRegistro: undefined,
                        horaEntradaNuevoRegistro: undefined,
                        horaSalidaNuevoRegistro: undefined
                    })
                }
                catch(err){
                    console.log(err)
                    message.error("Se produjo un error durante el guardado del registro")
                }
            }
            else{
                if(!ePasado){ message.error("La hora de entrada es inválida") }
                if(!sPasado){ message.error("La hora de salida es inválida") }
                if(!eAntesDeS ){ message.error("La hora de entrada ha de ser anterior a la de salida") }
            }
        }
        else{ message.warning("Faltan campos por completar") }
    }

    render(){
        const Option = Select.Option
        return(
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <Form.Item label="Usuario">
                        <Select
                            showSearch
                            style={{ width: 200, marginBottom: 20 }}
                            placeholder="Selecciona un usuario"
                            optionFilterProp="children"
                            onChange={op => {
                                const selectedUser = this.props.usuarios.find(u => u.username === op)
                                this.setState({ selectedUser })

                            }}
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            style={{ width: 250 }}
                        >
                            { this.props.usuarios.map(u => 
                                <Option value={u.username} key={u._id}>{u.username}</Option>
                            )}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Fecha">
                        <DatePicker onChange={fechaNuevoRegistro => this.setState({ fechaNuevoRegistro })} style={{ width: 250 }}/>
                    </Form.Item>
                    <Form.Item label="Hora de entrada">
                        <TimePicker onChange={horaEntradaNuevoRegistro => this.setState({ horaEntradaNuevoRegistro })} style={{ width: 250 }}/>
                    </Form.Item>
                    <Form.Item label="Hora de salida">
                        <TimePicker onChange={horaSalidaNuevoRegistro => this.setState({ horaSalidaNuevoRegistro })} style={{ width: 250 }}/>
                    </Form.Item>
                </div>
                <Button onClick={this.addRegistro}>Añadir registro</Button>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        usuarios: state.usuarios
    }
}

export default connect(mapStateToProps)(ModuloRegistros)



