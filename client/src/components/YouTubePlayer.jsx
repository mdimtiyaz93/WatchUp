import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const YoutubePlayer = forwardRef(
  ({ videoId, onStateChange, canControl }, ref) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);

    const callbackRef = useRef(onStateChange);
    const canControlRef = useRef(canControl);
    const videoIdRef = useRef(videoId);
    const lastStateRef = useRef(null);

    useEffect(() => {
      callbackRef.current = onStateChange;
    }, [onStateChange]);

    useEffect(() => {
      canControlRef.current = canControl;
    }, [canControl]);

    useEffect(() => {
      videoIdRef.current = videoId;
    }, [videoId]);

    useImperativeHandle(ref, () => ({
      play: () => {
        playerRef.current?.playVideo?.();
      },

      pause: () => {
        playerRef.current?.pauseVideo?.();
      },

      seek: (time) => {
        if (!playerRef.current) return;

        playerRef.current.seekTo(Number(time) || 0, true);
      },

      getCurrentTime: () => {
        return playerRef.current?.getCurrentTime?.() || 0;
      },
    }));

    useEffect(() => {
      if (!videoId) return;

      let destroyed = false;

      const createPlayer = () => {
        if (destroyed) return;
        if (!containerRef.current) return;
        if (!window.YT?.Player) return;

        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }

        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,

          playerVars: {
            autoplay: 0,
            controls: canControlRef.current ? 1 : 0,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            playsinline: 1,
            origin: window.location.origin,
          },

          events: {
            onReady: () => {
              if (destroyed) return;

              console.log("YouTube Player Ready:", videoId);
            },

            onStateChange: (event) => {
              if (destroyed) return;

              if (event.data === window.YT.PlayerState.PLAYING) {
                lastStateRef.current = "playing";

                callbackRef.current?.("playing");
              }

              if (event.data === window.YT.PlayerState.PAUSED) {
                lastStateRef.current = "paused";

                callbackRef.current?.("paused");
              }
            },

            onError: (event) => {
              console.error("YouTube Player Error:", event.data);
            },
          },
        });
      };

      if (window.YT?.Player) {
        createPlayer();
      } else {
        const existingScript = document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]',
        );

        const oldCallback = window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady = () => {
          oldCallback?.();

          if (!destroyed) {
            createPlayer();
          }
        };

        if (!existingScript) {
          const script = document.createElement("script");

          script.src = "https://www.youtube.com/iframe_api";

          script.async = true;

          document.body.appendChild(script);
        }
      }

      return () => {
        destroyed = true;

        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      };
    }, [videoId]);

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState !== "visible") {
          return;
        }

        const player = playerRef.current;

        if (!player) return;

        setTimeout(() => {
          if (!playerRef.current) return;

          const state = playerRef.current.getPlayerState?.();

          if (state === window.YT?.PlayerState?.PLAYING) {
            lastStateRef.current = "playing";
            callbackRef.current?.("playing");
          }

          if (state === window.YT?.PlayerState?.PAUSED) {
            lastStateRef.current = "paused";
            callbackRef.current?.("paused");
          }
        }, 300);
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    }, []);

    if (!videoId) {
      return (
        <div className="w-full max-w-3xl mx-auto aspect-video bg-black rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden">
          <p className="text-white text-xs sm:text-sm md:text-base text-center px-4">
            Enter a YouTube video URL
          </p>
        </div>
      );
    }

    return (
      <div className="w-full max-w-3xl mx-auto aspect-video bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  },
);

YoutubePlayer.displayName = "YoutubePlayer";

export default YoutubePlayer;
