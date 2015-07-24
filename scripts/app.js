var hostAdress;
(function (global) {

    app = global.app = global.app || {};

    app.application = new kendo.mobile.Application(document.body, { loading: "<h1></h1>", skin: "flat" });

    hostAdress = window.localStorage.getItem("ipAdres");

    app.endpoints = {
        login: "http://" + hostAdress + "/Rektorluk/api/Auth/Login",
        getrandevular: "http://" + hostAdress + "/Rektorluk/api/Auth/GetRandevular",
        getarayanlar: "http://" + hostAdress + "/Rektorluk/api/Auth/GetArayanlar",
        randevudetayaciklamaekle: "http://" + hostAdress + "/Rektorluk/api/Auth/RandevuDetayAciklamaEkle",
        arayandetaysonucekle: "http://" + hostAdress + "/Rektorluk/api/Auth/ArayanDetaySonucEkle",
        getajandarandevular: "http://" + hostAdress + "/Rektorluk/api/Auth/GetAjandaRandevular",
        ajandarandevuguncelle: "http://" + hostAdress + "/Rektorluk/api/Auth/AjandaRandevuGuncelle",
        ajandarandevuekle: "http://" + hostAdress + "/Rektorluk/api/Auth/AjandaRandevuEkle",
        cikis: "http://" + hostAdress + "/Rektorluk/api/Auth/Cikis"
    };

})(window);

function onLoad() {
    $(document.body).height(window.innerHeight);
}

function cikisButton() {
    navigator.notification.confirm(
        'Çıkış yapmak istediğinize emin misiniz?',      // message
         Cikis,                                         // callback to invoke with index of button pressed
        'Çıkış',                                        // title
        'Çıkış,İptal'                                   // buttonLabels
    );

    function Cikis(buttonIndex) {
        if (buttonIndex === 1) {
            navigator.app.exitApp();
        }
    }
    //alert("Çıkış yapıldı.");
};

