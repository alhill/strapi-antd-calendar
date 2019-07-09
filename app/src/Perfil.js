import React, { Component } from 'react'
import { getToken, getUserInfo } from './utils/auth';
import { Layout, Upload, message, Icon, Form, Input, Button } from 'antd'
import Frame from './Frame';
import request from './utils/request';
import { fetchAuth } from './actions'
import { connect } from 'react-redux'


class Perfil extends Component{

    state = {
        loading: false,
        nombre: getUserInfo().nombre || ""    
    }

    componentDidMount(){
        console.log(this.props.auth)
    }
    componentDidUpdate(){
        console.log(this.props.auth)
    }

    handleUpload = ({ onSuccess, onError, file }) => {
        let imgToUpload = new FormData();

        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJPG) {
          message.error('Solo se aceptan imagenes en formato JPG y PNG');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('Las imagenes han de ser más pequeñas de 2MB');
        }

        if( isJPG && isLt2M ){  
            imgToUpload.append('files', file);
            imgToUpload.append('field', "avatar");
            imgToUpload.append('refId', getUserInfo()._id);
            imgToUpload.append('ref', "user");
            imgToUpload.append('source', 'users-permissions')
            this.setState({ loading: true })
            request("/upload", {
                method: 'POST',
                body: imgToUpload,
            }, false).then(data => {
                console.log(data)
                this.setState({ loading: false })
                message.success("El avatar se actualizó correctamente.")
                let userInfo = getUserInfo()
                userInfo.avatar = data[0]
                window.localStorage.setItem("user", JSON.stringify(userInfo))
                this.props.dispatch(fetchAuth())
            }).catch(err => {
                this.setState({ loading: false })
                console.log(err)
                message.error("Ocurrió un error durante la subida del nuevo avatar")
            });
        }
    }

    handleSave = () => {
        request("/users/" + getUserInfo()._id, {
            method: "PUT",
            body: {
                nombre: this.state.nombre
            }
        }).then(data => {
            let userInfo = getUserInfo()
            userInfo.nombre = this.state.nombre
            window.localStorage.setItem("user", JSON.stringify(userInfo))
            this.props.dispatch(fetchAuth())
            message.success("Los datos se guardaron correctamente")
        }).catch(err => {
            message.error("Ocurrió un error durante el guardado de datos")
            console.log(err)
        })
    }

    render(){

        const uploadButton = (
            <div>
              <Icon type={this.state.loading ? 'loading' : 'plus'} />
              <div className="ant-upload-text">Upload</div>
            </div>
        );
        const imageUrl = this.props.auth && this.props.auth.avatar && process.env.REACT_APP_API_URL + this.props.auth.avatar.url;
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>Perfil</h1>
                    <div style={{ width: "320px", marginBottom: 20 }}>
                        <Form.Item label="Avatar" style={{ marginRight: 20 }}>
                            <Upload
                                name="avatar"
                                defaultFileList={[(this.props.auth && this.props.auth.avatar)]}
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                onChange={this.handleChange}
                                customRequest={this.handleUpload}

                            >
                                {imageUrl ? <img src={imageUrl} style={{ maxHeight: 300, maxWidth: 300, objectFit: "cover" }} alt="avatar" /> : uploadButton}
                            </Upload>
                        </Form.Item>

                        <Form.Item label="Nombre" style={{ marginRight: 20 }}>
                            <Input type="text" value={ this.state.nombre } onChange={e => this.setState({ nombre: e.target.value })} />
                        </Form.Item>

                        <Button onClick={this.handleSave}>Guardar</Button>
                    </div>
                </Frame>
            </Layout>
        )
    }
}

const mapStateToProps = state => ({
    auth: state.auth
})

export default connect(mapStateToProps)(Perfil)