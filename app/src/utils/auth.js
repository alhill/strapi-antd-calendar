export function getToken(){
    return window.localStorage.getItem('jwt') !== "undefined" ? JSON.parse(window.localStorage.getItem('jwt')) : undefined
}

export function getHeaders(type = "application/json"){
    const jwt = getToken();
    let headers = {
        "Accept": type,
        "Content-Type": type
    }
    if(jwt){ headers.Authorization = "Bearer " + jwt }
    return headers
}

export function getUserInfo(){
    return JSON.parse(window.localStorage.getItem('user'))
}

export function saveAuthData(authdata){
    window.localStorage.setItem('jwt', JSON.stringify(authdata.jwt))
    window.localStorage.setItem('user', JSON.stringify(authdata.user))
}

export function clearData(){
    window.localStorage.removeItem('jwt')
    window.localStorage.removeItem('user')
}