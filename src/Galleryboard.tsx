import { Canvas, useFrame } from "@react-three/fiber";
import { Image, OrbitControls, useCursor, Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const playfairFont = "/fonts/Rubik-Regular.ttf";

// Image that sticks on the sphere surface
const SphereImage = ({ src, position, scale, onClick }: any) => {
	const ref = useRef<THREE.Group>(null);
	const [hovered, setHovered] = useState(false);
	useCursor(hovered);

	useEffect(() => {
		if (ref.current) {
			const normal = new THREE.Vector3(...position).normalize();
			const lookAtMatrix = new THREE.Matrix4();
			lookAtMatrix.lookAt(
				new THREE.Vector3(0, 0, 0),
				normal,
				new THREE.Vector3(0, 1, 0)
			);
			const rotation = new THREE.Euler().setFromRotationMatrix(
				lookAtMatrix
			);
			ref.current.rotation.set(rotation.x, rotation.y, rotation.z);
		}
	}, [position]);

	return (
		<group ref={ref} position={position}>
			<Image
				url={src}
				scale={[scale, scale]}
				material-transparent
				material-blending={THREE.AdditiveBlending}
				onClick={(e) => {
					e.stopPropagation();
					onClick?.(src);
				}}
				onPointerOver={() => setHovered(true)}
				onPointerOut={() => setHovered(false)}
			/>
		</group>
	);
};

// Star shader
const TwinklingStars = ({ count = 1000, radius = 100 }) => {
	const pointsRef = useRef<THREE.Points>(null);
	const materialRef = useRef<THREE.ShaderMaterial>(null);

	const positions = useMemo(() => {
		const pos = [];
		for (let i = 0; i < count; i++) {
			const r = radius * (0.5 + Math.random() * 0.5);
			const theta = Math.random() * 2 * Math.PI;
			const phi = Math.acos(2 * Math.random() - 1);
			const x = r * Math.sin(phi) * Math.cos(theta);
			const y = r * Math.sin(phi) * Math.sin(theta);
			const z = r * Math.cos(phi);
			pos.push(x, y, z);
		}
		return new Float32Array(pos);
	}, [count, radius]);

	const offsets = useMemo(() => {
		const arr = new Float32Array(count);
		for (let i = 0; i < count; i++) {
			arr[i] = Math.random() * Math.PI * 2;
		}
		return arr;
	}, [count]);

	useFrame(({ clock }) => {
		if (materialRef.current) {
			materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
		}
	});

	return (
		<points ref={pointsRef}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					args={[positions, 3]}
				/>
				<bufferAttribute
					attach="attributes-aOffset"
					args={[offsets, 1]}
				/>
			</bufferGeometry>
			<shaderMaterial
				ref={materialRef}
				args={[{
					uniforms: {
						uTime: { value: 0 }
					},
					vertexShader: `
						attribute float aOffset;
						uniform float uTime;
						varying float vOpacity;

						void main() {
							float speed = 1.5;
							vOpacity = 0.3 + 0.7 * abs(sin(uTime * speed + aOffset));
							vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
							gl_PointSize = 2.5;
							gl_Position = projectionMatrix * mvPosition;
						}
					`,
					fragmentShader: `
						varying float vOpacity;

						void main() {
							float d = distance(gl_PointCoord, vec2(0.5));
							if (d > 0.5) discard;
							gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity);
						}
					`,
					transparent: true,
					depthWrite: false
				}]}
			/>
		</points>
	);
};

// Text on sphere
const SphereText = ({
	message,
	radius = 25,
}: {
	message: string;
	radius?: number;
}) => {
	const letters = useMemo(() => {
		const totalArc = Math.PI * 1.85;
		const angleStep = totalArc / (message.length - 1);
		const startAngle = -totalArc / 2;
		const phi = Math.PI / 2;

		return message.split("").map((char, i) => {
			const theta = startAngle + i * angleStep;
			const x = radius * Math.sin(phi) * Math.cos(theta);
			const y = radius * Math.cos(phi);
			const z = radius * Math.sin(phi) * Math.sin(theta);

			const normal = new THREE.Vector3(x, y, z).normalize();
			const lookAtMatrix = new THREE.Matrix4();
			lookAtMatrix.lookAt(
				new THREE.Vector3(0, 0, 0),
				normal,
				new THREE.Vector3(0, 1, 0)
			);
			const rotation = new THREE.Euler().setFromRotationMatrix(
				lookAtMatrix
			);

			return {
				char,
				position: [x, y, z] as [number, number, number],
				rotation: [rotation.x, rotation.y, rotation.z] as [
					number,
					number,
					number
				],
			};
		});
	}, [message, radius]);

	return (
		<>
			{letters.map(({ char, position, rotation }, i) => (
				<Text
					key={i}
					position={position}
					rotation={rotation}
					fontSize={2.5}
					font={playfairFont}
					color="#E5E4E2"
					anchorX="center"
					anchorY="middle"
					outlineColor="#FFB6C1"
					outlineWidth={0.04}>
					{char}
				</Text>
			))}
		</>
	);
};

// OrbitControls with start toggle
const Controls = ({ start }: { start: boolean }) => {
	const controlsRef = useRef<any>(null);
	useFrame(() => {
		if (start) controlsRef.current?.update();
	});
	return (
		<OrbitControls
			ref={controlsRef}
			autoRotate={start}
			autoRotateSpeed={0.1}
			enablePan={false}
			minDistance={1}
			maxDistance={20}
			minPolarAngle={0}
			maxPolarAngle={Math.PI}
			rotateSpeed={-1}
		/>
	);
};

const Galleryboard = () => {
	const imageModules = import.meta.glob(
		"/src/assets/*.{jpg,jpeg,png,gif,webp}"
	);
	const [imageList, setImageList] = useState<string[]>([]);
	const [imageData, setImageData] = useState<any[]>([]);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [rotationStarted, setRotationStarted] = useState(false);
	const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setMinimumLoadTimePassed(true);
		}, 3500);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		const loadImages = async () => {
			const imports = await Promise.all(
				Object.values(imageModules).map((load) =>
					(load as () => Promise<{ default: string }>)().then(
						(mod) => mod.default
					)
				)
			);
			setImageList(imports);
			setLoading(false);
		};
		loadImages();
	}, []);

	useEffect(() => {
		if (imageList.length === 0) return;

		const sphereRadius = 34;
		const latDivisions = 12;
		const lonDivisions = 26;
		const generated: any[] = [];

		let imageIndex = 0;

		for (let i = 0; i < latDivisions; i++) {
			if (i <= 1 || i >= latDivisions - 2) continue;

			const theta = (i / (latDivisions - 1)) * Math.PI;

			for (let j = 0; j < lonDivisions; j++) {
				if ((i + j) % 2 !== 0) continue;

				if (imageIndex >= imageList.length) break;

				const phi = (j / lonDivisions) * 2 * Math.PI;

				const x = Math.sin(theta) * Math.cos(phi) * sphereRadius;
				const y = Math.cos(theta) * sphereRadius;
				const z = Math.sin(theta) * Math.sin(phi) * sphereRadius;

				generated.push({
					src: imageList[imageIndex],
					position: [x, y, z],
					scale: 9,
				});

				imageIndex++;
			}
		}

		setImageData(generated);

		const checkReady = () => {
			if (minimumLoadTimePassed && !loading) {
				setRotationStarted(true);
			}
		};

		const readyCheckInterval = setInterval(checkReady, 100);
		checkReady();

		return () => clearInterval(readyCheckInterval);
	}, [imageList, loading, minimumLoadTimePassed]);

	const message =
		"HAPPY MONTHSARY TO THE MOST AMAZING PERSON IN MY LIFE. I LOVE YOU WITH ALL OF MY HEART AND WILL ALWAYS BE GRATEFUL FOR YOU.";

	return (
		<div className="w-full h-screen relative">
			<Canvas camera={{ position: [35, -12, 20], fov: 60 }}>
				<color attach="background" args={["black"]} />
				<ambientLight intensity={1} />
				<TwinklingStars count={1500} radius={150} />

				<Suspense fallback={null}>
					<SphereText message={message} radius={30} />
					{imageData.map(({ src, position, scale }, i) => (
						<SphereImage
							key={`img-${i}`}
							src={src}
							position={position}
							scale={scale}
							onClick={(imgSrc: string) =>
								setSelectedImage(imgSrc)
							}
						/>
					))}
					<Controls start={rotationStarted} />
				</Suspense>
			</Canvas>

			{(!rotationStarted || loading || !minimumLoadTimePassed) && (
				<div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white bg-black">
					<div className="text-lg lg:text-4xl font-bold mb-4">
						Loading Please Wait...
					</div>
					<div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
						<div
							className="h-full bg-white transition-all duration-500"
							style={{ animation: "loading 2s ease infinite" }}
						/>
					</div>
				</div>
			)}

			{selectedImage && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
					onClick={() => setSelectedImage(null)}>
					<img
						src={selectedImage}
						alt="fullscreen"
                        draggable="false"
						className="max-w-full max-h-full object-contain cursor-pointer"
					/>
				</div>
			)}
		</div>
	);
};

export default Galleryboard;
