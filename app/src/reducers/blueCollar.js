import { 
    CAMBIAR_BLUE_COLLAR
} from "../constants/action-types";

export default function blueCollarReducer(state = false, action) {
    switch (action.type) {
        case CAMBIAR_BLUE_COLLAR:
            return action.payload;
        default:
            return state;
    }
}