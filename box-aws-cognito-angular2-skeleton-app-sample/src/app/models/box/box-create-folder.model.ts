import { BoxItem } from "./box-item.model";

export class BoxCreateFolder {
    constructor(public parent: BoxItem, public name: string) {
    }
}