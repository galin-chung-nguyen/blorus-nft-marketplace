import { Select } from "antd";
import { useEffect } from "react";
import { useChain } from "react-moralis";
import { getCollectionsByChain } from "../helpers/collections";
import { useSelector, useDispatch } from 'react-redux';
import { setSearchInputAction } from '../redux/actions';

function SearchCollections(){
    const { Option } = Select;
    const { chainId } = useChain();
    const NFTCollections = getCollectionsByChain(chainId);
    const dispatch = useDispatch();
	const searchCollectionData = useSelector(state => state.searchCollectionData);
    
    useEffect(() => {
        console.log('Hello')
        console.log(NFTCollections);
    },[]);

    function onChange(value){
        dispatch(setSearchInputAction(value));
    }
    return (
        <>
        <Select 
            showSearch
            style = {{width: "1000px",
                marginLeft: "20px"}}
            placeholder = "Find a collection"
            optionFilterProp="children"
            onChange = {onChange}
        >
            
        {NFTCollections && NFTCollections.map((collection, id) => 
            <Option value = {collection.addrs} key = {id}>
                {collection.name}
            </Option>)}
        </Select>
        </>
    )
}

export default SearchCollections;