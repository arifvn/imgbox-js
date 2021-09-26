export interface ICsrfCookie {
    csrf_token: string;
    cookie: string;
}

export interface IToken {
    token_id: number;
    token_secret: string;
    gallery_id?: string;
    gallery_secret?: string;
}

export interface IResponseObject {
    ok: boolean;
    message: string;
    data: any;
}

export interface WithName {
    source: string;
    filename: string;
}

// * PARAM 1 ----------------------------------------------------

export type Images =
    | string
    | string[]
    | WithName
    | WithName[];

// * PARAM 2 ----------------------------------------------------

export type ContentType = 'safe' | 'adult';

export type ThumbnailSize =
    | '100c'
    | '150c'
    | '200c'
    | '250c'
    | '300c'
    | '350c'
    | '500c'
    | '800c'
    | '100r'
    | '150r'
    | '200r'
    | '250r'
    | '300r'
    | '350r'
    | '500r'
    | '800r';

export type CommentEnabled = false | true;

export interface IAlbumConfig {
    gallery: boolean;
    gallery_title: string;
    comments_enabled: CommentEnabled;
}

export type LoggerEnabled = true | false;

export type ImageScope = 'all' | 'unbound';

export type OrderBy = 'updated' | 'created' | 'title';