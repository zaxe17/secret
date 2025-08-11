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
								<strong>Dear Person.</strong>
								<p>
									Happy monthsary babi, maraming salamat sayo
									dahil dumating ka sa aking buhay at nakagawa
									ng masayang ala-ala kasama ka, at napapasaya
									natin ang isa't isa kahit na tayo ay mag
									kalayo, magkalayo man tayo parati kitang
									inisip, at sinisigaw ng aking puso. Ang
									babaeng mamahalin ko sa panghabang buhay
									hanggang wakas. Happy monthsary baby, mahal
									na mahal kita.
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
