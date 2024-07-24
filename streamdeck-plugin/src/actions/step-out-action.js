import { DefaultAction } from "./default-action";
export class StepOutAction extends DefaultAction {
    actionId() {
        return "StepOut";
    }
    actionTitle() {
        return "Step\nOut";
    }
}
