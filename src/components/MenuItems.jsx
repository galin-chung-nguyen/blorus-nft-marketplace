import React from "react";
import { useRouter } from "next/router";
import { Menu } from "antd";
import Link from "next/link";

function MenuItems() {
	const { pathname } = useRouter();

	return (
		<Menu
			theme='light'
			mode='horizontal'
			style={{
				display: "flex",
				fontSize: "17px",
				fontWeight: "500",
				width: "100%",
				justifyContent: "center",
			}}
			defaultSelectedKeys={[pathname]}>
			<Menu.Item key='/quickstart'>
				<Link href='/quickstart'>
					<a>🚀 Quick Start</a>
				</Link>
			</Menu.Item>
			<Menu.Item key='/nftMarket'>
				<Link href='/nftMarket'>
					<a>Explore</a>
				</Link>
			</Menu.Item>
			<Menu.Item key='/nftBalance'>
				<Link href='/nftBalance'>
					<a>🖼 Your collection</a>
				</Link>
			</Menu.Item>
			<Menu.Item key='/transactions'>
				<Link href='/transactions'>
					<a>Transactions</a>
				</Link>
			</Menu.Item>
		</Menu>
	);
}

export default MenuItems;
