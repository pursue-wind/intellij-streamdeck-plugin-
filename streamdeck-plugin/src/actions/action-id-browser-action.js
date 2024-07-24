import { DefaultAction } from "./default-action";
export class ActionIdBrowserAction extends DefaultAction {
    actionId() {
        return "streamdeck.show.action.browser";
    }
    actionTitle() {
        return "Action\n Browser";
    }
}
