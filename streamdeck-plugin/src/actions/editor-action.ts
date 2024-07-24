import {
  KeyUpEvent,
  SDOnActionEvent,
  StreamDeckAction,
  WillAppearEvent,StreamDeckHandlerBase,
  WillDisappearEvent
} from 'streamdeck-typescript';
import {ActionSettingsInterface, GlobalSettingsInterface} from "../utils/interface";
import {fetchJetBrainsIDE, isGlobalSettingsSet} from "../utils";
import {IdeaPlugin} from "../idea-plugin";

export abstract class EditorAction<T extends IdeaPlugin, R> extends StreamDeckAction<T, R> {
  protected context: string;
  protected socket: WebSocket;

  protected constructor(public plugin: T, actionName: string) {
    super(plugin, actionName);
    console.log(`Initialized ${actionName}`);
  }

  @SDOnActionEvent('willAppear')
  public onWillAppear({context}: WillAppearEvent): void {
    this.context = context;

    let {host, password, port} = this.getConnInfo();
    console.log(`host: ${host}, port: ${port}`);
    this.wsConn(host, "21421");
  }

  private wsConn(host: string, port: string) {
    // WebSocket客户端代码
    const action = this.actionId();
    console.log("WebSocket action" + action)
    this.socket = new WebSocket(`ws://${host}:${port}?name=${action}`);
    this.socket.onopen = (event: Event): void => {
      console.log("WebSocket连接已建立");
      console.log(event);
    };
    this.socket.onmessage = (event: MessageEvent): void => {
      console.log("接收到消息：" + this.actionId() + event.data);
      console.log(this.plugin)

       this.plugin.setTitle(event.data, this.context);
    };

    this.socket.onerror = (event: Event): void => {
      console.log("WebSocket连接出错，等待5秒后重新连接");
      setTimeout(() => {
        this.wsConn(host, port);
      }, 5000);
    };

    this.socket.onclose = (event: CloseEvent): void => {
      console.log("WebSocket连接关闭");
    };
  }

  @SDOnActionEvent('willDisappear')
  onContextDisappear(event: WillDisappearEvent): void {
    console.log("willDisappear");
    console.log(event);
    this.socket.close()
  }

  @SDOnActionEvent('keyUp')
  public async onKeyUp({payload}: KeyUpEvent<ActionSettingsInterface>): Promise<void> {
    console.log('onKeyUp() actionId=' + this.actionId())
    let action = payload.settings.action // current button's customized action ID
    let runConfig = payload.settings.runConfig
    console.log('onKeyUp() customAction=' + action)

    if (action == null || action === '') {
      action = this.actionId()
    }

    if (action == null || action === '') {
      if (this.context != null) {
        this.plugin.showAlert(this.context);
      }

      return
    }
    let {host, password, port} = this.getConnInfo();

    // Handle customized run/debug configuration
    let endpoint = `/api/action/${action}`;

    if (runConfig == null || runConfig === undefined) {
      runConfig = ''
    }

    console.log('runConfig=' + runConfig)
    if (runConfig !== '') {
      endpoint += '?name=' + encodeURIComponent(runConfig)
    }

    await fetchJetBrainsIDE({
      endpoint: endpoint,
      port: port,
      password: password,
      accessToken: '',
      host: host,
      method: 'GET',
    })

  }

  protected getConnInfo() {
    const globalSettings = this.plugin.settingsManager.getGlobalSettings<GlobalSettingsInterface>()
    let host: string = '127.0.0.1'
    let password: string = ''
    let port: string = ''

    if (isGlobalSettingsSet(globalSettings)) {
      host = globalSettings.host
    }

    if (host === undefined || host === '') {
      host = '127.0.0.1'
    }

    if (globalSettings !== undefined) {
      const settings: GlobalSettingsInterface = globalSettings as GlobalSettingsInterface
      password = settings.password
      port = settings.port
    }

    if (port === undefined || port === '') {
      port = '21420'
    }

    return {host, password, port};
  }

  abstract actionId(): string
}

export class EditorCamelCaseAction extends EditorAction<IdeaPlugin, EditorCamelCaseAction> {
  constructor(public plugin: IdeaPlugin, actionName: string) {
    super(plugin, actionName);
    console.log(`Initialized ${actionName}`);
  }

  actionId(): string {
    return "com.jetbrains.idea.action.editor.cc";
  }
}

export class EditorUnderscoreAction extends EditorAction<IdeaPlugin, EditorUnderscoreAction> {
  constructor(public plugin: IdeaPlugin, actionName: string) {
    super(plugin, actionName);
    console.log(`Initialized ${actionName}`);
  }

  actionId(): string {
    return "com.jetbrains.idea.action.editor.ul";
  }
}
