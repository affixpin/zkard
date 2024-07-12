/**
 * v0 by Vercel.
 * @see https://v0.dev/t/EMSw8aBL3O0
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
export function CreditCard({
	number,
	expiry,
}: {
	number: string;
	expiry: string;
}) {
	return (
		<div className="flex justify-center items-center">
			<div className="bg-gradient-to-r from-[#4c51bf] to-[#6b46c1] rounded-3xl shadow-lg p-8 w-[100%] h-[250px] relative">
				<div className="absolute top-4 left-4 text-white text-sm">Visa</div>
				<div className="absolute bottom-4 left-4 text-white text-2xl font-bold">
					{number}
				</div>
				<div className="absolute bottom-4 right-4 text-white text-2xl font-bold">
					{expiry}
				</div>
			</div>
		</div>
	);
}
