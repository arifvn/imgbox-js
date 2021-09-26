"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default_token = exports.URL = exports.DisableLogger = exports.REQUEST = void 0;
const axios_1 = __importDefault(require("axios"));
const util_1 = __importDefault(require("util"));
const URL = {
    baseURL: 'https://imgbox.com',
    root: '/',
    token: 'ajax/token/generate',
    upload: 'upload/process',
    gallery_edit: 'gallery/edit',
    images: 'api/v1/images',
    gallery: 'api/v1/galleries',
    delete_images: 'api/v1/images/delete'
};
exports.URL = URL;
const default_token = '0896d8a6ccfb6f5d6ccf102262720e7f';
exports.default_token = default_token;
const REQUEST = axios_1.default.create({ baseURL: URL.baseURL });
exports.REQUEST = REQUEST;
const interceptors = REQUEST.interceptors.request.use(config => {
    var _a;
    try {
        const filename = config.data && config.method == 'post' && config.url === 'upload/process'
            ? config.data._streams.toString().split('filename="')[1].split('"')[0] : '';
        console.log(util_1.default.inspect(`${(_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()} request to ` +
            `${config.baseURL}${config.url !== '/' ? '/' : ''}${config.url}` +
            `${filename !== '' ? ' with ' + filename : ''}`, false, null, true));
        return config;
    }
    catch (error) {
        return config;
    }
});
const DisableLogger = () => {
    REQUEST.interceptors.request.eject(interceptors);
};
exports.DisableLogger = DisableLogger;
//# sourceMappingURL=request.js.map