document.addEventListener("DOMContentLoaded", function() {

    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    const canvas = document.querySelector("#hero-canvas");
    const context = canvas.getContext("2d");

    canvas.width = 1920;
    canvas.height = 1080;
    const frameCount = 240;
    const currentFrame = index => `assets/${(index + 1).toString().padStart(4, '0')}.png`;
    const images = [];
    const sequence = {
        frame: 0
    };

    let loadedImagesCount = 0;
    console.log("Starting to preload images...");

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);

        img.onload = () => {
            loadedImagesCount++;

            if (loadedImagesCount === frameCount) {
                console.log("SUCCESS: All images have been preloaded. Initializing animation.");
                initializeApp();
            }
        };

        img.onerror = () => {
            console.error(`CRITICAL ERROR: Failed to load image at index ${i}. URL: ${img.src}. Animation will not start.`);
        };
    }

    function initializeApp() {
        render();

        const tl = gsap.timeline({
            onUpdate: render,
            scrollTrigger: {
                trigger: "#main",
                pin: true,
                scrub: 1.5,
                start: "top top",
                end: "+=8000",
            }
        });

        tl.to(sequence, {
            frame: frameCount - 1,
            snap: "frame",
            ease: "none",
            duration: 1
        });

        const totalFramesToAnimate = frameCount - 1;

        const heroTextH1 = document.querySelector(".hero-text h1");
        const originalText = heroTextH1.textContent;
        heroTextH1.textContent = "";

        const textAppearFrame = 1;
        const textFinishTypingFrame = 45;
        const textBlinkingStopsFrame = 60;
        const textFadeOutFrame = 80;

        const appearPosition = textAppearFrame / totalFramesToAnimate;
        const finishTypingPosition = textFinishTypingFrame / totalFramesToAnimate;
        const blinkingStopsPosition = textBlinkingStopsFrame / totalFramesToAnimate;
        const fadeOutPosition = textFadeOutFrame / totalFramesToAnimate;

        tl.call(() => {
            heroTextH1.style.opacity = 1;
            heroTextH1.classList.add('typing');
        }, [], appearPosition);

        tl.to(heroTextH1, {
            text: {
                value: originalText,
                ease: "none"
            },
            duration: finishTypingPosition - appearPosition
        }, appearPosition);

        tl.call(() => {
            heroTextH1.classList.remove('typing');
        }, [], blinkingStopsPosition);

        tl.to(heroTextH1, {
            opacity: 0,
            duration: 0.1
        }, fadeOutPosition);

        const paragraphFadeInFrame = 81;
        const paragraphFadeOutFrame = 120;

        const paragraphInPosition = paragraphFadeInFrame / totalFramesToAnimate;
        const paragraphOutPosition = paragraphFadeOutFrame / totalFramesToAnimate;

        tl.fromTo(".story-text", {
            opacity: 0,
            filter: "blur(10px)"
        }, {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.2
        }, paragraphInPosition);

        tl.to(".story-text", {
            opacity: 0,
            filter: "blur(10px)", 
            duration: 0.1
        }, paragraphOutPosition);

        const paragraph2FadeInFrame = 121;
        const paragraph2FadeOutFrame = 240; 
        const paragraph2InPosition = paragraph2FadeInFrame / totalFramesToAnimate;
        const paragraph2OutPosition = paragraph2FadeOutFrame / totalFramesToAnimate;

        tl.fromTo(".story-text2", {
            opacity: 0,
            filter: "blur(10px)"
        }, {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.2
        }, paragraph2InPosition);

        tl.to(".story-text2", {
            opacity: 0,
            filter: "blur(10px)",
            duration: 0.1
        }, paragraph2OutPosition); 
    }

    function render() {
        if (images[sequence.frame]) {
            scaleImage(images[sequence.frame], context);
        }
    }

    function scaleImage(img, ctx) {
        const canvas = ctx.canvas;
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }
});