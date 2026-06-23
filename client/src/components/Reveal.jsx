import { useReveal } from '../hooks/useReveal';

const Reveal = ({ children, className = '', delay = 0 }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`${visible ? 'animate-floatUp' : 'opacity-0'} ${className}`}
      style={{ animationDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
};

export default Reveal;
