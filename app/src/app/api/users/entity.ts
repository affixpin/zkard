export interface User {
	id: string
	balance: number
	creditLimit: number
	creditSpent: number
	defiCollateral: number
	defiCollateralEnabled: number
	defiAddress?: `0x${string}`

	card: {
		number: string
		expiry: string
	}

	positions: {
		[id: string]: boolean
	}
}

