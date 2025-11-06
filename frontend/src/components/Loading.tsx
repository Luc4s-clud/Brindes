import './Loading.css';

interface LoadingProps {
  message?: string;
  fullscreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Carregando...',
  fullscreen = false,
  size = 'medium',
}) => {
  const containerClass = fullscreen ? 'loading-fullscreen' : 'loading-container';
  const spinnerClass = `loading-spinner loading-spinner-${size}`;

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className={spinnerClass} aria-hidden="true">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default Loading;

