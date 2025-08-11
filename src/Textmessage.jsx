const Textmessage = ({ onClose }) => {
	return (
		<div
			onClick={onClose}
			className="fixed inset-0 flex justify-center items-center z-50 cursor-pointer p-10">
			<div class="absolute top-0 z-[-2] h-screen w-screen rotate-180 transform bg-white/60 bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(252,205,238,.5)_100%)]"></div>
			<div className=" relative w-ful lg:w-1/4 flex text-justify items-center">
                <div class="absolute top-0 left-0 h-full w-full rotate-180 transform bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(252,205,238,.5)_100%)] rounded-2xl"></div>
				<p onClick={(e) => e.stopPropagation()} className="text-sm lg:text-xl z-20 p-5">
					Happy monthsary babi, maraming salamat sayo dahil dumating ka sa aking buhay at nakagawa ng masayang ala-ala kasama ka, at napapasaya natin ang isa't isa kahit na tayo ay mag kalayo, magkalayo man tayo parati kitang inisip, at sinisigaw ng aking puso. Ang babaeng mamahalin ko sa panghabang buhay hanggang wakas. Happy monthsary baby, mahal na mahal kita.
				</p>
			</div>
		</div>
	);
};

export default Textmessage;
