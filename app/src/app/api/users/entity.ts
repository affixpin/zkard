export interface User {
	id: string
	balance: number
	creditLimit: number
	creditSpent: number
	defiColleteral: number

	card: {
		number: string
		expiry: string
	}
}
