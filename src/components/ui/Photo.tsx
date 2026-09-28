import Image from "next/image";
import clsx from "clsx";
import { alt as altFor, imageMeta, imgSrc } from "@/content/images";

type Props = {
  slug: string;
  alt?: string;
  sizes: string;
  className?: string;
  /** Fill the (positioned) parent. Otherwise renders at intrinsic ratio. */
  fill?: boolean;
  preload?: boolean;
  quality?: 60 | 75 | 85;
  /** Decorative: empty alt. */
  decorative?: boolean;
  style?: React.CSSProperties;
  draggable?: boolean;
};

/** next/image wrapper that knows every photo's size. Containers carry a sand background as the placeholder. */
export function Photo({ slug, alt, sizes, className, fill = true, preload, quality = 75, decorative, style, draggable }: Props) {
  const meta = imageMeta[slug];
  const common = {
    src: imgSrc(slug),
    alt: decorative ? "" : (alt ?? altFor(slug)),
    sizes,
    quality,
    // Above-the-fold (LCP) images: eager + high priority, discoverable in the HTML.
    ...(preload ? { loading: "eager" as const, fetchPriority: "high" as const } : {}),
    className: clsx(fill && "object-cover", className),
    style,
    draggable,
  };
  if (fill) return <Image {...common} fill alt={common.alt} />;
  return <Image {...common} width={meta?.[0] ?? 1600} height={meta?.[1] ?? 1067} alt={common.alt} />;
}
