import Dom from "absol/src/HTML5/Dom";
import MNavigatorMenu from "absol-mobile/js/dom/MNavigatorMenu";
import MLeftNavigator from "absol-mobile/js/dom/MLeftNavigator";


var Core = new Dom();
Core.install([MNavigatorMenu,
    MLeftNavigator]);
export var _ = Core._;
export var $ = Core.$;

export default Core;
