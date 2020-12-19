import './style/app.css';
import ESPMiniHomeApp from "./ESPMiniHomeApp";

var app = new ESPMiniHomeApp();
app.getView().addTo(document.body);
app.start();