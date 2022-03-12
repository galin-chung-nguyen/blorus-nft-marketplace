import { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api, useMoralisWeb3ApiCall, useChain } from "react-moralis";
import { useIPFS } from "./useIPFS";

export const useNFTTokenIds = (address) => {
  const { token } = useMoralisWeb3Api();
  const moralis = useMoralis();
  const { switchNetwork, chainId, chain, account } = useChain();
  const { resolveLink } = useIPFS();
  const [NFTTokenIds, setNFTTokenIds] = useState([]);
  // const {
  //   fetch: getNFTTokenIds,
  //   data,
  //   error,
  //   isLoading,
  // } = useMoralisWeb3ApiCall(token.getAllTokenIds, { chain: chainId, address: "0x8952487FD1dBfCA106301bB60Ef81e08f2B7f2a2" });
  const [data, setData] = useState(null);
  const [fetchSuccess, setFetchSuccess] = useState(true);

  useEffect(async () => {

    if (moralis.isInitialized && address !== "explore") {
      let queryData = await token.getAllTokenIds({ chain: chainId, address: address })
      setData(queryData);
      console.log(queryData)
    }

  }, [moralis, address]);

  useEffect(async () => {
    
    if (data?.result) {
      const NFTs = data.result;
      setFetchSuccess(true);

      let check = true;
      
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          NFT.image = resolveLink(NFT.metadata?.image);
        } else if (NFT?.token_uri) {
          try {
            await fetch(NFT.token_uri)
              .then((response) => response.json())
              .then((data) => {
                NFT.image = resolveLink(data.image);
              });
          } catch (error) {
            if(check){
              check = false;
              setFetchSuccess(false);
            }

            /*          !!Temporary work around to avoid CORS issues when retrieving NFT images!!
                        Create a proxy server as per https://dev.to/terieyenike/how-to-create-a-proxy-server-on-heroku-5b5c
                        Replace <your url here> with your proxy server_url below
                        Remove comments :)
            
                          try {
                            await fetch(`<your url here>/${NFT.token_uri}`)
                            .then(response => response.json())
                            .then(data => {
                              NFT.image = resolveLink(data.image);
                            });
                          } catch (error) {
                            setFetchSuccess(false);
                          }
            
             */
          }
        }
        // console.log(NFT)
      }

      setNFTTokenIds(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return { NFTTokenIds, fetchSuccess };
};