import confetti from "canvas-confetti";

export function useConfetti() {
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return { triggerConfetti };
}

