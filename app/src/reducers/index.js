import { combineReducers } from 'redux'
import usuarios from './usuarios'
import dias from './dias'
import es from './es'
import documentos from './documentos'
import blueCollar from './blueCollar'

const rootReducer = combineReducers({
    usuarios,
    dias,
    es,
    documentos,
    blueCollar
})

export default rootReducer;