"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGalleryEditResponse = exports.postImage = exports.urlToBuffer = exports.createFormData = exports.getToken = exports.setHeadersConfig = exports.getAuthCsrf = exports.getCsrfAndCookie = void 0;
const request_1 = require("./request");
const form_data_1 = __importDefault(require("form-data"));
const getCsrfAndCookie = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, headers } = yield request_1.REQUEST.get(request_1.URL.root);
        const csrf_token = data.split('<input name="authenticity_token" type="hidden" value=')[1].split(' ')[0].replace(/"/g, '');
        const cookie = headers['set-cookie'][1].split(';')[0];
        return { csrf_token, cookie };
    }
    catch (error) {
        throw new Error('Failed to get CSRF-Token and Cookie. Try Again');
    }
});
exports.getCsrfAndCookie = getCsrfAndCookie;
const getAuthCsrf = (authCookie, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const csrfConfig = setHeadersConfig([
            { key: 'sec-ch-ua', value: '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"' },
            { key: 'Cookie', value: authCookie },
            { key: 'If-None-Match', value: token },
            { key: 'sec-ch-ua-mobile', value: '?0' },
            { key: 'Accept', value: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' },
            { key: 'sec-ch-ua-platform', value: '"macOS"' },
            { key: 'Origin', value: request_1.URL.baseURL },
            { key: 'Sec-Fetch-Site', value: 'same-origin' },
            { key: 'Sec-Fetch-Mode', value: 'cors' },
            { key: 'Sec-Fetch-Dest', value: 'empty' },
            { key: 'Referer', value: request_1.URL.baseURL + '/' },
            { key: 'Accept-Language', value: 'en-US,en;q=0.9,id;q=0.8' },
            { key: 'Cookie', value: authCookie }
        ]);
        const { data } = yield request_1.REQUEST.get('images#/all/1', csrfConfig);
        let csrf_token = '';
        let cookie = '';
        const regex = /<meta content="(.*?)" name="csrf-token"/;
        const match = data.match(regex);
        csrf_token = match[1];
        return { csrf_token, cookie };
    }
    catch (error) {
        throw new Error('Failed to get CSRF-Token and Cookie. Try Again');
    }
});
exports.getAuthCsrf = getAuthCsrf;
const setHeadersConfig = (configs) => {
    const config = {
        headers: {
            DNT: 1,
            Origin: request_1.URL.root,
            Referer: request_1.URL.root + '/',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            Connection: 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Sec-GPC': 1,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    };
    configs.forEach((val, _) => {
        config.headers[val.key] = val.value;
    });
    return config;
};
exports.setHeadersConfig = setHeadersConfig;
const getToken = (album_config, auth_cookie, default_token) => __awaiter(void 0, void 0, void 0, function* () {
    let csrfCookie = null;
    if (auth_cookie) {
        csrfCookie = yield getAuthCsrf(auth_cookie, default_token);
    }
    else {
        csrfCookie = yield getCsrfAndCookie();
    }
    const config = setHeadersConfig([
        { key: 'X-CSRF-Token', value: csrfCookie.csrf_token },
        { key: 'Cookie', value: auth_cookie ? auth_cookie : csrfCookie.cookie }
    ]);
    try {
        let data = null;
        if (album_config.gallery) {
            const response = yield request_1.REQUEST.post(request_1.URL.token, album_config, config);
            data = response.data;
        }
        else {
            const response = yield request_1.REQUEST.post(request_1.URL.token, null, config);
            data = response.data;
        }
        return {
            token_id: data.token_id,
            token_secret: data.token_secret,
            gallery_id: data.gallery_id ? data.gallery_id : 'null',
            gallery_secret: data.gallery_secret ? data.gallery_secret : 'null'
        };
    }
    catch (error) {
        throw new Error('Failed to get Token. Try Again');
    }
});
exports.getToken = getToken;
const createFormData = (token, contentType, thumbnail_size, comments_enabled) => {
    const form = new form_data_1.default();
    form.append('token_id', token.token_id);
    form.append('token_secret', token.token_secret);
    form.append('gallery_id', token.gallery_id);
    form.append('gallery_secret', token.gallery_secret);
    form.append('content_type', contentType === 'safe' ? 1 : 2);
    form.append('thumbnail_size', thumbnail_size);
    form.append('comments_enabled', comments_enabled ? 1 : 0);
    return form;
};
exports.createFormData = createFormData;
const urlToBuffer = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield request_1.REQUEST.get(url, { responseType: 'arraybuffer' });
        return data;
    }
    catch (error) {
        throw new Error(`Invalid URL Path Error ${url}`);
    }
});
exports.urlToBuffer = urlToBuffer;
const postImage = (url, form, filename) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const buffer = typeof url === 'string' ? yield urlToBuffer(url) : url;
        form.append('files[]', buffer, filename ? filename + '.jpg' : new Date().getTime().toString() + '.jpg');
        const config = setHeadersConfig([
            {
                key: Object.keys(form.getHeaders())[0],
                value: Object.values(form.getHeaders())[0]
            }
        ]);
        const { data } = yield request_1.REQUEST.post(request_1.URL.upload, form, config);
        return data.files;
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.postImage = postImage;
const addGalleryEditResponse = (result, token) => {
    if (token.gallery_id !== 'null') {
        result.data['gallery_edit'] = `${request_1.URL.baseURL}/${request_1.URL.gallery_edit}/${token.gallery_id}/${token.gallery_secret}`;
    }
};
exports.addGalleryEditResponse = addGalleryEditResponse;
//# sourceMappingURL=helper.js.map