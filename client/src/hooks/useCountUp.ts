import { useState, useEffect } from 'react';

export function useCountUp(end: number, durationMs: number = 500) {
  const [count, setCount] = useState(end);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = count;
    
    // If the difference is 0, don't animate
    if (startValue === end) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      
      setCount(Math.floor(progress * (end - startValue) + startValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, durationMs]);

  return count;
}
