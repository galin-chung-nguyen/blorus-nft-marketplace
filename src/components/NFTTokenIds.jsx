import React, { useEffect, useState } from "react";
import { useMoralis, useChain, useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import { getNativeByChain } from "helpers/networks";
import { useNFTTokenIds } from '../hooks/useNFTTokenIds';
import { Card, Image, Tooltip, Modal, Badge, Skeleton, Alert } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { setSearchInputAction } from "../redux/actions";
import {
	ConsoleSqlOutlined,
	FileSearchOutlined,
	RightCircleOutlined,
	SendOutlined,
	ShoppingCartOutlined,
} from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import AddressInput from "./AddressInput";
import { getCollectionsByChain } from "helpers/collections";
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

function NFTTokenIds() {
	// const { data: NFTTokenIds } = useNFTTokenIds();

	const collectionAddress = useSelector(state => state.searchCollectionData).searchCollectionInput;
	const dispatch = useDispatch();

	const { NFTTokenIds } = useNFTTokenIds(collectionAddress);
	const { Moralis, user, account } = useMoralis();
	const { switchNetwork, chainId, chain } = useChain();
	const [visible, setVisibility] = useState(false);
	const contractProcessor = useWeb3ExecuteFunction();
	const contractABIJson = JSON.parse(contractABI);
	const nativeName = getNativeByChain(chainId);
	const [isPending, setIsPending] = useState(false);
	const NFTCollections = getCollectionsByChain(chainId);
	const queryMarketItems = useMoralisQuery("SecondCreatedMarketItems");


	useEffect(() => {
		console.log(queryMarketItems);
	}, [queryMarketItems]);

	const fetchMarketItems = JSON.parse(
		JSON.stringify(queryMarketItems.data, [
			"objectId",
			"createdAt",
			"price",
			"nftContract",
			"itemId",
			"sold",
			"tokenId",
			"seller",
			"owner",
			"confirmed"
		])
	)

	useEffect(() => {

		console.log(fetchMarketItems)
	}, [fetchMarketItems]);

	const [nftToBuy, setNFTToBuy] = useState(null);

	async function updateSoldMarketItem() {
		const id = getMarketItem(nftToBuy).objectId
		const marketList = Moralis.Object.extend("SecondCreatedMarketItems");
		const query = new Moralis.Query(marketList);

		await query.get(id).then((obj) => {
			obj.set("sold", true);
			obj.set("owner", account);
			obj.save();

		})
	}

	async function purchase() {
		const tokenDetails = getMarketItem(nftToBuy);
		const itemId = tokenDetails.itemId;
		const tokenPrice = tokenDetails.price;

		const ops = {
			contractAddress: rinkebyContractAddress,
			functionName: 'createMarketSale',
			abi: contractABIJson,
			params: {
				nftContract: nftToBuy.token_address,
				itemId: itemId
			},
			msgValue: tokenPrice
		};

		await contractProcessor.fetch({
			params: ops,
			onSuccess: (result) => {
				console.log('Bought this NFT');
				updateSoldMarketItem();
			},
			onError: (error) => {
				console.log(error);
			}
		})
	}

	async function transfer(nft, amount, receiver) {
		const options = {
			type: nft.contract_type,
			tokenId: nft.token_id,
			receiver: receiver,
			contractAddress: nft.token_address,
		};

		if (options.type === "erc1155") {
			options.amount = amount;
		}

		setIsPending(true);
		await Moralis.transfer(options)
			.then((tx) => {
				console.log(tx);
				setIsPending(false);
			})
			.catch((e) => {
				alert(e.message);
				setIsPending(false);
			});
	}

	const handleBuyClick = (nft) => {
		setNFTToBuy(nft);
		setVisibility(true);
	};

	const handleChange = (e) => {
		setAmount(e.target.value);
	};

	const getMarketItem = (nft) => {
		const result = fetchMarketItems?.find(
			(e) =>
				e.nftContract == nft?.token_address &&
				e.tokenId == nft?.token_id &&
				e.sold == false &&
				e.confirmed == true
		)
		return result
	}

	useEffect(() => {
		console.log('new collection')
		console.log(NFTCollections)
	}, [NFTCollections]);

	// console.log("NFTTokenIds", NFTTokenIds?.result);
	return (
		<>
			<div style={styles.NFTs}>
				<Skeleton loading={!NFTTokenIds?.result && !NFTCollections}>
					{(NFTTokenIds?.result && collectionAddress !== "explore") ? (
						NFTTokenIds.result.map((nft, index) => (
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
										title='Buy this NFT'
										key={index}>
										<ShoppingCartOutlined
											key={index}
											onClick={() => handleBuyClick(nft)}
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
								{getMarketItem(nft) && <Badge.Ribbon text="Buy now" color="green"></Badge.Ribbon>}

								<Meta
									title={nft?.metadata?.name}
									description={`#${nft.token_id}`}
								/>
							</Card>
						))
					) : ""}
					{(NFTCollections && collectionAddress == "explore") ? (
						NFTCollections.map((nft, index) => (
							<Card
								hoverable
								key={index}
								actions={[
									<Tooltip
										title='View this collection'
										key={index}>
										<RightCircleOutlined
											key={index}
											onClick={() => dispatch(setSearchInputAction(nft.addrs))
											}
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
									title={nft?.metadata?.name}
								/>
							</Card>
						))
					) : ""}
				</Skeleton>
			</div>
			{getMarketItem(nftToBuy) ? (
				<Modal
					title={`Buy ${nftToBuy?.name || "NFT"}`}
					visible={visible}
					onCancel={() => setVisibility(false)}
					onOk={() => purchase()}
					confirmLoading={isPending}
					okText='Buy'>


					<div style={{
						width: "250px",
						margin: "auto"
					}}>

						<Badge.Ribbon text={`${getMarketItem(nftToBuy).price / ("1e" + 18)} ${nativeName}`} color="green">
							<img src={nftToBuy?.image}
								style={
									{
										width: "250px",
										margin: "auto",
										borderRadius: "10px",
										marginBottom: "-15px"
									}
								}
							/>
						</Badge.Ribbon>
					</div>
				</Modal>
			) :
				(<Modal
					title={`Buy ${nftToBuy?.name || "NFT"}`}
					visible={visible}
					onCancel={() => setVisibility(false)}
					onOk={() => setVisibility(false)}
					confirmLoading={isPending}
					okText='Buy'>
					<img src={nftToBuy?.image}
						style={
							{
								width: "250px",
								margin: "auto",
								borderRadius: "10px",
								marginBottom: "-15px"
							}
						}
					/>
					<Alert
						message="This NFT is currently not for sale"
						type="warning" />
				</Modal>)
			}

		</>
	);
}

export default NFTTokenIds;
