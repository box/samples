import { BoxItem } from "./box-item.model";

export class BoxFile extends BoxItem {
    sha1: string;
    trashed_at?: Date;
    purged_at?: Date;
    created_at?: Date;
    content_modified_at?: Date;
    version_number: string;
    comment_count?: Number;
    lock?: Object;
    expiring_embed_link?: Object;
    watermark_info?: Object;
}