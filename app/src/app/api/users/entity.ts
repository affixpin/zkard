export interface User {
	id: string
	balance: number
	creditLimit: number
	creditSpent: number
	defiColleteral: number
	defiAddress?: `0x${string}`

	card: {
		number: string
		expiry: string
	}
}
