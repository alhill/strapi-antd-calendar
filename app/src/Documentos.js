import React, { Component } from 'react'
import { Layout, Upload, Icon, message } from 'antd'
import Frame from './Frame';


class Documentos extends Component{

    props = {
        name: 'file',
        multiple: true,
        action: '//jsonplaceholder.typicode.com/posts/',
        onChange(info) {
            const status = info.file.status;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame>
                    <h1>Documentos</h1>
                    <h2>Subir archivo</h2>
                    <Upload.Dragger {...this.props}>
                        <Icon type="inbox" />
                        <p>Arrastra documentos aquí</p>
                    </Upload.Dragger>
                </Frame>
            </Layout>
        )
    }
}

export default Documentos