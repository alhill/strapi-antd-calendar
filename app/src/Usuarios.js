import React, { Component } from 'react'
import { Layout, Table } from 'antd'
import Frame from './Frame';
import request from './utils/request';


class Usuarios extends Component{

    state = {}

    componentDidMount() {
        this.fetchUsers()
    }

    fetchUsers = async () => {

        const users = await request("/users")
        console.log(users)

        const dataSource = [{
            key: '1',
            name: 'Mike',
            age: 32,
            address: '10 Downing Street'
        }, {
            key: '2',
            name: 'John',
            age: 42,
            address: '10 Downing Street'
        }];

        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
        }, {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        }];

        this.setState({ dataSource, columns })
    }
    render(){
        const { dataSource, columns } = this.state
        return(
            <Layout style={{height:"100vh"}}>
                <Frame>
                    <h1>Usuarios</h1>
                    <Table dataSource={dataSource} columns={columns} />
                </Frame>
            </Layout>
        )
    }
}

export default Usuarios