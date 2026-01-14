const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Proxy for the SoundCloud Website (The "Window")
app.use('/stream', createProxyMiddleware({
    target: 'https://soundcloud.com',
    changeOrigin: true,
    autoRewrite: true,
    followRedirects: true,
    cookieDomainRewrite: "localhost", // Allows cookies to work on your local proxy
    onProxyMsg: (proxyRes, req, res) => {
        // Remove security headers that might block the proxy from loading in frames/tabs
        delete proxyRes.headers['content-security-policy'];
        delete proxyRes.headers['x-frame-options'];
    }
}));

// 2. Proxy for APIs
const apiProxy = (target) => createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\/sc\/(v1|v2)/, ''),
});

app.use('/sc/v1', apiProxy('https://api.soundcloud.com'));
app.use('/sc/v2', apiProxy('https://api-v2.soundcloud.com'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
