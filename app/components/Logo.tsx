import Image from 'next/image';
import Link from 'next/link';

type Props = {
  size?: number;
  href?: string;
  showText?: boolean;
};

export function Logo({ size = 48, href = '/', showText = true }: Props) {
  const img = (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.jpeg"
        alt="Weber County Archery Park logo"
        width={size}
        height={size}
        className="rounded-md"
        style={{
          filter: 'contrast(10) brightness(1.1)',
          mixBlendMode: 'screen',
        }}
        priority
      />
      {showText && (
        <div className="leading-tight">
          <p className="font-black text-white text-sm uppercase tracking-wide">Weber County</p>
          <p className="font-bold text-green-400 text-xs uppercase tracking-widest">Archery Park</p>
        </div>
      )}
    </div>
  );

  if (!href) return img;

  return (
    <Link href={href} className="inline-flex">
      {img}
    </Link>
  );
}
