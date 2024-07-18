import {
    KeyUpEvent,
    StreamDeckAction,
    WillAppearEvent,
    WillDisappearEvent,
    SDOnActionEvent,
} from 'streamdeck-typescript';
import {IdeaPlugin} from '../idea-plugin';
import {WsServer} from "../ws-server";


export class ClipboardDisplayAction extends StreamDeckAction<IdeaPlugin, {}> {
    private context: string;

    constructor(public plugin: IdeaPlugin, actionName: string) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('keyUp')
    public async onKeyUp({context}: KeyUpEvent<{}>): Promise<void> {
        this.plugin.setTitle("camelCaseContent", context);
    }

    @SDOnActionEvent('willAppear')
    public onWillAppear({context}: WillAppearEvent): void {
        this.context = context;

        // 创建一个WebSocket服务器实例，监听 21421 端口
        let ws = new WsServer(21421, (msg: string) => {
            this.plugin.setTitle(msg, this.context);
        })

        ws.send()
    }

    @SDOnActionEvent('willDisappear')
    public onWillDisappear(): void {

    }


    private toCamelCase(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
    }

}
