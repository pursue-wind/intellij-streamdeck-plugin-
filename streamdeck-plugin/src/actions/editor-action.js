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
import { StreamDeckAction, SDOnActionEvent, } from 'streamdeck-typescript';
import { WsServer } from "../ws-server";
let ClipboardDisplayAction = (() => {
    let _classSuper = StreamDeckAction;
    let _instanceExtraInitializers = [];
    let _onKeyUp_decorators;
    let _onWillAppear_decorators;
    let _onWillDisappear_decorators;
    return class ClipboardDisplayAction extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _onKeyUp_decorators = [SDOnActionEvent('keyUp')];
            _onWillAppear_decorators = [SDOnActionEvent('willAppear')];
            _onWillDisappear_decorators = [SDOnActionEvent('willDisappear')];
            __esDecorate(this, null, _onKeyUp_decorators, { kind: "method", name: "onKeyUp", static: false, private: false, access: { has: obj => "onKeyUp" in obj, get: obj => obj.onKeyUp }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _onWillAppear_decorators, { kind: "method", name: "onWillAppear", static: false, private: false, access: { has: obj => "onWillAppear" in obj, get: obj => obj.onWillAppear }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _onWillDisappear_decorators, { kind: "method", name: "onWillDisappear", static: false, private: false, access: { has: obj => "onWillDisappear" in obj, get: obj => obj.onWillDisappear }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        plugin = __runInitializers(this, _instanceExtraInitializers);
        context;
        constructor(plugin, actionName) {
            super(plugin, actionName);
            this.plugin = plugin;
        }
        async onKeyUp({ context }) {
            this.plugin.setTitle("camelCaseContent", context);
        }
        onWillAppear({ context }) {
            this.context = context;
            // 创建一个WebSocket服务器实例，监听 21421 端口
            let ws = new WsServer(21421, (msg) => {
                this.plugin.setTitle(msg, this.context);
            });
            ws.send();
        }
        onWillDisappear() {
        }
        toCamelCase(text) {
            return text
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
        }
    };
})();
export { ClipboardDisplayAction };
