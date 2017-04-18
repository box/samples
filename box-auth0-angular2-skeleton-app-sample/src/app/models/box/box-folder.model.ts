import { BoxItem } from "./box-item.model";
import { BoxItemCollection } from "./box-item-collection.model";

export class BoxFolder extends BoxItem {    
    item_collection?: BoxItemCollection;
}