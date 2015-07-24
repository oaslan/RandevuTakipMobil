var scope;
(function (global) {
    var LoginViewModel, AyarlarViewModel,
        app = global.app = global.app || {};
    var ipAdres = "localhost";
    angular.module('ogrenciModul', []).controller('ogrenciCTRL', ['$scope', function ($scope) {
        $scope.langSource = source;
    }]);

    $(function () {
        scope = angular.element(document.getElementById("ogrenciCTRL")).scope();

        if (checkStorageData(window.localStorage.accessToken)) {
            window.location = "IndexLogged.html";
        }

        $(document).ready(function () {
            if (!checkStorageData(window.localStorage.ipAdres)) {
                window.localStorage.setItem("ipAdres", "localhost");
            }
            else {
                ipAdres = window.localStorage.ipAdres;
            }

            var ipAdresData = kendo.observable({
                ipAdres: ipAdres
            });
            kendo.bind($("#ipAdresAyari"), ipAdresData);
        });
    });

    LoginViewModel = kendo.data.ObservableObject.extend({
        isLoggedIn: false,
        Kullanici: checkStorageData(window.localStorage.RNDkullanici) ? window.localStorage.RNDkullanici : "",
        Sifre:     checkStorageData(window.localStorage.RNDsifre)     ? window.localStorage.RNDsifre     : "",
        onLogin: function () {
            var that = this,
                Kullanici = that.get("Kullanici").trim(),
                Sifre = that.get("Sifre").trim();
            
            if (Kullanici === "" && Sifre === "") { $(".erroruser").show(); $(".errorpass").show(); return; } else { $(".erroruser").hide(); $(".errorpass").hide(); }
            if (Kullanici === "") { $(".erroruser").show(); return; } else { $(".erroruser").hide(); }
            if (Sifre === "") { $(".errorpass").show(); return; } else { $(".errorpass").hide(); }
            LogIn(Kullanici, Sifre);
        },
        onInit: function () {
            if (!checkStorageData(window.localStorage.ipAdres)) {
                window.localStorage.setItem("ipAdres", "localhost");
            }
            else {
                ipAdres = window.localStorage.ipAdres;
            }

            $(".erroruser").hide();
            $(".errorpass").hide();
        },
        onLogout: function () {
            var that = this;
            that.clearForm();
            that.set("isLoggedIn", false);
        },
        clearForm: function () {
            var that = this;

            that.set("Kullanici", "");
            that.set("Sifre", "");
        },
        checkEnter: function (e) {
            var that = this;

            if (e.keyCode == 13) {
                $(e.target).blur();
                that.onLogin();
            }
        }
    });
    app.loginService = {
        viewModel: new LoginViewModel()
    };
    app.loginService.viewModel.onInit();
    AyarlarViewModel = kendo.data.ObservableObject.extend({
        MevcutIP: checkStorageData(window.localStorage.ipAdres) ? window.localStorage.ipAdres : "",
        YeniIP: "",
        onSave: function () {
            var that = this,
                yeniIP = that.get("YeniIP").trim();
            window.localStorage.ipAdres = yeniIP;
            that.set("YeniIP", "");
            that.set("MevcutIP", yeniIP);
            app.application.navigate("#view-giris", "slide:right");
        },
        onInit: function () {
            $('#mevcutservisip').attr('readonly', true);
        },
    });
    app.ayarlarService = {
        viewModel: new AyarlarViewModel()
    };
    app.ayarlarService.viewModel.onInit();
})(window);

function LogIn(Kullanici, Sifre) {
    $.ajax({
        type: "POST",
        url: app.endpoints.login,
        data: { "Kullanici": Kullanici, "Sifre": Sifre },
        beforeSend: function () { app.application.showLoading(); },
        complete: function () { app.application.hideLoading(); },
        dataType: "json",
        crossDomain: true,
        success: function (jsonData) {
            app.application.hideLoading();
            if (!(jsonData === undefined || jsonData === null || jsonData === "")) {
                if (jsonData.Authenticated === true) {
                    window.localStorage.setItem("RNDkullanici", Kullanici);
                    window.localStorage.setItem("RNDsifre", Sifre);
                    window.localStorage.setItem("RNDkullaniciid", jsonData.KullaniciID);
                    window.localStorage.setItem("accessToken", jsonData.AccessToken);
                    window.localStorage.setItem("RNDloginData", JSON.stringify(jsonData));
                    window.location = "IndexLogged.html";
                }
                else {
                    $("#GirisBasarisiz")[0].innerText = jsonData.AuthenticationMessage;
                }
            }
            else {
                alert(jsonData.AuthenticationMessage);
            }
        },
        error: function (e) {
            alert(e.statusText);
            alert("Giriş işlemi sırasında bir hata oldu. Lütfen tekrar deneyiniz.");
        }
    });
};

//LocalStorage'da datanın varlığına bakılır.
function checkStorageData(data) {
    if (data === undefined || data === null || data === "")
        return false;
    else return true;
};

function AyarlarYonlendir() {
    scope.$apply(function () {
        scope.MevcutServisIP = window.localStorage.ipAdres;
    });
    app.application.navigate("#view-ayarlar", "slide:left");
};

function iptalButton() {
    app.application.navigate("#view-giris", "slide:right");
};