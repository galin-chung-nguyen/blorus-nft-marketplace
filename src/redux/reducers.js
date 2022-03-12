import { combineReducers } from 'redux';
import { SET_USER, SET_SEARCH_INPUT } from './consts';

let setUserInfoReducer = (state = null,action) => {
    switch(action.type){
        case SET_USER : 
            return action.payload.newUserInfo;

        default : return state;
    }
}

let setSearchDataReducer = (state = {}, action) => {
    switch(action.type){
        case SET_SEARCH_INPUT:
            return {
                ...state,
                searchCollectionInput: action.payload.newSearchCollectionInput
            }

        default: return state;
    }
}

let rootReducer = combineReducers({
    user : setUserInfoReducer,
    searchCollectionData: setSearchDataReducer
});

export default rootReducer;