import Fragment from "absol/src/AppPattern/Fragment";
import OOP from "absol/src/HTML5/OOP";
import {$, _} from "../Core";
import '../style/espsmartplug.css';
import {PRIVATE_CHANNEL} from "../connfig";
import Switch from "absol-acomp/js/Switch";

/***
 * @extends Context
 * @param deviceId
 * @constructor
 */
function EspSmartPlug(deviceId) {
    Fragment.call(this);
    this.deviceId = deviceId;
    this._offlineTimeoutIdx = -1;
}

OOP.mixClass(EspSmartPlug, Fragment);


EspSmartPlug.prototype.createView = function () {
    this.$view = _({
        class: ['emh-esp-smart-plug', "emh-online"],
        child: [
            {
                class: 'emh-esp-smart-plug-type-img-ctn',
                child: {
                    tag: 'svg',
                    props: {
                        innerHTML: '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
                            '\t viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">\n' +
                            '<style type="text/css">\n' +
                            '\t.st0{fill:#333333;}\n' +
                            '</style>\n' +
                            '<g id="XMLID_2_">\n' +
                            '\t<path id="XMLID_8_" class="st0" d="M504.7,0H7.3v512h497.5V0z M262.9,75.8v37.5h-28.3V75.8v-5.4h28.3V75.8z M234.6,451.5v-39h28.3\n' +
                            '\t\tv39.8v2.3h-28.3V451.5z M277.4,450v-52.8h-56.6v14.5v37.5C132,433.9,64.7,356.6,64.7,264c0-93.4,67.3-169.9,156.1-185.2v49h42.9\n' +
                            '\t\th14.5V77.3C370,89.5,442,168.4,442,264C440.4,358.9,369.3,437.8,277.4,450z"/>\n' +
                            '\t<circle id="XMLID_9_" class="st0" cx="149.6" cy="268.6" r="28.3"/>\n' +
                            '\t\n' +
                            '\t\t<ellipse id="XMLID_10_" transform="matrix(0.1602 -0.9871 0.9871 0.1602 39.1737 583.2988)" class="st0" cx="362.4" cy="268.6" rx="28.3" ry="28.3"/>\n' +
                            '\t<path id="XMLID_13_" class="st0" d="M253.7,238.8c-14.5,0-26,11.5-26,26c0,14.5,11.5,26,26,26c14.5,0,26-11.5,26-26\n' +
                            '\t\tC279.7,250.3,267.5,238.8,253.7,238.8z M253.7,276.3c-6.1,0-11.5-5.4-11.5-11.5s5.4-11.5,11.5-11.5s11.5,5.4,11.5,11.5\n' +
                            '\t\tS259.8,276.3,253.7,276.3z"/>\n' +
                            '</g>\n' +
                            '</svg>\n'
                    }
                }
            },
            {
                class: 'emh-esp-smart-plug-device-id',
                child: { text: this.deviceId }
            },
            {
                class: 'emh-esp-smart-plug-switch-ctn',
                child: {
                    tag: Switch,
                    props: {
                        checked: false
                    },
                    on: {
                        change: this.ev_switchChange.bind(this)
                    }
                }
            }
        ]
    });
    this.$switch = $('switch', this.$view);
};

EspSmartPlug.prototype.onAttached = function () {
    this.mqttClient = this.getContext("MQTT_CLIENT");
    this.mqttClient.subscribe(PRIVATE_CHANNEL + '/' + this.deviceId + '/status')
    this.mqttClient.on('message', this.ev_mqttMessage.bind(this));
}

EspSmartPlug.prototype.onResume = function () {
    this.mqttClient.publish(PRIVATE_CHANNEL + '/' + this.deviceId + '/what_status');
}

EspSmartPlug.prototype.online = function () {
    if (this._offlineTimeoutIdx > 0) {
        clearTimeout(this._offlineTimeoutIdx);
    }

    this._offlineTimeoutIdx = setTimeout(function () {
        this._offlineTimeoutIdx = -1;
        this.offline();
    }.bind(this), 20000);
    this.$view.addClass("emh-online");
};

EspSmartPlug.prototype.offline = function () {
    if (this._offlineTimeoutIdx > 0) {
        clearTimeout(this._offlineTimeoutIdx);
    }
    this.$view.removeClass("emh-online");

};

EspSmartPlug.prototype.ev_status = function (statusText) {
    this.$switch.checked = statusText === "ON";
};

EspSmartPlug.prototype.ev_mqttMessage = function (channel, payload) {
    if (channel === PRIVATE_CHANNEL + '/' + this.deviceId + '/status') {
        this.ev_status(payload + '');
    }
};

EspSmartPlug.prototype.ev_switchChange = function (event) {
    this.mqttClient.publish(PRIVATE_CHANNEL + '/' + this.deviceId + '/command', this.$switch.checked ? '1' : '0');
};

export default EspSmartPlug;