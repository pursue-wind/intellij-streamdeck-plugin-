import { DefaultAction } from "./default-action";
export class NewProjectAction extends DefaultAction {
    // constructor(public plugin: IdeaPlugin, private actionName: string) {
    //   super(plugin, actionName)
    // }
    actionId() {
        return "NewProject";
    }
    actionTitle() {
        return "New\nProject";
    }
}
