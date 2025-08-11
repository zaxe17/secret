import { useState } from "react";

export default function Textmessage({ onClose }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div
			onClick={onClose}
			className="fixed inset-0 flex justify-center items-center z-50 p-10">
			{/* Background */}
			<div className="absolute top-0 z-[-2] h-screen w-screen rotate-180 transform bg-white/60 bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(252,205,238,.5)_100%)]"></div>

			{/* Envelope container */}
			<div className="container">
				<div
					onClick={(e) => {e.stopPropagation(); setIsOpen(!isOpen);}}
					className={`envelope-wrapper ${isOpen ? "flap" : ""}`}>
					<div className="envelope">
						<div className="letter">
							<div className="text">
								<strong>Happy monthsary babi</strong>
								<p>
									Happy monthsary babi, ako'y nagpapasalamat dahil ika'y dumating sa aking buhay at nakasama ka sa pag gawa ng masasayang ala-ala, ikinagagalak kong nakilala natin ang isa't isa. Tayo man ay magkalayo patuloy kitang papaligayahin, at mamahalin sa walang hangganan. Ngayon hindi kana nag iisa, nandito ako upang gabayan, at samahan sa mahirap na pagsubok, Happy monthsary baby, mahal na mahal kita.
								</p>
							</div>
						</div>
					</div>

					{/* Heart */}
					<div className="heart"></div>
				</div>
			</div>
		</div>
	);
}
