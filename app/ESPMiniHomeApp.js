import './style/app.css';
import Fragment from "absol/src/AppPattern/Fragment";
import OOP from "absol/src/HTML5/OOP";
import {$, _} from "./Core";
import MLeftNavigator from "absol-mobile/js/dom/MLeftNavigator";
import MNavigatorMenu from "absol-mobile/js/dom/MNavigatorMenu";
import 'absol-acomp/css/bscroller.css';
import mqtt from 'mqtt';
import {MQTT_SERVER, PRIVATE_CHANNEL} from "./connfig";
import EspSmartPlug from "./device/EspSmartPlug";

function ESPMiniHomeApp() {
    Fragment.call(this);
    this.devices = {};
    this.mqttClient = mqtt.connect(MQTT_SERVER);
    this.mqttClient.on('message', this.ev_mqttMessage.bind(this));
    this.mqttClient.publish(PRIVATE_CHANNEL+'/who_online', "");
    this.mqttClient.subscribe([
        PRIVATE_CHANNEL+'/online'
    ]);
    this.setContext("MQTT_CLIENT", this.mqttClient);
}

OOP.mixClass(ESPMiniHomeApp, Fragment);

ESPMiniHomeApp.prototype.createView = function () {
    this.$view = _({
        class: 'emh-app',
        child: [
            {
                tag: MLeftNavigator,
                child: {
                    tag: MNavigatorMenu
                }
            },
            {
                class: ['emh-app-devices-ctn', 'as-bscroller']
            }
        ]
    });

    this.$devicesCtn = $('.emh-app-devices-ctn', this.$view);
};

ESPMiniHomeApp.prototype.ev_mqttMessage = function (channel, payload) {
    if (channel === PRIVATE_CHANNEL+'/online'){
        this.ev_onlineDevice(payload+'');
    }
};

ESPMiniHomeApp.prototype.ev_onlineDevice = function (deviceId){
    if (!this.devices[deviceId]){
        this.devices[deviceId] = new EspSmartPlug(deviceId);
        this.devices[deviceId].attach(this);
        this.$devicesCtn.addChild(this.devices[deviceId].getView());
        this.devices[deviceId].start();
    }

    this.devices[deviceId].online();

};

export default ESPMiniHomeApp;