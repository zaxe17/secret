import { Canvas, useFrame } from "@react-three/fiber";
import { Image, OrbitControls, useCursor, Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Billboard image that always faces camera
const BillboardImage = ({ src, position, scale, onClick }: any) => {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.lookAt(camera.position);
    }
  });

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

// Twinkling star shader
const TwinklingStars = ({ count = 1000, radius = 100 }) => {
  const pointsRef = useRef<THREE.Points>(null);

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

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={`
          attribute float aOffset;
          uniform float uTime;
          varying float vOpacity;
          void main() {
            vOpacity = 0.5 + 0.5 * sin(uTime + aOffset);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 3.5;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying float vOpacity;
          void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity);
          }
        `}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
      />
    </points>
  );
};

// Text attached to sphere surface
const SphereText = ({ message, radius = 25 }: { message: string; radius?: number }) => {
  const letters = useMemo(() => {
    const totalArc = Math.PI * 1.85;
    const angleStep = totalArc / (message.length - 1);
    const startAngle = -totalArc / 2;
    const phi = Math.PI / 2; // equator

    return message.split("").map((char, i) => {
      const theta = startAngle + i * angleStep;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      // outward facing rotation
      const normal = new THREE.Vector3(x, y, z).normalize();
      const lookAtMatrix = new THREE.Matrix4();
      lookAtMatrix.lookAt(new THREE.Vector3(0, 0, 0), normal, new THREE.Vector3(0, 1, 0));
      const rotation = new THREE.Euler().setFromRotationMatrix(lookAtMatrix);

      return {
        char,
        position: [x, y, z] as [number, number, number],
        rotation: [rotation.x, rotation.y, rotation.z] as [number, number, number],
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
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineColor="black"
          outlineWidth={0.03}
        >
          {char}
        </Text>
      ))}
    </>
  );
};

const Gallery = () => {
  const imageModules = import.meta.glob("/src/assets/*.{jpg,jpeg,png,gif,webp}");
  const [imageList, setImageList] = useState<string[]>([]);
  const [imageData, setImageData] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const imports = await Promise.all(
        Object.values(imageModules).map((load) =>
          (load as () => Promise<{ default: string }>)().then((mod) => mod.default)
        )
      );
      setImageList(imports);
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (imageList.length === 0) return;

    const sphereRadius = 33;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    const generated = imageList
      .map((src, i) => {
        const y = 1 - (i / (imageList.length - 1)) * 2;
        if (Math.abs(y) > 0.98) return null;
        const radius = Math.sqrt(1 - y * y);
        const theta = goldenAngle * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        return {
          src,
          position: [x * sphereRadius, y * sphereRadius, z * sphereRadius],
          scale: 8,
        };
      })
      .filter(Boolean);

    setImageData(generated);
  }, [imageList]);

  const message =
    "TO THE MOST AMAZING PERSON IN MY LIFE, HAPPY FIRST MONTH ANNIVERSARY. I LOVE YOU WITH ALL OF MY HEART AND WILL ALWAYS BE GRATEFUL FOR YOU.";

  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <color attach="background" args={["black"]} />
        <ambientLight intensity={1} />
        <TwinklingStars count={1500} radius={150} />

        <Suspense fallback={null}>
          <SphereText message={message} radius={30} />

          {imageData.map(({ src, position, scale }, i) => (
            <BillboardImage
              key={`img-${i}`}
              src={src}
              position={position}
              scale={scale}
              onClick={(imgSrc: string) => setSelectedImage(imgSrc)}
            />
          ))}

          <OrbitControls
            makeDefault
            autoRotate
            autoRotateSpeed={0.5}
            enablePan={false}
            minDistance={1}
            maxDistance={20}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            rotateSpeed={-1}
          />
        </Suspense>
      </Canvas>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="fullscreen"
            className="max-w-full max-h-full object-contain cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
