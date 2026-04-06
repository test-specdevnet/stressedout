export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                grotesk: ["Anton", "sans-serif"],
                condiment: ["Condiment", "cursive"],
            },
            colors: {
                cream: "#EFF4FF",
                neon: "#6FFF00",
            },
            boxShadow: {
                "glass-soft": "0 24px 80px rgba(1, 8, 40, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -20px 36px rgba(255, 255, 255, 0.02)",
            },
            letterSpacing: {
                chrome: "0.18em",
            },
        },
    },
    plugins: [],
};
