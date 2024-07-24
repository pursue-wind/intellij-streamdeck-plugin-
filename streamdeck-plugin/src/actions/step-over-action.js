import { DefaultAction } from "./default-action";
export class StepOverAction extends DefaultAction {
    actionId() {
        return "StepOver";
    }
    actionTitle() {
        return "Step\nOver";
    }
}
