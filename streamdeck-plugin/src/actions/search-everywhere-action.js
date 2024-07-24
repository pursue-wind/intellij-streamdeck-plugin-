import { DefaultAction } from "./default-action";
export class SearchEverywhereAction extends DefaultAction {
    actionId() {
        return "SearchEverywhere";
    }
    actionTitle() {
        return "Search\nEverywhere";
    }
}
