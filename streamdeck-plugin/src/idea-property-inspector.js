/*
 * Copyright 2000-2024 JetBrains s.r.o. and contributors. Use of this source code is governed by the Apache 2.0 license.
 */
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
import { SDOnPiEvent, StreamDeckPropertyInspectorHandler, } from 'streamdeck-typescript';
import { isGlobalSettingsSet } from './utils';
const pluginName = 'com.jetbrains.idea';
/**
 * Load and save settings.
 */
let IdeaPI = (() => {
    let _classSuper = StreamDeckPropertyInspectorHandler;
    let _instanceExtraInitializers = [];
    let _onDocumentLoaded_decorators;
    let _documentLoaded_decorators;
    let _propertyInspectorDidAppear_decorators;
    let _onReceiveSettings_decorators;
    return class IdeaPI extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _onDocumentLoaded_decorators = [SDOnPiEvent('documentLoaded')];
            _documentLoaded_decorators = [SDOnPiEvent('setupReady')];
            _propertyInspectorDidAppear_decorators = [SDOnPiEvent('globalSettingsAvailable')];
            _onReceiveSettings_decorators = [SDOnPiEvent('didReceiveSettings')];
            __esDecorate(this, null, _onDocumentLoaded_decorators, { kind: "method", name: "onDocumentLoaded", static: false, private: false, access: { has: obj => "onDocumentLoaded" in obj, get: obj => obj.onDocumentLoaded }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _documentLoaded_decorators, { kind: "method", name: "documentLoaded", static: false, private: false, access: { has: obj => "documentLoaded" in obj, get: obj => obj.documentLoaded }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _propertyInspectorDidAppear_decorators, { kind: "method", name: "propertyInspectorDidAppear", static: false, private: false, access: { has: obj => "propertyInspectorDidAppear" in obj, get: obj => obj.propertyInspectorDidAppear }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _onReceiveSettings_decorators, { kind: "method", name: "onReceiveSettings", static: false, private: false, access: { has: obj => "onReceiveSettings" in obj, get: obj => obj.onReceiveSettings }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        hostElement = __runInitializers(this, _instanceExtraInitializers);
        portElement;
        passwordElement;
        actionElement;
        saveElement;
        showTitleElement;
        runConfigurationNameElement;
        constructor() {
            super();
        }
        onDocumentLoaded() {
            this.logMessage('onDocumentLoaded() ' + this.actionInfo.action);
            const runConfig = document.getElementById('run_config');
            // this.mainElement = document.getElementById(
            //     'mainSettings'
            // ) as HTMLElement;
            // this.mainElement.style.display = 'initial';
            this.saveElement?.addEventListener('click', this.onSaveButtonPressed.bind(this));
            this.showTitleElement?.addEventListener('click', this.onUpdateTitleButtonPressed.bind(this));
            switch (this.actionInfo.action) {
                case pluginName + '.run':
                case pluginName + '.debug': {
                    runConfig.className = 'sdpi-item'; // Remove hidden class and display run configuration name input box
                    break;
                }
            }
            // Open all URL in HTML like this: <a data-open-url="https://github.com/JetBrains/intellij-streamdeck-plugin/issues">Bugtracker</a>
            document.querySelectorAll('[data-open-url]').forEach(e => {
                const value = e.getAttribute('data-open-url');
                if (value) {
                    e?.addEventListener('click', () => {
                        this.openUrl(value);
                    });
                }
                else {
                    this.logMessage(`${value} is not a supported url`);
                }
            });
        }
        documentLoaded() {
        }
        initElements() {
            this.hostElement = document.getElementById('host');
            this.portElement = document.getElementById('port');
            this.passwordElement = document.getElementById('password');
            this.actionElement = document.getElementById('action');
            this.saveElement = document.getElementById('save');
            this.showTitleElement = document.getElementById('singlechk');
            this.runConfigurationNameElement = document.getElementById('run_config_name');
        }
        /**
         * Save global settings and customized action ID settings
         * @private
         */
        async onSaveButtonPressed() {
            this.logMessage('onValidateButtonPressed()');
            const password = document.getElementById('password')?.value;
            const host = this.hostElement?.value;
            const port = this.portElement?.value;
            const action = this.actionElement.value;
            const runConfig = this.runConfigurationNameElement.value;
            const showTitle = this.showTitleElement.checked ? "on" : "off";
            this.logMessage("action=" + action + ", showTitle=" + showTitle);
            this.settingsManager.setGlobalSettings({ password, host, port });
            switch (this.actionInfo.action) {
                case pluginName + '.custom': {
                    break;
                }
            }
            this.setSettings({
                action: action,
                showTitle,
                runConfig
            });
            this.requestSettings(); // requestSettings will add the options to the select element
            // this.sendToPlugin( { showTitle }, "updateTitle")
        }
        /**
         * Only update the title global visibility status.
         * @private
         */
        async onUpdateTitleButtonPressed() {
            this.logMessage('onUpdateTitleButtonPressed()');
            const showTitle = this.showTitleElement.checked ? "on" : "off";
            // this.settingsManager.setGlobalSettings({ showTitle })
            this.setSettings({
                showTitle
            });
            // this.sendToPlugin( { showTitle }, "updateTitle")
        }
        // Prefill PI elements from cache
        propertyInspectorDidAppear() {
            this.logMessage('propertyInspectorDidAppear()');
            this.initElements();
            this.requestSettings();
            const globalSettings = this.settingsManager.getGlobalSettings();
            // this.showTitleElement.checked = true
            if (isGlobalSettingsSet(globalSettings)) {
                // const showTitle = globalSettings.showTitle
                // this.showTitleElement.checked = (showTitle === "on");
                const password = globalSettings.password;
                if (password) {
                    this.passwordElement.value = password;
                }
                const host = globalSettings.host;
                if (host) {
                    this.hostElement.value = host;
                }
                const port = globalSettings.port;
                if (port) {
                    this.portElement.value = port;
                }
            }
        }
        // Update per button settings
        onReceiveSettings({ payload, }) {
            this.logMessage("onReceiveSettings()");
            this.logMessage("payload.settings=" + JSON.stringify(payload.settings));
            this.logMessage("this.actionElement=" + this.actionElement);
            // This method will be called two times, the first time actionElement is undefined
            if (this.actionElement) {
                this.actionElement.value = payload.settings.action ?? "";
            }
            if (this.runConfigurationNameElement) {
                this.runConfigurationNameElement.value = payload.settings.runConfig ?? "";
            }
        }
    };
})();
new IdeaPI();
