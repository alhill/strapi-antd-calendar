import React, { Component } from 'react'
import { Layout, Upload, Icon, message, Table, Button, Select, Tag, Popconfirm, Checkbox, Collapse } from 'antd'
import Frame from './Frame';
import { getUserInfo, getToken } from './utils/auth';
import gql from './utils/gql';
import { connect } from 'react-redux'
import { fetchDocumentos } from './actions'
import request from './utils/request';

const query = `{
user(id:"$userId$"){
    documentos{
        _id
    }
}}`  

class Documentos extends Component{

    state = {
        fileList: [],
        asociarA: [],
        userInfo: getUserInfo(),
        selectedUser: {documentos: []},
        disponibleParaTodos: true,
        columns: [{
            title: 'Nombre de usuario',
            dataIndex: 'username',
            key: 'username',
        }, {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        }],
        misArchColumns: [{
            title: 'Nombre de archivo',
            dataIndex: 'name',
            key: 'name',
        }, {
            key: "archivo",
            rowKey: "_id",
            key: "_id",
            render: file => (
                <div key={file._id} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a href={process.env.REACT_APP_API_URL + file.url} target="_blank" rel="noopener noreferrer">
                        <Tag color="geekblue" key={`${file._id}_file`}><Icon type="file-text" /> Enlace</Tag>
                    </a>
                    <Popconfirm 
                        title={`¿Estás seguro de que deseas desvincular ${file.name} de ${this.state.selectedUser.username}?`} 
                        onConfirm={() => this.desvincularArchivo(file, this.state.selectedUser)}>
                        <Tag color="orange" key={`${file._id}_file`}><Icon type="disconnect" /> Desvincular</Tag>
                    </Popconfirm>
                    <Popconfirm 
                        title={`¿Estás seguro de que deseas borrar ${file.name}? Esto borrará el archivo para todos los usuarios`} 
                        onConfirm={() => this.borrarArchivo(file)}
                        icon={<Icon type="warning" style={{ color: 'red' }} />}
                    >
                        <Tag color="volcano" key={`${file._id}_file`}><Icon type="delete" /> Borrar</Tag>
                    </Popconfirm>
                </div>
            )
        }],
        archGlobColumns: [{
            title: 'Nombre de archivo',
            dataIndex: 'name',
            key: 'name',
        }, {
            key: "archivo",
            rowKey: "_id",
            key: "_id",
            render: file => (
                <div key={file._id} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a href={process.env.REACT_APP_API_URL + file.url} target="_blank" rel="noopener noreferrer">
                        <Tag color="geekblue" key={`${file._id}_file`}><Icon type="file-text" /> Enlace</Tag>
                    </a>
                    <Popconfirm 
                        title={`¿Estás seguro de que deseas borrar ${file.name}? Esto borrará el archivo para todos los usuarios`} 
                        onConfirm={() => this.borrarArchivo(file)}
                        icon={<Icon type="warning" style={{ color: 'red' }} />}
                    >
                        <Tag color="volcano" key={`${file._id}_file`}><Icon type="delete" /> Borrar</Tag>
                    </Popconfirm>
                </div>
            )
        }],
        archUserColumns: [{
            title: 'Nombre de archivo',
            dataIndex: 'name',
            key: 'name',
        }, {
            key: "archivo",
            rowKey: "_id",
            key: "_id",
            render: file => (
                <div key={file._id} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a href={process.env.REACT_APP_API_URL + file.url} target="_blank" rel="noopener noreferrer">
                        <Tag color="geekblue" key={`${file._id}_file`}><Icon type="file-text" /> Enlace</Tag>
                    </a>
                </div>
            )
        }]
    }

    componentDidMount(){
        this.setState({ selectedUser: this.props.usuarios.find(u => u.username === getUserInfo().username) })
    }

    componentDidUpdate(prevProps){
        if(prevProps.usuarios !== this.props.usuarios){
            this.setState({ selectedUser: this.props.usuarios.find(u => u.username === getUserInfo().username) })
        }
    }

    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ asociarA: selectedRows.map(u => u._id) })
        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };

    desvincularArchivo = async (file, user) => {
        const docId = this.state.selectedUser.documentos.find(d => d.archivo._id === file._id)._id
        const documento = await request("/documentos/" + docId)
        const users = documento.users.filter(u => u._id !== user._id)
        request("/documentos/" + docId, {
            method: "PUT",
            body: { users }
        }).then(data => {
            message.info("El archivo se desvinculó correctamente")
            this.props.dispatch(fetchDocumentos())
        }).catch(err => {
            console.log(err)
            message.error("Se produjo un error durante la desvinculación del documento")
        })
    }

    borrarArchivo = async file => {
        const docId = this.props.documentos.find(d => d.archivo._id === file._id)._id
        request("/upload/files/" + file._id, {
            method: "DELETE"
        }).then(data => {
            request("/documentos/" + docId, {
                method: "DELETE"
            }).then(data => {
                message.info("El archivo se borró correctamente")
                this.props.dispatch(fetchDocumentos())
            }).catch(err => {
                console.log(err)
                message.error("Se produjo un error durante el borrado del documento")
            })
        })
          .catch(err => {
            console.log(err)
            message.error("Se produjo un error durante el borrado del documento")
        })
    }

    handleUpload = async () => {
        try{
            const promisingPromises = this.state.fileList.map(async file => {
                console.log()
                const doc = await request("/documentos", { method: "POST", body: { global: this.state.disponibleParaTodos } })
                const body = new FormData();
                body.append("ref", "documento");
                body.append("refId", doc._id);
                body.append("field", "archivo");
                body.append("files", file);
                request("/upload", {
                    method: "POST",
                    headers: {"Authorization": "Bearer " + getToken()},
                    body
                }, false)
                return doc._id
            })
            const arrayArchivos = await Promise.all(promisingPromises)
            console.log(arrayArchivos)
            if(this.state.asociarA.length === 0 && !this.state.disponibleParaTodos){
                message.error("El documento no está asociado a ningún usuario")
            }
            else if(!this.state.disponibleParaTodos){
                const promesitas = this.state.asociarA.map(async userId => {
                    const antDocus = (await request(gql(query, { userId }))).data.user.documentos
                    return request("/users/" + userId, {
                        method: "PUT",
                        body: {
                            documentos: [...antDocus, ...arrayArchivos]
                        }
                    })
                })
                Promise.all(promesitas).then(() => {
                    message.info("Los documentos se han subido correctamente")
                    this.props.dispatch(fetchDocumentos())
                    this.setState({
                        mostrarListaUsuarios: false,
                        fileList: []
                    })
                })
            }
            else{
                message.info("Los documentos se han subido correctamente")
                this.props.dispatch(fetchDocumentos())
                this.setState({
                    mostrarListaUsuarios: false,
                    fileList: []
                })
            }
        }
        catch(err){
            console.log(err)
            message.error("Ocurrió un error durante la subida de documentos")
        }
    }

    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame>
                    <h1>Documentos</h1>
                    {(this.state.userInfo.manager && !this.props.blueCollar ) && [ 
                        <div key="sa" style={{ marginBottom: 50 }}>
                            <h2>Subir archivo</h2>
                            <div style={{ width: "320px", marginBottom: 20 }}>
                                <Upload.Dragger 
                                    name='file'
                                    action={ process.env.REACT_APP_API_URL + '/upload' }
                                    multiple={true}
                                    onChange={(info) => {
                                        const status = info.file.status;
                                        if (status !== 'uploading') {
                                            //console.log(info.file, info.fileList);
                                            if(info.fileList.length === 0){
                                                this.setState({ mostrarListaUsuarios: false })
                                            }
                                        }
                                        if (status === 'done') {
                                            message.success(`${info.file.name} se ha subido correctamente.`);
                                        } else if (status === 'error') {
                                            message.error(`La subida de ${info.file.name} falló.`);
                                        }
                                    }} 
                                    beforeUpload={(file, fileList) => {
                                        this.setState({ 
                                            fileList,
                                            mostrarListaUsuarios: true 
                                        })
                                        return false
                                    }}
                                    fileList={this.state.fileList}
                                    onRemove={file => {
                                        const fileList = this.state.fileList.filter(f => f.uid !== file.uid)
                                        this.setState({ fileList, mostrarListaUsuarios: fileList.length > 0 ? true : false })
                                    }}
                                >
                                    <Icon type="inbox" />
                                    <p>Arrastra documentos aquí</p>
                                </Upload.Dragger>
                            </div>
                            { this.state.mostrarListaUsuarios &&
                                <div style={{ display: "flex", flexDirection: "column"}}>
                                    <Checkbox style={{ marginBottom: 20 }} checked={this.state.disponibleParaTodos} onChange={e => this.setState({ disponibleParaTodos: e.target.checked })}>Disponible para todos los usuarios</Checkbox>
                                    <Collapse className="sinCabecera" bordered={false} activeKey={ this.state.disponibleParaTodos ? "0" : "1"}>
                                        <Collapse.Panel key="1">
                                            <h3 key="asociarTitle">Asociar archivo a:</h3>
                                            <Table key="asociarTabla" rowSelection={this.rowSelection} dataSource={this.props.usuarios} columns={this.state.columns} />
                                        </Collapse.Panel>
                                    </Collapse>
                                    <div>
                                        <Button onClick={this.handleUpload}>Subir documentos</Button>
                                    </div>
                                </div>
                            }
                        </div>,
                        <div key="apu">
                            <h2>Archivos por usuario</h2>
                            <Select
                                showSearch
                                style={{ width: 200, marginBottom: 20 }}
                                placeholder="Selecciona un usuario"
                                defaultValue={getUserInfo().username}
                                optionFilterProp="children"
                                onChange={op => {
                                    const selectedUser = this.props.usuarios.find(u => u.username === op)
                                    this.setState({ selectedUser })

                                }}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                { this.props.usuarios.map(u => 
                                    <Select.Option value={u.username} key={u._id}>{u.username}</Select.Option>
                                )}
                            </Select>
                            {
                                this.state.selectedUser && 
                                    <Table 
                                        // dataSource={this.state.selectedUser.documentos.map(d => d.archivo)} 
                                        dataSource={this.props.documentos.filter(d => d.users.map(u => u._id).includes(this.state.selectedUser._id)).map(d => d.archivo)} 
                                        columns={this.state.misArchColumns}
                                    ></Table>
                            }

                            <h2 style={{ marginTop: 20 }}>Archivos globales</h2>
                            <Table 
                                dataSource={this.props.documentos.filter(d => d.global).map(d => d.archivo)} 
                                columns={this.state.archGlobColumns}
                            ></Table>
                        </div>
                    ]}
                    { (!this.state.userInfo.manager || this.props.blueCollar ) &&
                        <div>
                            <h2>Mis archivos</h2>
                            <Table 
                                dataSource={this.props.documentos.filter(d => this.state.userInfo.documentos.includes(d._id) || d.global).map(d => d.archivo)} 
                                columns={this.state.archUserColumns}
                            ></Table>
                        </div>
                    }
                </Frame>
            </Layout>
        )
    }
}

const mapStateToProps = state => {
    return {
        usuarios: state.usuarios,
        documentos: state.documentos,
        blueCollar: state.blueCollar
    }
}

export default connect(mapStateToProps)(Documentos)