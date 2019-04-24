export function queryCalendario(variables){
    return variables.equipo ? `{
    dias(where: { equipo: "${ variables.equipo }" }){
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
}

export function queryES(variables){
    return variables.equipo ? `{
    equipo(id: "${ variables.equipo }"){
        users{
            _id
            username
            avatar{
                url
            }
            registros{
                _id
                fecha
                idcard
            }
        }
    }
}` : "{}"
}