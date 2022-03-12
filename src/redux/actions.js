import { SET_USER, SET_SEARCH_INPUT } from './consts';

let setUserInfo = (newUserInfo = null) => {
    return {
        type : SET_USER,
        payload : {
            newUserInfo : newUserInfo
        }
    }
}

let setSearchInput = (newSearchCollectionInput = "") => {
    return {
        type : SET_SEARCH_INPUT,
        payload : {
            newSearchCollectionInput : newSearchCollectionInput
        }
    }
}

export let setUserInfoAction = setUserInfo;
export let setSearchInputAction = setSearchInput;