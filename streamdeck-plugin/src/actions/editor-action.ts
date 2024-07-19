import {
  WillAppearEvent,
  SDOnActionEvent,
} from 'streamdeck-typescript';
import {DefaultAction} from "./default-action";


export class EditorAction extends DefaultAction<EditorAction> {

  @SDOnActionEvent('willAppear')
  public onWillAppear({context}: WillAppearEvent): void {
    this.context = context;

    let {host, password, port} = this.getConnInfo();

    // WebSocket客户端代码
    const socket: WebSocket = new WebSocket(`ws://${host}:${port}`);
    socket.onopen = (): void => {
      console.log("WebSocket连接已建立");
    };
    socket.onmessage = (event: MessageEvent): void => {
      console.log("接收到消息：" + event.data);
      this.plugin.setTitle(event.data, this.context);
    };
  }

  actionId(): string {
    return "Editor.Selected.Transform";
  }

}
