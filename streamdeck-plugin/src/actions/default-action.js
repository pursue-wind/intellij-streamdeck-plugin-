var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { SDOnActionEvent, StreamDeckAction } from 'streamdeck-typescript';
import { fetchJetBrainsIDE, isGlobalSettingsSet } from "../utils";
let DefaultAction = (() => {
    let _classSuper = StreamDeckAction;
    let _instanceExtraInitializers = [];
    let _onKeyUp_decorators;
    let _onContextAppear_decorators;
    let _onContextDisappear_decorators;
    let _onSendToPluginEvent_decorators;
    let _onSettings_decorators;
    let _onReceiveGlobalSettings_decorators;
    return class DefaultAction extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _onKeyUp_decorators = [SDOnActionEvent('keyUp')];
            _onContextAppear_decorators = [SDOnActionEvent('willAppear')];
            _onContextDisappear_decorators = [SDOnActionEvent('willDisappear')];
            _onSendToPluginEvent_decorators = [SDOnActionEvent('sendToPlugin')];
            _onSettings_decorators = [SDOnActionEvent('didReceiveSettings')];
            _onReceiveGlobalSettings_decorators = [SDOnActionEvent('didReceiveGlobalSettings')];
            __esDecorate(this, null, _onKeyUp_decorators, { kind: "method", name: "onKeyUp", static: false, private: false, access: { has: obj => "onKeyUp" in obj, get: obj => obj.onKeyUp }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _onContextAppear_decorators, { kind: "method", name: "onContextAppear", static: false, private: false, access: { has: obj => "onContextAppear" in obj, get: obj => obj.onContextAppear }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _onContextDisappear_decorators, { kind: "method", name: "onContextDisappear", static: false, private: false, access: { has: obj => "onContextDisappear" in obj, get: obj => obj.onContextDisappear }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _onSendToPluginEvent_decorators, { kind: "method", name: "onSendToPluginEvent", static: false, private: false, access: { has: obj => "onSendToPluginEvent" in obj, get: obj => obj.onSendToPluginEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _onSettings_decorators, { kind: "method", name: "onSettings", static: false, private: false, access: { has: obj => "onSettings" in obj, get: obj => obj.onSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _onReceiveGlobalSettings_decorators, { kind: "method", name: "onReceiveGlobalSettings", static: false, private: false, access: { has: obj => "onReceiveGlobalSettings" in obj, get: obj => obj.onReceiveGlobalSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        plugin = __runInitializers(this, _instanceExtraInitializers);
        context;
        customTitle;
        showTitle;
        constructor(plugin, actionName) {
            super(plugin, actionName);
            this.plugin = plugin;
            console.log(`Initialized ${actionName}`);
        }
        /**
         * Allow customize button title, default to action id.
         */
        actionTitle() {
            return this.actionId();
        }
        async onKeyUp({ payload }) {
            console.log('onKeyUp() actionId=' + this.actionId());
            let action = payload.settings.action; // current button's customized action ID
            let runConfig = payload.settings.runConfig;
            console.log('onKeyUp() customAction=' + action);
            if (action == null || action === '') {
                action = this.actionId();
            }
            if (action == null || action === '') {
                if (this.context != null) {
                    this.plugin.showAlert(this.context);
                }
                return;
            }
            const globalSettings = this.plugin.settingsManager.getGlobalSettings();
            let host = '127.0.0.1';
            let password = '';
            let port = '';
            if (isGlobalSettingsSet(globalSettings)) {
                host = globalSettings.host;
            }
            if (host === undefined || host === '') {
                host = '127.0.0.1';
            }
            if (globalSettings !== undefined) {
                const settings = globalSettings;
                password = settings.password;
                port = settings.port;
            }
            // Handle customized run/debug configuration
            let endpoint = `/api/action/${action}`;
            if (runConfig == null || runConfig === undefined) {
                runConfig = '';
            }
            console.log('runConfig=' + runConfig);
            if (runConfig !== '') {
                endpoint += '?name=' + encodeURIComponent(runConfig);
            }
            await fetchJetBrainsIDE({
                endpoint: endpoint,
                port: port,
                password: password,
                accessToken: '',
                host: host,
                method: 'GET',
            });
        }
        onContextAppear({ context, payload }) {
            console.log('onContextAppear() actionId=' + this.actionId() + " context=" + context);
            this.context = context; // Save for later update title
            this.readCustomActionTitle(payload.settings);
            this.toggleTitleVisible();
        }
        readCustomActionTitle(settings) {
            let actionTitle = settings.action;
            if (actionTitle == null || actionTitle === '') {
                actionTitle = this.actionTitle();
            }
            if (actionTitle == null || actionTitle === '') {
                actionTitle = this.actionId();
            }
            this.customTitle = actionTitle;
        }
        toggleTitleVisible() {
            if (this.showTitle !== "on" && this.context != undefined) {
                this.plugin.setTitle("", this.context);
            }
            else if (this.context != undefined) {
                if (this.customTitle == null || this.customTitle === '') {
                    this.plugin.setTitle("", this.context);
                    return;
                }
                else {
                    this.plugin.setTitle(this.customTitle, this.context);
                }
            }
        }
        onContextDisappear(event) {
        }
        // TODO Not work?!
        onSendToPluginEvent({ context, payload }) {
            console.log('onSendToPluginEvent() payload.showTitle=' + payload.showTitle);
        }
        /**
         * Update current button's title based on the customized action id (if any)
         * @param context
         * @param settings
         * @private
         */
        onSettings({ context, payload: { settings } }) {
            console.log('onSettings() settings.action=' + settings.action);
            console.log('onSettings() settings.showTitle=' + settings.showTitle);
            this.showTitle = settings.showTitle;
            this.readCustomActionTitle(settings);
            this.toggleTitleVisible();
        }
        /**
         * Once triggered the title visible checkbox in the Property Inspection page, this event will be fired again but
         * no context provided.
         * @param settings
         * @private
         */
        onReceiveGlobalSettings({ payload: { settings } }) {
            // this.plugin.setTitle(settings.count.toString() ?? 0, context);
            // console.log('onReceiveGlobalSettings() payload.showTitle=' + settings.showTitle)
            // this.showTitle = settings.showTitle;
            // console.log('onReceiveGlobalSettings() this.context=' + this.context)
            // this.toggleTitleVisible();
        }
    };
})();
export { DefaultAction };
