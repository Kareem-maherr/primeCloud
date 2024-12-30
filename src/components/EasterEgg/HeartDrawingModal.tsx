import React, { useEffect, useState } from "react";
import { Modal, Box, Typography } from "@mui/material";

interface HeartDrawingModalProps {
  emailValue: string;
}

const HeartDrawingModal: React.FC<HeartDrawingModalProps> = ({ emailValue }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (emailValue.toLowerCase().includes("monekydluffy")) {
      setIsModalOpen(true);
    }
  }, [emailValue]);

  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        const canvas = document.getElementById("heartCanvas") as HTMLCanvasElement;
        if (!canvas) {
          console.error("Canvas element not found");
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Unable to get canvas context");
          return;
        }

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const mainScale = 15; // Scale for the main heart
        const step = 0.02; // Step size for incrementing the heart
        let t = 0; // Current angle for drawing
        const scales = [15, 12, 9, 6, 3]; // Scales for smaller hearts
        let currentHeartIndex = 0; // Index of the currently animating heart
        let fireworksStarted = false; // Flag to indicate fireworks start

        // Function to draw a heart progressively
        const drawHeart = (scale: number, maxAngle: number) => {
          ctx.beginPath();
          for (let angle = 0; angle <= maxAngle; angle += step) {
            const x = centerX + scale * 16 * Math.pow(Math.sin(angle), 3);
            const y =
              centerY -
              scale *
                (13 * Math.cos(angle) -
                  5 * Math.cos(2 * angle) -
                  2 * Math.cos(3 * angle) -
                  Math.cos(4 * angle));
            if (angle === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.closePath();
        };

        // Function to fill the largest heart
        const fillHeart = () => {
          ctx.beginPath();
          for (let angle = 0; angle <= Math.PI * 2; angle += step) {
            const x = centerX + mainScale * 16 * Math.pow(Math.sin(angle), 3);
            const y =
              centerY -
              mainScale *
                (13 * Math.cos(angle) -
                  5 * Math.cos(2 * angle) -
                  2 * Math.cos(3 * angle) -
                  Math.cos(4 * angle));
            if (angle === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.fillStyle = "rgba(255, 0, 0, 0.8)"; // Solid red color
          ctx.fill();
          ctx.closePath();
        };

        // Function to create fireworks effect
        const drawFireworks = () => {
          const particles = 100; // Number of particles per explosion
          const particleArray: { x: number; y: number; dx: number; dy: number; color: string }[] = [];

          // Create particles at random positions
          for (let i = 0; i < particles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            particleArray.push({
              x: centerX,
              y: centerY,
              dx: Math.cos(angle) * speed,
              dy: Math.sin(angle) * speed,
              color: `hsl(${Math.random() * 360}, 100%, 50%)`, // Random vibrant colors
            });
          }

          const animateParticles = () => {
            ctx.clearRect(0, 0, width, height); // Clear canvas

            // Draw heart to ensure it remains on screen
            fillHeart();

            // Animate each particle
            particleArray.forEach((particle) => {
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
              ctx.fillStyle = particle.color;
              ctx.fill();
              ctx.closePath();

              // Update particle position
              particle.x += particle.dx;
              particle.y += particle.dy;
              particle.dy += 0.1; // Gravity effect
            });

            // Continue animation for a few seconds
            if (particleArray[0].y < height) {
              requestAnimationFrame(animateParticles);
            }
          };

          animateParticles();
        };

        // Animation loop to draw all hearts step by step
        const drawStepByStepHearts = () => {
          if (currentHeartIndex >= scales.length) {
            if (!fireworksStarted) {
              fillHeart(); // Fill the heart after all animations
              fireworksStarted = true;
              drawFireworks(); // Start fireworks
            }
            return;
          }

          // Clear the canvas for every frame
          ctx.clearRect(0, 0, width, height);

          // Draw already completed hearts
          for (let i = 0; i < currentHeartIndex; i++) {
            drawHeart(scales[i], Math.PI * 2); // Draw full heart
          }

          // Draw the current heart incrementally
          drawHeart(scales[currentHeartIndex], t);

          t += 0.05; // Increment the angle
          if (t > Math.PI * 2) {
            t = 0; // Reset the angle for the next heart
            currentHeartIndex++; // Move to the next heart
          }

          requestAnimationFrame(drawStepByStepHearts); // Continue animation
        };

        // Start the animation
        drawStepByStepHearts();
      }, 100); // Wait for 100ms to ensure canvas is rendered

      return () => clearTimeout(timer); // Cleanup timeout
    }
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal open={isModalOpen} onClose={closeModal}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
          bgcolor: "rgba(0, 0, 0, 0.9)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" sx={{ color: "#fff", mb: 4 }}>
            I Love You So Much ❤️
          </Typography>
          <canvas
            id="heartCanvas"
            width={600}
            height={600}
            style={{
              borderRadius: "8px",
              background: "black",
              boxShadow: "0 0 20px rgba(255, 0, 0, 0.8)",
            }}
          ></canvas>
        </Box>
      </Box>
    </Modal>
  );
};

export default HeartDrawingModal;
