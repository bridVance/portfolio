type Props = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
  /** The hero poster is the LCP element — load it eagerly, high priority. */
  priority?: boolean;
};

export function Poster({ src, width, height, alt = "", className, priority = false }: Props) {
  return (
    // Deliberate plain <img>, not next/image: the poster is a pre-sized static
    // asset that must render identically with JS disabled and add zero client
    // runtime (spec §4.3). width/height are explicit so there is no CLS.
    // eslint-disable-next-line nextjs/no-img-element
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={className}
      style={{ display: "block", width: "100%", height: "auto" }}
    />
  );
}
