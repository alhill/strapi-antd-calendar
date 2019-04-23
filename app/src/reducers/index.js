import { combineReducers } from 'redux'
import usuarios from './usuarios'
import dias from './dias'
import es from './es'

const rootReducer = combineReducers({
    usuarios,
    dias,
    es
})

export default rootReducer;