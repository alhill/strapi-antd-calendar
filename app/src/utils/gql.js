export default function gql(query, variables = {}, baseURL = "", debug = false){
    if( query === undefined ){ console.log("El parámetro 'query' de la funcion gql está vacío") }
    const queryReplace = query
                    .replace(/\n/gi,   "%0A")
                    .replace(/:/gi,    "%3A")
                    .replace(/\\/gi,   "%22")
                    .replace(/ {2}/gi, "%09")
                    .replace(/ /gi,    "%20")
                    .replace(/{/gi,    "%7B")
                    .replace(/}/gi,    "%7D")
                    .replace(/\(/gi,   "%28")
                    .replace(/\)/gi,   "%29")

    const queryClean = debug ? queryReplace : queryReplace
        .replace(/\t/gi, "%09")
        .split("%09")
        .filter(ch => ch !== "")
        .reduce((a, b) => a + "%09" + b, "")
        .split("%0A%09")
        .filter(ch => ch !== "")
        .reduce((a, b) => a + "%09" + b, "")
        .replace(/%7B%09/gi, "%7B")
        .replace(/%7D%09/gi, "%7D")
        .replace(/%09%7B/gi, "%7B")
        .replace(/%09%7D/gi, "%7D")
        .slice(3)

    const queryUgly = queryClean.split("$").map((elem, i) => {
        if(i%2){ //Es una variable
            return variables[elem]
        }
        else{ //No es una variable
            return elem
        }
    }).reduce((a, b) => a + b, "")
                    
    return baseURL + "/graphql?query=" + queryUgly
}