import React, { useState } from "react";
import { useMoralis, useNFTBalances, useWeb3ExecuteFunction } from "react-moralis";
import { Card, Image, Tooltip, Modal, Input, Skeleton } from "antd";
import {
	FileSearchOutlined,
	SendOutlined,
	ShoppingCartOutlined,
} from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import AddressInput from "./AddressInput";
import { useApiContract } from "react-moralis";
import { contractABI, rinkebyContractAddress, ERC721ApproveABI, rinkebyERC721ContractAddress } from '../contracts/contractABI';

const { Meta } = Card;

const styles = {
	NFTs: {
		display: "flex",
		flexWrap: "wrap",
		WebkitBoxPack: "start",
		justifyContent: "flex-start",
		margin: "0 auto",
		maxWidth: "1000px",
		width: "100%",
		gap: "10px",
	},
};

function NFTBalance() {
	const { data: NFTBalances } = useNFTBalances();
	const { Moralis, chainId } = useMoralis();
	const [visible, setVisibility] = useState(false);
	const [nftToSend, setNftToSend] = useState(null);
	const [price, setPrice] = useState();

	const [nftToSell, setNftToSell] = useState(null);

	const contractProcessor = useWeb3ExecuteFunction();
	const contractABIJson = JSON.parse(contractABI);

	const ERC721ApproveABIJson = JSON.parse(ERC721ApproveABI);

	const listItemFunction = "createMarketItem";

	async function approve(nft){
		console.log('ok start approve ',rinkebyContractAddress,' to transfer ', nft.token_address, '/', nft.token_id);

		const ops = {
			contractAddress: nft.token_address,
			functionName: 'approve',
			abi: ERC721ApproveABIJson,
			params: {
				to: rinkebyContractAddress,
				tokenId: nft.token_id
			},
		};

		await contractProcessor.fetch({
			params: ops,
			onSuccess: (result) => {
				console.log(result);
			},
			onError: (error) => {
				console.log(error);
			}
		})
	}
	async function list(nft, currentPrice) {
		await approve(nft);

		// console.log('ok start listing ', nft, currentPrice)
		const p = currentPrice * ("1e" + 18);
		const ops = {
			contractAddress: rinkebyContractAddress,
			functionName: listItemFunction,
			abi: contractABIJson,
			params: {
				nftContract: nft.token_address,
				tokenId: nft.token_id,
				price: String(p),
			},
		};

		// console.log('start calling on-chain function')
		// console.log(ops);

		await contractProcessor.fetch({
			params: ops,
			onSuccess: (result) => {
				console.log("item listed");
				console.log(result)

				addItemImage();
			},
			onError: (error) => {
				console.log("something went wrong");
				console.log(error);
			}
		})
	}

	function addItemImage(){
        const ItemImage = Moralis.Object.extend("ItemImages");
        const newItemImage = new ItemImage();

        newItemImage.set("image", nftToSell.image);
        newItemImage.set("nftContract", nftToSell.token_address);
        newItemImage.set("tokenId", nftToSell.token_id);
        newItemImage.set("name", nftToSell.name);

		newItemImage.save();
    }

	const handleSellClick = (nft) => {
		setNftToSell(nft);
		setVisibility(true);
	};

	const handleChange = (e) => {
		setAmount(e.target.value);
	};

	// console.log("NFTBalances", NFTBalances);
	return (
		<>
			<div style={styles.NFTs}>
				<Skeleton loading={!NFTBalances?.result}>
					{NFTBalances?.result ? (
						NFTBalances.result.map((nft, index) => (
							<Card
								hoverable
								key={index}
								actions={[
									<Tooltip
										title='View On Blockexplorer'
										key={index}>
										<FileSearchOutlined
											onClick={() =>
												window.open(
													`${getExplorer(
														chainId,
													)}address/${nft.token_address
													}`,
													"_blank",
												)
											}
										/>
									</Tooltip>,
									<Tooltip
										title='List this NFT'
										key={index}>
										<ShoppingCartOutlined
											key={index}
											onClick={() => handleSellClick(nft)}
										/>
									</Tooltip>,
								]}
								style={{
									width: 240,
									border: "2px solid #e7eaf3",
								}}
								cover={
									<img
										preview={false}
										src={nft?.image || "error"}
										fallback='data:image/png;base64,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'
										alt=''
										style={{ height: "300px" }}
										key={index}
									/>
								}>
								<Meta
									title={nft.name}
									description={nft.token_address}
								/>
							</Card>
						))
					) : (
						<>NO NFTs found!</>
					)}
				</Skeleton>
			</div>
			<Modal
				title={`Sell ${nftToSell?.name || "NFT"}`}
				visible={visible}
				onCancel={() => setVisibility(false)}
				onOk={() => list(nftToSell, price)}
				okText='Sell'>

				<img src={nftToSell?.image}
					style={
						{
							width: "250px",
							margin: "auto",
							borderRadius: "10px",
							marginBottom: "15px"
						}
					}
				/>
				<Input autoFocus placeholder="Set Price in ETH/MATIC" onChange={e => setPrice(e.target.value)} />
			</Modal>
		</>
	);
}

export default NFTBalance;
