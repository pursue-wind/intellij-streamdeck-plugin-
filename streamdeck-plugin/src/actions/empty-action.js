import { DefaultAction } from './default-action';
export class EmptyAction extends DefaultAction {
    actionId() {
        return "";
    }
}
