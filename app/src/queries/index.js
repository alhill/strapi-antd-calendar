export function queryCalendario(variables){
    return variables.equipo ? `{
    dias(where: { equipo: "${ variables.equipo }" }, limit: 10000){
        _id
        fecha
        tipo
        aprobado
        nombre
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
        razonSocial
        cif
        ccc
        users{
            _id
            username
            nombre
            apellidos
            nif
            nuss
            avatar{
                url
            }
            registros(limit: 1000000000, where: {fecha_lte: "${ variables.hasta }", fecha_gte: "${ variables.desde }"}){
                _id
                fecha
                idcard
                aprobado
                user{
                    _id
                    username
                }
                ultimoEditor{
                    _id
                    username
                }
            }
            duracionjornada
        }
    }
}` : "{}"
}

export function queryEntradas(variables){
    return variables.equipo ? `
{
    entradas(where: {equipo: "${variables.equipo}"}, sort: "createdAt:desc", limit: 3){
        _id
        createdAt
        titulo
        imagen{
            url
        }
        resumen
        cuerpo
        slug
    }
}` : "{}"
}