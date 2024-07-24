import { DefaultAction } from "./default-action";
export class ShowProjectStructureAction extends DefaultAction {
    actionId() {
        return "ShowProjectStructureSettings";
    }
    actionTitle() {
        return "Project\nStructure";
    }
}
