import { useMemo, useState } from 'react';
import { getImageUrl } from '../utils/apiUrl';

const localImages = import.meta.glob('../assents/**/*.{png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const findLocalImage = (nome: string): string | null => {
  const normalized = normalize(nome);
  const entry = Object.entries(localImages).find(([path]) => {
    const relativePath = path.replace('../', '');
    const filenameWithExt = relativePath.replace(/^src\/assents\//, '');
    const filename = filenameWithExt.split('.')[0] ?? '';
    return normalize(filename) === normalized;
  });
  return entry?.[1] ?? null;
};

interface BrindeThumbnailProps {
  nome: string;
  fotoUrl?: string | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  chavesAlternativas?: Array<string | null | undefined>;
}

export const BrindeThumbnail: React.FC<BrindeThumbnailProps> = ({
  nome,
  fotoUrl,
  size = 'medium',
  className,
  chavesAlternativas,
}) => {
  const [remoteError, setRemoteError] = useState(false);
  const [localError, setLocalError] = useState(false);

  const remoteImageUrl = useMemo(
    () => (fotoUrl && !remoteError ? getImageUrl(fotoUrl) : null),
    [fotoUrl, remoteError],
  );

  const localImageUrl = useMemo(() => {
    if (localError) return null;

    const chaves = [nome, ...(chavesAlternativas ?? [])]
      .filter((valor): valor is string => Boolean(valor));

    for (const chave of chaves) {
      const encontrada = findLocalImage(chave);
      if (encontrada) {
        return encontrada;
      }
    }

    return null;
  }, [nome, chavesAlternativas, localError]);

  const imageUrl = remoteImageUrl ?? localImageUrl;

  const initials = useMemo(
    () =>
      nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase() || '🎁',
    [nome],
  );

  if (imageUrl) {
    const isRemote = imageUrl === remoteImageUrl;

    return (
      <img
        src={imageUrl}
        alt={nome}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={(event) => {
          event.preventDefault();
          if (isRemote) {
            setRemoteError(true);
          } else {
            setLocalError(true);
          }
        }}
      />
    );
  }

  return (
    <div
      className={className}
      aria-hidden
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #5c6bc0, #3949ab)',
        color: '#fff',
        fontWeight: 700,
        fontSize: size === 'large' ? '3rem' : size === 'medium' ? '2rem' : '1.5rem',
        letterSpacing: '0.05em',
      }}
    >
      <span>{initials}</span>
    </div>
  );
};

export default BrindeThumbnail;


