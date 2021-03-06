const {override} = require('customize-cra');
const cspHtmlWebpackPlugin = require("csp-html-webpack-plugin");

const cspConfigPolicy = {
    "default-src": "'self'  data: ",
    "frame-src": "http://192.168.1.65:24491",
    "img-src": "'self' data: ",
    "connect-src": "wss://we.blacknosaur.com https://we.blacknosaur.com https://opendata.aemet.es/"
};

function addCspHtmlWebpackPlugin(config) {
    if(process.env.NODE_ENV === 'production') {
        config.plugins.push(new cspHtmlWebpackPlugin(cspConfigPolicy));
    }

    return config;
}

module.exports = {
    webpack: override(addCspHtmlWebpackPlugin),
};