type Props = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
};

export function Poster({ src, width, height, alt = "", className }: Props) {
  return (
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      decoding="async"
      loading="lazy"
      className={className}
      style={{ display: "block", width: "100%", height: "auto" }}
    />
  );
}
