import { DefaultAction } from "./default-action";
//
export class RunAction extends DefaultAction {
    // constructor(public plugin: IdeaPlugin, private actionName: string) {
    //   super(plugin, actionName)
    // }
    actionId() {
        return "Run";
    }
}
