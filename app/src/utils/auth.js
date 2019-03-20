export function getToken(){
    return JSON.parse(window.localStorage.getItem('jwt'))
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