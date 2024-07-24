import { DefaultAction } from './default-action';
export class DebugAction extends DefaultAction {
    // constructor(public plugin: IdeaPlugin, actionName: string) {
    //     super(plugin, actionName)
    // }
    actionId() {
        return "Debug";
    }
}
