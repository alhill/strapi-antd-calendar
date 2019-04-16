import gql from './gql'

export function getToken(){
    return window.localStorage.getItem('jwt') !== "undefined" ? JSON.parse(window.localStorage.getItem('jwt')) : undefined
}

export function getHeaders(anonymous = false, type = "application/json"){
    const jwt = getToken();
    let headers = {
        "Accept": type,
        "Content-Type": type
    }
    if(jwt && !anonymous){ headers.Authorization = "Bearer " + jwt }
    return headers
}

export function getUserInfo(){
    const user = window.localStorage.getItem('user')
    const userObj = !["undefined", "", undefined].includes(user) ? JSON.parse(window.localStorage.getItem('user')) : undefined
    return userObj
}

export async function getAvatar(){
    const avatar = ( await ( await fetch(gql(`{
        user(id: "${getUserInfo()._id}"){
            avatar{
                url
            }
        }
    }`), {
        method: "GET",
        headers: getHeaders()
    })).json()).data.user.avatar.url
    return avatar
}

export function saveAuthData(authdata){
    authdata.avatar = getAvatar()
    window.localStorage.setItem('jwt', JSON.stringify(authdata.jwt))
    window.localStorage.setItem('user', JSON.stringify(authdata.user))
}

export function clearData(){
    window.localStorage.removeItem('jwt')
    window.localStorage.removeItem('user')
}