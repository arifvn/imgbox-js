declare const URL: {
    baseURL: string;
    root: string;
    token: string;
    upload: string;
    gallery_edit: string;
    images: string;
    gallery: string;
    delete_images: string;
};
declare const default_token = "0896d8a6ccfb6f5d6ccf102262720e7f";
declare const REQUEST: import("axios").AxiosInstance;
declare const DisableLogger: () => void;
export { REQUEST, DisableLogger, URL, default_token };
