/// <reference types="node" />
import { ICsrfCookie, IAlbumConfig, IToken, ThumbnailSize, ContentType, CommentEnabled, IResponseObject } from './interfaces';
import FormData from 'form-data';
declare const getCsrfAndCookie: () => Promise<ICsrfCookie>;
declare const getAuthCsrf: (authCookie: string, token: string) => Promise<ICsrfCookie>;
declare const setHeadersConfig: (configs: {
    key: string;
    value: string;
}[]) => object;
declare const getToken: (album_config: IAlbumConfig, auth_cookie?: string | undefined, default_token?: string | undefined) => Promise<IToken>;
declare const createFormData: (token: IToken, contentType: ContentType, thumbnail_size: ThumbnailSize, comments_enabled: CommentEnabled) => FormData;
declare const urlToBuffer: (url: string) => Promise<Buffer>;
declare const postImage: (url: string | Buffer, form: FormData, filename?: string | undefined) => Promise<object>;
declare const addGalleryEditResponse: (result: IResponseObject, token: IToken) => void;
export { getCsrfAndCookie, getAuthCsrf, setHeadersConfig, getToken, createFormData, urlToBuffer, postImage, addGalleryEditResponse };
