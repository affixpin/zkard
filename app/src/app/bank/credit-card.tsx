/**
 * v0 by Vercel.
 * @see https://v0.dev/t/EMSw8aBL3O0
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
export function CreditCard() {
	return (
		<div className="flex justify-center items-center">
			<div className="bg-gradient-to-r from-[#4c51bf] to-[#6b46c1] rounded-3xl shadow-lg p-8 w-[100%] h-[250px] relative">
				<div className="absolute top-4 left-4 text-white text-sm">
					<PinIcon className="w-6 h-6 inline-block mr-2" />
					Visa
				</div>
				<div className="absolute bottom-4 left-4 text-white text-2xl font-bold">
					1111 2222 3333 4444
				</div>
				<div className="absolute bottom-4 right-4 text-white text-2xl font-bold">
					04/20
				</div>
			</div>
		</div>
	);
}

function PinIcon(props: any) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="12" x2="12" y1="17" y2="22" />
			<path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
		</svg>
	);
}

