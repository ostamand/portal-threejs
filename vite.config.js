import glsl from "vite-plugin-glsl";

export default {
    base: "/portal-threejs/",
    publicDir: "./static/",
    plugins: [glsl()],
};
