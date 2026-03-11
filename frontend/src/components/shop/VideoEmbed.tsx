import { useTranslation } from "react-i18next";
import { useEffect } from "react";

interface VideoEmbedProps {
  url: string;
}

function getYouTubeId(url: string): string | null {
  // youtube.com/watch?v=ID
  const watchMatch = url.match(
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
  );
  if (watchMatch) return watchMatch[1];

  // youtu.be/ID
  const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/shorts/ID
  const shortsMatch = url.match(
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  );
  if (shortsMatch) return shortsMatch[1];

  // youtube.com/embed/ID
  const embedMatch = url.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

function getTikTokId(url: string): string | null {
  // tiktok.com/@user/video/ID
  const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  return match ? match[1] : null;
}

export const VideoEmbed = ({ url }: VideoEmbedProps) => {
  const { t } = useTranslation();

  const youtubeId = getYouTubeId(url);
  const tiktokId = getTikTokId(url);

  useEffect(() => {
    // Inject TikTok embed script
    if (tiktokId) {
      const scriptId = "tiktok-embed-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://www.tiktok.com/embed.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [tiktokId]);

  if (youtubeId) {
    return (
      <div className="space-y-4 pt-8 border-t border-slate-100">
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
          {t("productVideo")}
        </p>
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 shadow-lg aspect-video">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (tiktokId) {
    return (
      <div className="space-y-4 pt-8 border-t border-slate-100 w-full max-w-[325px]">
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
          {t("productVideo")}
        </p>
        <div className="w-full bg-slate-50 rounded-2xl overflow-hidden shadow-sm flex justify-center">
          <blockquote
            className="tiktok-embed"
            cite={url}
            data-video-id={tiktokId}
            style={{ maxWidth: "325px", minWidth: "325px" }}
          >
            <section></section>
          </blockquote>
        </div>
      </div>
    );
  }

  // Unrecognized URL — render nothing
  return null;
};
