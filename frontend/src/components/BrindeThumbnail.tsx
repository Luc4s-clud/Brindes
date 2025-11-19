import { useMemo, useState } from 'react';
import { getImageUrl } from '../utils/apiUrl';

const localImages = import.meta.glob('../assents/**/*.{png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

interface BrindeThumbnailProps {
  nome: string;
  fotoUrl?: string | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  chavesAlternativas?: Array<string | null | undefined>;
}

const plainLookup = Object.entries(localImages).reduce((acc, [path, value]) => {
  const cleanedPath = path.replace('../', '');
  const filenameWithExt = cleanedPath.replace(/^src\/assents\//, '');
  const baseName = filenameWithExt.split('.')[0] ?? '';
  acc[baseName.toLowerCase()] = value;
  
  // Debug: log das imagens carregadas
  if (import.meta.env.DEV) {
    console.log('[BrindeThumbnail] Imagem carregada:', {
      path,
      baseName,
      normalized: baseName.toLowerCase(),
    });
  }
  
  return acc;
}, {} as Record<string, string>);

const lookupByNormalizedName: Record<string, string> = Object.entries(localImages).reduce(
  (acc, [path, value]) => {
    const cleanedPath = path.replace('../', '');
    const filenameWithExt = cleanedPath.replace(/^src\/assents\//, '');
    const baseName = filenameWithExt.split('.')[0] ?? '';
    const normalized = baseName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    acc[normalized] = value;
    return acc;
  },
  {} as Record<string, string>,
);

const findLocalImage = (
  chaves: string[],
): {
  url: string;
  usedKey: string;
} | null => {
  for (const chave of chaves) {
    const normalized = chave
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    if (lookupByNormalizedName[normalized]) {
      return { url: lookupByNormalizedName[normalized], usedKey: chave };
    }

    const lower = chave.toLowerCase();
    if (plainLookup[lower]) {
      return { url: plainLookup[lower], usedKey: chave };
    }
  }

  return null;
};

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

    const chaves = [nome, ...(chavesAlternativas ?? [])].filter(
      (valor): valor is string => Boolean(valor),
    );

    const encontrada = findLocalImage(chaves);
    
    // Debug: log para ajudar a identificar problemas
    if (import.meta.env.DEV && !encontrada && chaves.length > 0) {
      console.log('[BrindeThumbnail] Buscando imagem para:', {
        nome,
        chavesAlternativas,
        chavesBuscadas: chaves,
        imagensDisponiveis: Object.keys(lookupByNormalizedName),
      });
    }
    
    return encontrada?.url ?? null;
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


