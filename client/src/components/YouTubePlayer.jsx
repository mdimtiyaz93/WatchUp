import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const YouTubePlayer = forwardRef(
  ({ videoId, onStateChange, canControl }, ref) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const callbackRef = useRef(onStateChange);

    const [ready, setReady] = useState(false);

    useEffect(() => {
      callbackRef.current = onStateChange;
    }, [onStateChange]);

    useEffect(() => {
      if (!videoId) return;

      const createPlayer = () => {
        if (!containerRef.current || !window.YT?.Player) return;

        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }

        setReady(false);

        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: videoId,

          playerVars: {
            autoplay: 0,
            controls: canControl ? 1 : 0,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
          },

          events: {
            onReady: () => {
              setReady(true);
              console.log("YouTube Player Ready:", videoId);
            },

            onStateChange: (event) => {
              console.log("YOUTUBE EVENT:", event.data);

              if (event.data === window.YT.PlayerState.PLAYING) {
                console.log("YOUTUBE PLAYING");
                callbackRef.current?.("playing");
              }

              if (event.data === window.YT.PlayerState.PAUSED) {
                console.log("YOUTUBE PAUSED");
                callbackRef.current?.("paused");
              }
            },

            onError: (event) => {
              console.error("YouTube Player Error:", event.data);
            },
          },
        });
      };

      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        const oldCallback = window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady = () => {
          oldCallback?.();
          createPlayer();
        };

        const existingScript = document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]',
        );

        if (!existingScript) {
          const script = document.createElement("script");

          script.src = "https://www.youtube.com/iframe_api";

          script.async = true;

          document.body.appendChild(script);
        }
      }

      return () => {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }

        setReady(false);
      };
    }, [videoId, canControl]);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (!playerRef.current) return;

        playerRef.current.playVideo();
      },

      pause: () => {
        if (!playerRef.current) return;

        playerRef.current.pauseVideo();
      },

      seek: (time) => {
        const player = playerRef.current;

        if (!player) return;

        if (typeof player.seekTo !== "function") {
          console.log("YouTube player is not ready for seek");
          return;
        }

        player.seekTo(Number(time) || 0, true);
      },

      getCurrentTime: () => {
        if (!playerRef.current) return 0;

        return playerRef.current.getCurrentTime?.() || 0;
      },
    }));

    if (!videoId) {
      return (
        <div className="w-full aspect-video bg-black rounded-2xl flex items-center justify-center">
          <p className="text-white text-sm sm:text-base">
            Enter a YouTube video URL
          </p>
        </div>
      );
    }

    return (
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl">
        <div ref={containerRef} className="w-full h-full" />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white text-sm">Loading YouTube...</p>
          </div>
        )}
      </div>
    );
  },
);

export default YouTubePlayer;
