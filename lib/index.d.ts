import { ThumbnailSize, ContentType, CommentEnabled, LoggerEnabled, Images, IResponseObject, ImageScope, OrderBy } from './interfaces';
declare const imgbox: {
    (images: Images, options?: {
        auth_cookie?: string | undefined;
        album_title?: string | undefined;
        content_type?: ContentType | undefined;
        thumbnail_size?: ThumbnailSize | undefined;
        comments_enabled?: CommentEnabled | undefined;
        logger?: LoggerEnabled | undefined;
    } | undefined): Promise<IResponseObject>;
    deleteGallery(galleryEditUrl: string, options?: {
        auth_cookie?: string | undefined;
        logger?: LoggerEnabled | undefined;
    } | undefined): Promise<IResponseObject>;
    updateComment(galleryEditUrl: string, options?: {
        isEnabled?: boolean | undefined;
        logger?: LoggerEnabled | undefined;
    } | undefined): Promise<IResponseObject>;
    getImages(options: {
        auth_cookie: string;
        page?: number;
        scope?: ImageScope;
        logger?: LoggerEnabled;
    }): Promise<IResponseObject>;
    getGalleries(options: {
        auth_cookie: string;
        page?: number;
        order_by?: OrderBy;
        logger?: LoggerEnabled;
    }): Promise<IResponseObject>;
    deleteImages(images_url: string[], options: {
        auth_cookie: string;
        logger?: LoggerEnabled;
    }): Promise<IResponseObject>;
};
export { imgbox };
