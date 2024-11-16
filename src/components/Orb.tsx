import React, { useEffect, useRef, useState } from 'react';

const Orb: React.FC = () => {
  const orbRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isChatActive, setIsChatActive] = useState(false);
  const animationRef = useRef({ 
    rotation: { x: 0, y: 0 }, 
    spinSpeed: 50,
    scale: 1,
    glow: 0
  });

  // Chat widget initialization effect
  useEffect(() => {
    console.log('Chat active state changed to:', isChatActive);
    if (isChatActive) {
      console.log('Attempting to create widget...');
      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      
      console.log('Adding script to document...');
      document.body.appendChild(script);

      const widget = document.createElement('elevenlabs-convai');
      widget.setAttribute('agent-id', '3xyT5pRsoAGIAmdNtqZl');
      widget.id = 'elevenlabs-widget';
      widget.style.position = 'fixed';
      widget.style.right = '20px';
      widget.style.bottom = '20px';
      widget.style.zIndex = '1000';
      console.log('Adding widget to document...');
      document.body.appendChild(widget);

      return () => {
        document.body.removeChild(script);
        const existingWidget = document.getElementById('elevenlabs-widget');
        if (existingWidget) {
          document.body.removeChild(existingWidget);
        }
      };
    }
  }, [isChatActive]);

  useEffect(() => {
    const orb = orbRef.current;
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!orb || !container || !glow) return;

    let rafId: number;
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const distX = mouseX - center.x;
      const distY = mouseY - center.y;
      const distance = Math.sqrt(distX * distX + distY * distY);
      const maxDistance = Math.sqrt(center.x * center.x + center.y * center.y);
      
      const influence = 1 - Math.min(distance / maxDistance, 1);
      const influenceSquared = influence * influence;
      
      const targetRotationX = (distY / center.y) * 45 * influence;
      const targetRotationY = (distX / center.x) * 45 * influence;

      const normalizedDistance = distance / (maxDistance * 0.5);
      const targetSpinSpeed = 2 + Math.pow(normalizedDistance, 1.5) * 198;

      const targetScale = 1 + (0.2 * influenceSquared);
      const targetGlow = influenceSquared * 1.5;

      const animate = () => {
        const { rotation, spinSpeed, scale, glow } = animationRef.current;
        
        rotation.x += (targetRotationX - rotation.x) * 0.1;
        rotation.y += (targetRotationY - rotation.y) * 0.1;
        animationRef.current.spinSpeed += (targetSpinSpeed - spinSpeed) * 0.05;
        animationRef.current.scale += (targetScale - scale) * 0.1;
        animationRef.current.glow += (targetGlow - glow) * 0.1;
        
        orb.style.transform = `
          scale(${animationRef.current.scale})
          rotateX(${rotation.x}deg) 
          rotateY(${rotation.y}deg) 
          rotate3d(1, 1, 1, ${Date.now() / animationRef.current.spinSpeed}deg)
        `;

        // Change glow color based on chat state
        const glowColor = isChatActive ? '0, 255, 255' : '255, 255, 255';
        const glowIntensity = 20 + (animationRef.current.glow * 40);
        const glowOpacity = 0.1 + (animationRef.current.glow * 0.4);
        glow.style.boxShadow = `
          0 0 ${glowIntensity}px ${glowIntensity * 1.5}px rgba(${glowColor}, ${glowOpacity})
        `;
        
        rafId = requestAnimationFrame(animate);
      };
      
      if (!rafId) {
        animate();
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    
    const initialAnimate = () => {
      const time = Date.now() / 1000;
      const baseScale = 1 + Math.sin(time) * 0.03;
      
      orb.style.transform = `
        scale(${baseScale})
        rotate3d(1, 1, 1, ${Date.now() / animationRef.current.spinSpeed}deg)
      `;
      
      rafId = requestAnimationFrame(initialAnimate);
    };
    initialAnimate();
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isChatActive]);

  const handleOrbClick = () => {
    console.log('Orb clicked, chat active state:', !isChatActive);
    setIsChatActive(!isChatActive);
  };

  return (
    <div ref={containerRef} className="h-screen w-screen bg-black flex items-center justify-center perspective">
      <div className="flex flex-col items-center">
        <h1 className="text-8xl font-bold text-white mb-2 title-glow tracking-widest">BOB</h1>
        <p className="text-white/80 text-sm mb-12 subtitle-glow uppercase">(the bioengineered fish)</p>
        <button 
          onClick={handleOrbClick}
          className="focus:outline-none"
          aria-label={isChatActive ? "Stop Chat" : "Start Chat"}
        >
          <div 
            ref={orbRef}
            className={`orb group relative w-96 h-96 transition-all duration-300 ease-out transform-style-3d ${
              isChatActive ? 'pulse-active' : ''
            }`}
          >
            <div
              ref={glowRef}
              className="absolute -inset-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className={`absolute inset-0 border rounded-full transform-style-3d transition-all duration-300 ${
                  isChatActive 
                    ? 'border-cyan-400/40 group-hover:border-cyan-400/60' 
                    : 'border-white/40 group-hover:border-white/60'
                }`}
                style={{
                  transform: `rotateX(${i * 12}deg) rotateY(${i * 12}deg)`,
                  animation: `pulse ${3 + i * 0.2}s ease-in-out infinite alternate`,
                  animationDelay: `${i * -0.1}s`
                }}
              />
            ))}
            <div className={`absolute inset-0 rounded-full transform-style-3d transition-colors duration-300 blur-sm ${
              isChatActive 
                ? 'bg-cyan-400/5 group-hover:bg-cyan-400/10' 
                : 'bg-white/5 group-hover:bg-white/10'
            }`} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Orb;