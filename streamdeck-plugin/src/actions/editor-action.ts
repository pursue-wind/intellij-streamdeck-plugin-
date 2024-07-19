import {
  KeyUpEvent,
  SDOnActionEvent,
  StreamDeckAction,
  WillAppearEvent,
} from 'streamdeck-typescript';
import {ActionSettingsInterface, GlobalSettingsInterface} from "../utils/interface";
import {fetchJetBrainsIDE, isGlobalSettingsSet} from "../utils";
import {EditorPlugin} from "../idea-plugin";


export class EditorAction extends StreamDeckAction<EditorPlugin, EditorAction> {
  protected customTitle: string;
  protected context: string;

  public constructor(public plugin: EditorPlugin, actionName: string) {
    super(plugin, actionName);
    console.log(`Initialized ${actionName}`);
  }

  @SDOnActionEvent('willAppear')
  public onWillAppear({context}: WillAppearEvent): void {
    this.context = context;

    let {host, password, port} = this.getConnInfo();
    console.log(`host: ${host}, port: ${port}`);
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

  actionId(): string {
    return "Editor.Selected.Transform";
  }

}
