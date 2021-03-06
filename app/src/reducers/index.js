import { combineReducers } from 'redux'
import usuarios from './usuarios'
import dias from './dias'
import es from './es'
import documentos from './documentos'
import blueCollar from './blueCollar'
import grupos from './grupos'
import pws from './pws'
import auth from './auth'
import entradas from './entradas'
import mesES from './mesES'
import errorCarga from './errorCarga'

const rootReducer = combineReducers({
    usuarios,
    dias,
    es,
    documentos,
    blueCollar,
    grupos, 
    pws,
    auth,
    mesES,
    entradas,
    errorCarga
})

export default rootReducer;