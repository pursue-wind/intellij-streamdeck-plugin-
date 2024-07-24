import { DefaultAction } from "./default-action";
export class GitPullAction extends DefaultAction {
    // constructor(public plugin: IdeaPlugin, private actionName: string) {
    //   super(plugin, actionName)
    // }
    actionId() {
        return "Vcs.UpdateProject";
    }
    actionTitle() {
        return "VCS\nUpdate";
    }
}
