import {
    KeyUpEvent,
    StreamDeckAction,
    WillAppearEvent,
    WillDisappearEvent,
    SDOnActionEvent,
} from 'streamdeck-typescript';
import {IdeaPlugin} from '../idea-plugin';


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
        // WebSocket客户端代码
        const socket: WebSocket = new WebSocket("ws://127.0.0.1:21421");
        socket.onopen = (): void => {
            console.log("WebSocket连接已建立");
        };
        socket.onmessage = (event: MessageEvent): void => {
            console.log("接收到消息：" + event.data);
            this.plugin.setTitle(event.data, this.context);
        };
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
