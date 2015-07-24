var scope, token, AjandaDataSource, loginDataStr, loginDataJson;
app = window.app = window.app || {};

angular.module('ogrenciModul', []).controller('ogrenciCTRL', ['$scope', function ($scope) {
    $scope.Tarih = (new Date()).format("dd.mm.yyyy");
    $scope.langSource = source;
    $scope.RandevuTipi = 1; // Default randevu tipi 1 : Resmi , 2 : Özel
    $scope.Randevular = [];
    $scope.Arayanlar = [];
    $scope.AjandaRandevular = [];
    $scope.SecilenRandevu = "";
    $scope.SecilenArayan = "";
    $scope.SecilenYonetici = "";

    $scope.Set_Color = function (payment) {
        if (payment == "2") {
            return { color: "#CCE0FF" }
        }
        if (payment == "3") {
            return { color: "#f35800" } //Koyu Turuncu #DF5900
        }
        if (payment == "4") {
            return { color: "red" }
        }
        else {
            return { color: ""}
        }
    }
    $scope.SecilenRandevuDetay = function (randevu) {
        scope.SecilenRandevu = randevu;
        app.application.navigate("#view-randevudetay", "slide:left");
    }
    $scope.SecilenArayanDetay = function (arayan) {
        scope.SecilenArayan = arayan;
        app.application.navigate("#view-arayandetay", "slide:left");
    }
    $scope.SecilenRandevuAciklamaEkle = function () {
        var YeniAciklama = $("#secilen-randevu-aciklama-input")[0].value;
        if (YeniAciklama.trim() == "") {
            alert("Kaydet butonuna basmadan önce Açıklama Yazınız!");
        }
        else {
            RandevuAciklamaEkle(scope.SecilenYonetici.YoneticiID, scope.SecilenRandevu.Id, scope.SecilenRandevu.RandevuTipi, YeniAciklama.toString());
        }
    }
    $scope.SecilenArayanSonucEkle = function () {
        var YeniSonuc = $("#secilen-arayan-sonuc-input")[0].value;
        if (YeniSonuc.trim() == "") {
            alert("Kaydet butonuna basmadan önce Sonuç Yazınız!");
        }
        else {
            ArayanSonucEkle(scope.SecilenYonetici.YoneticiID, $scope.SecilenArayan.Id, YeniSonuc);
        }
    }

    $scope.DrawerRandevular = function () {
        $scope.SecilenYonetici = this.yonetici;
        $scope.RandevuTipi = 1;
        //console.log(scope.SecilenYonetici);
        GetRandevuKayit(scope.SecilenYonetici.YoneticiID);
    }
    $scope.DrawerArayanlar = function () {
        $scope.SecilenYonetici = this.yonetici;
        GetArayanKayit(scope.SecilenYonetici.YoneticiID);
    }
    $scope.DrawerAjandaResmi = function () {
        $scope.SecilenYonetici = this.yonetici;
        $scope.RandevuTipi = 1;
        console.log("AjandaResmi");
        SetDrawerAjandaOptions();
    }
    $scope.DrawerAjandaOzel = function () {
        $scope.SecilenYonetici = this.yonetici;
        $scope.RandevuTipi = 2;
        console.log("AjandaOzel");
        SetDrawerAjandaOptions();
    }
}]);

$(function () {

    AjaxSetup();

    token = window.localStorage.getItem("accessToken");
    loginDataStr = window.localStorage.getItem("RNDloginData");

    if (!(checkStorageData(token) && checkStorageData(loginDataStr)))
        gotoIndexPage();
    loginDataJson = JSON.parse(loginDataStr);
    //console.log(loginDataJson);
    scope = angular.element(document.getElementById("ogrenciCTRL")).scope();

    $(function () {
        kendo.culture('tr-TR');
    });

    LoadAngularData();

    $(document).ready(function () {
        scope.$apply(function () {
            scope.SecilenYonetici = loginDataJson.Yoneticiler[0];
        });
        GetRandevuKayit(loginDataJson.Yoneticiler[0].YoneticiID);
        //SetSettingsResmiOzelRandevuIcon();
        $("#RandevuDatePicker").kendoDatePicker({
            value: GetTarihByString(scope.Tarih),
            //format: "dd.mm.yyyy",
            culture: "tr-TR",
            change: function () {
                var value = this.value();
                scope.$apply(function () {
                    scope.Tarih = (value).format("dd.mm.yyyy");
                });
                AjandaTarihDegistir(scope.Tarih);
                GetRandevuKayit(scope.SecilenYonetici.YoneticiID);
            }
        });

        $("#ArayanDatePicker").kendoDatePicker({
            value: GetTarihByString(scope.Tarih),
            //format: "dd.mm.yyyy",
            culture: "tr-TR",
            change: function () {
                var value = this.value();
                scope.$apply(function () {
                    scope.Tarih = (value).format("dd.mm.yyyy");
                });
                AjandaTarihDegistir(scope.Tarih);
                GetArayanKayit(scope.SecilenYonetici.YoneticiID);
            }
        });

        $(document).on("click", "#randevu-datepicker-button", function () {
            $("#RandevuDatePicker").data("kendoDatePicker").open();
        });

        $(document).on("click", "#arayan-datepicker-button", function () {
            $("#ArayanDatePicker").data("kendoDatePicker").open();
        });

        $(document).on("click", "#dun-button", function () {
            scope.$apply(function () {
                if ($("#SchedulerEditable")[0].dataset.role === "scheduler" && window.location.hash === "#view-ajanda-editable") {
                    //console.log($("#SchedulerEditable").data("kendoScheduler"));
                    var schedulereditable = $("#SchedulerEditable").data("kendoScheduler");
                    if (schedulereditable._selectedViewName === "day") {
                        //console.log("editable day selected.");
                        scope.Tarih = decreaseFromDate(scope.Tarih);
                    }
                    if (schedulereditable._selectedViewName === "week") {
                        //console.log("editable week selected.");
                        scope.Tarih = decreaseFromDate((((schedulereditable._model.formattedDate).split(' '))[0].trim()).toString());
                    }
                    if (schedulereditable._selectedViewName === "month") {
                        //console.log("editable month selected.");
                    }
                    if (schedulereditable._selectedViewName === "agenda") {
                        //console.log("editable agenda selected.");
                        //scope.Tarih = decreaseFromDate((((scheduler._model.formattedDate).split(' '))[2].trim()).toString());
                        scope.Tarih = decreaseFromDate(scope.Tarih);
                    }
                }
                else if ($("#SchedulerReadOnly")[0].dataset.role === "scheduler" && window.location.hash === "#view-ajanda-readonly") {
                    //console.log($("#SchedulerReadOnly").data("kendoScheduler"));
                    var schedulerreadonly = $("#SchedulerReadOnly").data("kendoScheduler");
                    if (schedulerreadonly._selectedViewName === "day") {
                        //console.log("readonly day selected.");
                        scope.Tarih = decreaseFromDate(scope.Tarih);
                    }
                    if (schedulerreadonly._selectedViewName === "week") {
                        //console.log("readonly week selected.");
                        scope.Tarih = decreaseFromDate((((schedulerreadonly._model.formattedDate).split(' '))[0].trim()).toString());
                    }
                    if (schedulerreadonly._selectedViewName === "month") {
                        //console.log("readonly month selected.");
                    }
                    if (schedulerreadonly._selectedViewName === "agenda") {
                        //console.log("readonly agenda selected.");
                        //scope.Tarih = decreaseFromDate((((scheduler._model.formattedDate).split(' '))[2].trim()).toString());
                        scope.Tarih = decreaseFromDate(scope.Tarih);
                    }
                }
                else {
                    //console.log("dun else");
                    scope.Tarih = decreaseFromDate(scope.Tarih);
                }
            });
            $("#RandevuDatePicker").data("kendoDatePicker").value(scope.Tarih);
            AjandaTarihDegistir(scope.Tarih);
            DurumaGoreDataGetir(window.location.hash);
        });

        $(document).on("click", "#bugun-button", function () {
            scope.$apply(function () {
                scope.Tarih = (new Date()).format("dd.mm.yyyy");
            });
            $("#RandevuDatePicker").data("kendoDatePicker").value(scope.Tarih);
            AjandaTarihDegistir(scope.Tarih);
            DurumaGoreDataGetir(window.location.hash);
        });

        $(document).on("click", "#yarin-button", function () {
            scope.$apply(function () {
                if ($("#SchedulerEditable")[0].dataset.role === "scheduler" && window.location.hash === "#view-ajanda-editable")
                {
                    //console.log($("#SchedulerEditable").data("kendoScheduler"));
                    var schedulereditable = $("#SchedulerEditable").data("kendoScheduler");
                    if (schedulereditable._selectedViewName === "day")
                    {
                        //console.log("editable day selected.");
                        scope.Tarih = increaseFromDate(scope.Tarih);
                    }
                    if (schedulereditable._selectedViewName === "week")
                    {
                        //console.log("editable week selected.");
                        scope.Tarih = increaseFromDate((((schedulereditable._model.formattedDate).split(' '))[2].trim()).toString());
                    }
                    if (schedulereditable._selectedViewName === "month")
                    {
                        //console.log("editable month selected.");
                        scope.Tarih = increaseFromDate(scope.Tarih);
                    }
                    if (schedulereditable._selectedViewName === "agenda")
                    {
                        //console.log("editable agenda selected.");
                        //scope.Tarih = increaseFromDate((((scheduler._model.formattedDate).split(' '))[2].trim()).toString());
                        scope.Tarih = increaseFromDate(scope.Tarih);
                    }
                }
                else if ($("#SchedulerReadOnly")[0].dataset.role === "scheduler" && window.location.hash === "#view-ajanda-readonly") {
                    //console.log($("#SchedulerReadOnly").data("kendoScheduler"));
                    var schedulerreadonly = $("#SchedulerReadOnly").data("kendoScheduler");
                    if (schedulerreadonly._selectedViewName === "day") {
                        //console.log("readonly day selected.");
                        scope.Tarih = increaseFromDate(scope.Tarih);
                    }
                    if (schedulerreadonly._selectedViewName === "week") {
                        //console.log("readonly week selected.");
                        scope.Tarih = increaseFromDate((((schedulerreadonly._model.formattedDate).split(' '))[2].trim()).toString());
                    }
                    if (schedulerreadonly._selectedViewName === "month") {
                        //console.log("readonly month selected.");
                        scope.Tarih = increaseFromDate(scope.Tarih);
                    }
                    if (schedulerreadonly._selectedViewName === "agenda") {
                        //console.log("readonly agenda selected.");
                        //scope.Tarih = increaseFromDate((((scheduler._model.formattedDate).split(' '))[2].trim()).toString());
                        scope.Tarih = increaseFromDate(scope.Tarih);
                    }
                }
                else {
                    //console.log("yarin else");
                    scope.Tarih = increaseFromDate(scope.Tarih);
                }
            });
            $("#RandevuDatePicker").data("kendoDatePicker").value(scope.Tarih);
            AjandaTarihDegistir(scope.Tarih);
            DurumaGoreDataGetir(window.location.hash);
        });
        
        $(document).on("click", "#view-hesap-oturumukapat", function () {
            $.ajax({
                type: "POST",
                data: token,
                url: app.endpoints.cikis,
                dataType: "json",
                beforeSend: function () { app.application.showLoading(); },
                complete: function () {
                    app.application.hideLoading();
                    /*
                    window.localStorage.removeItem("RNDkullanici");
                    window.localStorage.removeItem("RNDsifre");
                    */
                    window.localStorage.removeItem("RNDloginData");
                    window.localStorage.removeItem("RNDkullaniciid");
                    window.localStorage.removeItem("accessToken");
                    window.location = "index.html";
                },
                crossDomain: true,
                success: function (result) {
                }
            });
        });
    });
});

function SetDrawerAjandaOptions() {
    kendo.culture('tr-TR');
    //console.log(scope.SecilenYonetici);
    app.application.showLoading();
    
    if (scope.SecilenYonetici.SadeceOkusun === false) // edit yetkisi olan
    {
        //app.application.navigate("#view-ajanda-editable", "none");
        if ($("#SchedulerEditable")[0].dataset.role !== "scheduler") {
            AjandaRandevuCRUDData();
            KendoSchedulerEditable();
        }
        else {
            AjandaTarihDegistir(scope.Tarih);
            AjandaDataSource.read();
        }
    }
    if (scope.SecilenYonetici.SadeceOkusun === true) // readonly yetkisi olan
    {
        //app.application.navigate("#view-ajanda-readonly", "none");
        if ($("#SchedulerReadOnly")[0].dataset.role !== "scheduler") {
            AjandaRandevuCRUDData();
            KendoSchedulerReadOnly();
        }
        else {
            AjandaTarihDegistir(scope.Tarih);
            AjandaDataSource.read();
        }
    }
};

function AjandaRandevuCRUDData() {
    var dataal;
    //------------------------------------------------------------
    AjandaDataSource = new kendo.data.SchedulerDataSource({
        batch: true,
        data: dataal,
        transport: {
            read: function (options) {
                $.ajax({
                    type: "POST",
                    data: {
                        "KullaniciID": loginDataJson.KullaniciID,
                        "AccessToken": loginDataJson.AccessToken,
                        "YoneticiID": scope.SecilenYonetici.YoneticiID,
                        "Tarih": scope.Tarih,
                        "RandevuTipi": scope.RandevuTipi
                    },
                    url: app.endpoints.getajandarandevular,
                    dataType: "json",
                    beforeSend: function () { app.application.showLoading(); },
                    complete: function () { app.application.hideLoading(); },
                    crossDomain: true,
                    success: function (jsonData) {
                        app.application.hideLoading();
                        if (!(jsonData === undefined || jsonData === null || jsonData === "" || jsonData.length === 0)) {
                            scope.$apply(function () {
                                scope.AjandaRandevular = jsonData;
                            });
                            options.success(scope.AjandaRandevular);
                            //console.log(scope.SecilenYonetici.SadeceOkusun);
                            if ($("#SchedulerEditable")[0].dataset.role === "scheduler") {
                                $("#SchedulerEditable").data("kendoScheduler").refresh();
                            }
                            if ($("#SchedulerReadOnly")[0].dataset.role === "scheduler") {
                                $("#SchedulerReadOnly").data("kendoScheduler").refresh();
                            }
                            if (scope.SecilenYonetici.SadeceOkusun === false) {
                                app.application.navigate("#view-ajanda-editable", "none");
                            }
                            if (scope.SecilenYonetici.SadeceOkusun === true) {
                                app.application.navigate("#view-ajanda-readonly", "none");
                            }
                        }
                        else if (jsonData.length === 0) {
                            alert("Henüz eklenmiş bir randevunuz bulunmamaktadır.");
                            location.reload();
                        }
                        else {
                            alert("Randevu verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
                            location.reload();
                        }
                    },
                    complete: function () {
                        if ($("#SchedulerEditable")[0].dataset.role === "scheduler") {
                            $("#SchedulerEditable").data("kendoScheduler").setDataSource(AjandaDataSource);
                            $("#SchedulerEditable").data("kendoScheduler").refresh();
                        }
                        if ($("#SchedulerReadOnly")[0].dataset.role === "scheduler") {
                            $("#SchedulerReadOnly").data("kendoScheduler").setDataSource(AjandaDataSource);
                            $("#SchedulerReadOnly").data("kendoScheduler").refresh();
                        }
                    },
                    error: function (e) {
                        alert(e.statusText);
                        alert("Randevu verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
                    }
                });
            },
            update: function (options) {
                var basTarihi = (options.data.models[0].BaslamaTarihi).format("dd.mm.yyyy");
                var bitTarihi = (options.data.models[0].BitisTarihi).format("dd.mm.yyyy");

                var basSaati = (((options.data.models[0].BaslamaTarihi.toString()).split(" "))[4].toString()).split(":");
                var bitSaati = (((options.data.models[0].BitisTarihi.toString()).split(" "))[4].toString()).split(":");
                basSaati = basSaati[0] + ":" + basSaati[1];
                bitSaati = bitSaati[0] + ":" + bitSaati[1];

                $.ajax({
                    type: "POST",
                    url: app.endpoints.ajandarandevuguncelle,
                    data: {
                        "QueryInfo": {
                            "KullaniciID": loginDataJson.KullaniciID,
                            "AccessToken": loginDataJson.AccessToken,
                            "YoneticiID": scope.SecilenYonetici.YoneticiID,
                            "Tarih": scope.Tarih,
                            "RandevuTipi": scope.RandevuTipi
                        },
                        "Randevu": {
                            "Id": options.data.models[0].Id.toString(),
                            "BaslamaTarihiStr": basTarihi.toString(),
                            "BitisTarihiStr": bitTarihi.toString(),
                            "BaslamaSaati": basSaati.toString(),
                            "BitisSaati": bitSaati.toString(),
                            "Konu": options.data.models[0].Konu,
                            "Katilimcilar": options.data.models[0].Katilimcilar,
                            "YerId": "1",
                            "TuruId": "2",
                            "Hatirlatma": options.data.models[0].Hatirlatma,
                            "Aciklama": options.data.models[0].Aciklama,
                            "TalepEden": options.data.models[0].TalepEden,
                            "Telefon": options.data.models[0].Telefon,
                            "Email": options.data.models[0].Email,
                            "Yeri": options.data.models[0].Yeri,
                            "Adres": options.data.models[0].Adres,
                            "RandevuTipi": options.data.models[0].RandevuTipi,
                            "KonuRenk": "1",
                            "HatirlatmaRenk": "2",
                            "KatilimciRenk": "3",
                            "Silindi": "0"
                        }
                    },
                    dataType: "json",
                    beforeSend: function () { app.application.showLoading(); },
                    complete: function () { app.application.hideLoading(); },
                    crossDomain: true,
                    success: function (result) {
                        if (result === true) {
                            AjandaDataSource.read();
                            if ($("#SchedulerEditable")[0].dataset.role === "scheduler") {
                                $("#SchedulerEditable").data("kendoScheduler").refresh();
                            }
                            if ($("#SchedulerReadOnly")[0].dataset.role === "scheduler") {
                                $("#SchedulerReadOnly").data("kendoScheduler").refresh();
                            }
                            alert("Randevunuz başarıyla güncellenmiştir.");
                            if (scope.SecilenYonetici.SadeceOkusun === false) {
                                app.application.navigate("#view-ajanda-editable", "none");
                            }
                            if (scope.SecilenYonetici.SadeceOkusun === true) {
                                app.application.navigate("#view-ajanda-readonly", "none");
                            }
                        }
                        else {
                            alert("Randevu güncellenirken bir hata meydana geldi. Lütfen tekrar deneyiniz.");
                            location.reload();
                        }
                    },
                    error: function () {
                        alert("Randevu güncelleme sırasında bir hata meydana geldi. Lütfen tekrar deneyiniz..");
                        location.reload();
                    }
                });
            },
            create: function (options) {
                var basTarihi = (options.data.models[0].BaslamaTarihi).format("dd.mm.yyyy");
                var bitTarihi = (options.data.models[0].BitisTarihi).format("dd.mm.yyyy");

                var basSaati = (((options.data.models[0].BaslamaTarihi.toString()).split(" "))[4].toString()).split(":");
                var bitSaati = (((options.data.models[0].BitisTarihi.toString()).split(" "))[4].toString()).split(":");
                basSaati = basSaati[0] + ":" + basSaati[1];
                bitSaati = bitSaati[0] + ":" + bitSaati[1];

                $.ajax({
                    type: "POST",
                    url: app.endpoints.ajandarandevuekle,
                    data: {
                        "QueryInfo": {
                            "KullaniciID": loginDataJson.KullaniciID,
                            "AccessToken": loginDataJson.AccessToken,
                            "YoneticiID": scope.SecilenYonetici.YoneticiID,
                            "Tarih": scope.Tarih,
                            "RandevuTipi": scope.RandevuTipi
                        },
                        "Randevu": {
                            "Id": options.data.models[0].Id.toString(),
                            "BaslamaTarihiStr": basTarihi.toString(),
                            "BitisTarihiStr": bitTarihi.toString(),
                            "BaslamaSaati": basSaati.toString(),
                            "BitisSaati": bitSaati.toString(),
                            "Konu": options.data.models[0].Konu,
                            "Katilimcilar": options.data.models[0].Katilimcilar,
                            "YerId": "1",
                            "TuruId": "2",
                            "Hatirlatma": options.data.models[0].Hatirlatma,
                            "Aciklama": options.data.models[0].Aciklama,
                            "TalepEden": options.data.models[0].TalepEden,
                            "Telefon": options.data.models[0].Telefon,
                            "Email": options.data.models[0].Email,
                            "Yeri": options.data.models[0].Yeri,
                            "Adres": options.data.models[0].Adres,
                            "RandevuTipi": options.data.models[0].RandevuTipi,
                            "KonuRenk": "1",
                            "HatirlatmaRenk": "2",
                            "KatilimciRenk": "3",
                            "Silindi": "0"
                        }
                    },
                    dataType: "json",
                    beforeSend: function () { app.application.showLoading(); },
                    complete: function () { app.application.hideLoading(); },
                    crossDomain: true,
                    success: function (result) {
                        if (result === true) {
                            AjandaDataSource.read();
                            if ($("#SchedulerEditable")[0].dataset.role === "scheduler") {
                                $("#SchedulerEditable").data("kendoScheduler").refresh();
                            }
                            if ($("#SchedulerReadOnly")[0].dataset.role === "scheduler") {
                                $("#SchedulerReadOnly").data("kendoScheduler").refresh();
                            }
                            alert("Randevunuz başarıyla eklenmiştir.");
                            if (scope.SecilenYonetici.SadeceOkusun === false) {
                                app.application.navigate("#view-ajanda-editable", "none");
                            }
                            if (scope.SecilenYonetici.SadeceOkusun === true) {
                                app.application.navigate("#view-ajanda-readonly", "none");
                            }
                        }
                        else {
                            alert("Randevu eklenirken bir hata meydana geldi. Lütfen tekrar deneyiniz.");
                            location.reload();
                        }
                    },
                    error: function () {
                        alert("Yeni kayıt oluşumu sırasında bir hata meydana geldi.");
                    }
                });
            }
        },
        schema: {
            model: {
                id: "taskId",
                fields: {
                    taskId: { from: "Id", type: "number" },
                    start: { from: "BaslamaTarihi", type: "date" },
                    end: { from: "BitisTarihi", type: "date" },
                    baslamaSaati: { from: "BaslamaSaati" },
                    bitisSaati: { from: "BitisSaati" },
                    description: { from: "Konu" },
                    katilimcilar: { from: "Katilimcilar" },
                    yerId: { from: "YerId" },
                    turuid: { from: "TuruId" },
                    hatirlatma: { from: "Hatirlatma" },
                    aciklama: { from: "Aciklama" },
                    talepEden: { from: "TalepEden" },
                    telefon: { from: "Telefon" },
                    email: { from: "Email" },
                    title: { from: "Yeri", defaultValue: "", validation: { required: true } },
                    adres: { from: "Adres" },
                    konuRenk: { from: "KonuRenk" },
                    hatirlatmaRenk: { from: "HatirlatmaRenk" },
                    katilimciRenk: { from: "KatilimciRenk" },
                    silindi: { from: "Silindi" },
                    //yoneticiId: { from: "YoneticiId" },
                    randevuTipi: { from: "RandevuTipi", type: "number", defaultValue: 1, validation: { required: true } }
                }
            }
        }
    });
};

function KendoSchedulerEditable() {
    kendo.culture('tr-TR');
    if ($("#SchedulerEditable")[0].dataset.role !== "scheduler") {
        $("#SchedulerEditable").kendoScheduler({
            date: GetTarihByString(scope.Tarih), //new Date(today),/*new Date("2014/01/16"),*/
            startTime: new Date("2013/6/13 8:00"),
            endTime: new Date("2013/6/13 22:00"),
            height: $(window).height(),
            majorTick: 60,                  // Soldaki saat aralığı.(1 saat)
            showWorkHours: false,           // İlk açılışta mesai saatlerini göstermesin tümünü göstersin.
            allDaySlot: false,              // Gridin üstüne allDay satırını kaldırır.
            minorTickCount: 2,             // İki saat arasının kaç aralığa bölünmesi gerektiğini setler.
            views: [
                { type: "day" },
                { type: "week", selectedDateFormat: "{0:dd.MM.yyyy} - {1:dd.MM.yyyy}" },
                //{ type: "month" },
                { type: "agenda", selected: true, selectedDateFormat: "{0:dd.MM.yyyy} - {1:dd.MM.yyyy}" }
            ],
            //edit: scheduler_edit,
            editable: {
                create: scope.SecilenYonetici.SadeceOkusun === true ? false : true,
                update: scope.SecilenYonetici.SadeceOkusun === true ? false : true,
                destroy: false,
                template: kendo.template($("#scheduler-template").html())
            },
            eventTemplate: $("#event-template").html(),             //Gridde gösterilecek randevu içeriği.
            mobile: "phone",
            timezone: "Etc/UTC",                                    //Datepicker durumu.
            footer: false,
            messages: {                                             //Mesai saatleri göster butonu yazısını günceller.
                showWorkDay: "Mesai Saatlerini Göster",
                showFullDay: "Tüm Günü Göster",
                allDay: "Gün",
                cancel: "Vazgeç",
                deleteWindowTitle: "Randevu Sil",
                destroy: "Sil",
                save: "Kaydet",
                today: "Bugün",
                editor: {
                    //allDayEvent: "All Day event",            //Editable:true iken açılan kısımda alldayevent check box text yazısı
                    allDayEvent: false,
                    description: "Konusu",                   //Editable:true iken açılan kısımda description text yazısı
                    editorTitle: "Randevu Düzenle",
                    start: "Başlama Saati",
                    end: "Bitiş Saati",
                    endTimezone: "End date timezone",
                    repeat: "Repeat the event",
                    title: "Randevu Yeri"   //Yeni event eklerken title text yazısı.
                },
                views: {
                    day: "Gün",
                    week: "Hafta",
                    month: "Ay",
                    agenda: "Ajanda"
                }
            },
            dataBound: function (e) {
                //Bugün butonunu görselden kaldırır.
                e.sender.toolbar[0].childNodes[0].style.display = "none";
                //Toolbar Gün,Hafta,Ay ve Ajanda butonlarını ortalar
                e.sender.toolbar[0].childNodes[1].style.width = "100%";
                //Toolbar ileri ve geri butonlarını kaldırır
                /*e.sender.toolbar[1].childNodes[0].childNodes[0].style.display = "none";
                e.sender.toolbar[1].childNodes[0].childNodes[2].style.display = "none";*/
                //e.sender._editor.editable = scope.SecilenYonetici.SadeceOkusun === true ? false : true;
                /*e.sender._editor.options.editable.create = scope.SecilenYonetici.SadeceOkusun === true ? false : true;
                e.sender._editor.options.editable.update = scope.SecilenYonetici.SadeceOkusun === true ? false : true;
                e.sender.options.editable.create = scope.SecilenYonetici.SadeceOkusun === true ? false : true;
                e.sender.options.editable.update = scope.SecilenYonetici.SadeceOkusun === true ? false : true;*/
                //console.log(e);

                //Schedulerin mevcut tarihini alır.
                //$("#Scheduler").data("kendoScheduler").date();
                //e.sender._model.selectedDate

                //Ajandada tarih değiştirildiği zaman genel tarihin güncellenmesi.
                //console.log(e.sender._model.selectedDate);
                /*scope.$apply(function () {
                    scope.Tarih = (e.sender._model.selectedDate).format("dd.mm.yyyy");
                });*/
                //KendoDatePicker Tarihini günceller
                $("#RandevuDatePicker").data("kendoDatePicker").value(scope.Tarih);
            },
            dataSource: AjandaDataSource
        });
    }
    else {
        AjandaDataSource.read();
    }
};

function KendoSchedulerReadOnly() {
    kendo.culture('tr-TR');
    if ($("#SchedulerReadOnly")[0].dataset.role !== "scheduler") {
        $("#SchedulerReadOnly").kendoScheduler({
            date: GetTarihByString(scope.Tarih), //new Date(today),/*new Date("2014/01/16"),*/
            startTime: new Date("2013/6/13 8:00"),
            endTime: new Date("2013/6/13 22:00"),
            height: $(window).height(),
            majorTick: 60,                  // Soldaki saat aralığı.(1 saat)
            showWorkHours: false,           // İlk açılışta mesai saatlerini göstermesin tümünü göstersin.
            allDaySlot: false,              // Gridin üstüne allDay satırını kaldırır.
            minorTickCount: 2,             // İki saat arasının kaç aralığa bölünmesi gerektiğini setler.
            views: [
                { type: "day" },
                { type: "week", selectedDateFormat: "{0:dd.MM.yyyy} - {1:dd.MM.yyyy}" },
                //{ type: "month" },
                { type: "agenda", selected: true, selectedDateFormat: "{0:dd.MM.yyyy} - {1:dd.MM.yyyy}" }
            ],
            //edit: scheduler_edit,
            editable: {
                create: scope.SecilenYonetici.SadeceOkusun === true ? false : true,
                update: scope.SecilenYonetici.SadeceOkusun === true ? false : true,
                destroy: false,
                template: kendo.template($("#scheduler-template").html())
            },
            eventTemplate: $("#event-template").html(),             //Gridde gösterilecek randevu içeriği.
            mobile: "phone",
            timezone: "Etc/UTC",                                    //Datepicker durumu.
            footer: false,
            messages: {                                             //Mesai saatleri göster butonu yazısını günceller.
                showWorkDay: "Mesai Saatlerini Göster",
                showFullDay: "Tüm Günü Göster",
                allDay: "Gün",
                cancel: "Vazgeç",
                deleteWindowTitle: "Randevu Sil",
                destroy: "Sil",
                save: "Kaydet",
                today: "Bugün",
                editor: {
                    //allDayEvent: "All Day event",            //Editable:true iken açılan kısımda alldayevent check box text yazısı
                    allDayEvent: false,
                    description: "Konusu",                   //Editable:true iken açılan kısımda description text yazısı
                    editorTitle: "Randevu Düzenle",
                    start: "Başlama Saati",
                    end: "Bitiş Saati",
                    endTimezone: "End date timezone",
                    repeat: "Repeat the event",
                    title: "Randevu Yeri"   //Yeni event eklerken title text yazısı.
                },
                views: {
                    day: "Gün",
                    week: "Hafta",
                    month: "Ay",
                    agenda: "Ajanda"
                }
            },
            dataBound: function (e) {
                //Bugün butonunu görselden kaldırır.
                e.sender.toolbar[0].childNodes[0].style.display = "none";
                //Toolbar Gün,Hafta,Ay ve Ajanda butonlarını ortalar
                e.sender.toolbar[0].childNodes[1].style.width = "100%";
                //Toolbar ileri ve geri butonlarını kaldırır
                /*e.sender.toolbar[1].childNodes[0].childNodes[0].style.display = "none";
                e.sender.toolbar[1].childNodes[0].childNodes[2].style.display = "none";*/
                //e.sender._editor.editable = scope.SecilenYonetici.SadeceOkusun === true ? false : true;
                /*e.sender._editor.options.editable.create = scope.SecilenYonetici.SadeceOkusun === true ? false : true;
                e.sender._editor.options.editable.update = scope.SecilenYonetici.SadeceOkusun === true ? false : true;
                e.sender.options.editable.create = scope.SecilenYonetici.SadeceOkusun === true ? false : true;
                e.sender.options.editable.update = scope.SecilenYonetici.SadeceOkusun === true ? false : true;*/
                //console.log(e);

                //Schedulerin mevcut tarihini alır.
                //$("#Scheduler").data("kendoScheduler").date();
                //e.sender._model.selectedDate

                //Ajandada tarih değiştirildiği zaman genel tarihin güncellenmesi.
                //console.log(e.sender._model.selectedDate);
                /*scope.$apply(function () {
                    scope.Tarih = (e.sender._model.selectedDate).format("dd.mm.yyyy");
                });*/
                //KendoDatePicker Tarihini günceller
                $("#RandevuDatePicker").data("kendoDatePicker").value(scope.Tarih);
            },
            dataSource: AjandaDataSource
        });
    }
    else {
        AjandaDataSource.read();
    }
};

function AjandaTarihDegistir(tar) {
    var tarih = GetTarihByString(tar);
    if ($("#SchedulerEditable")[0].dataset.role === "scheduler") {
        $("#SchedulerEditable").data("kendoScheduler").date(tarih);
    }
    if ($("#SchedulerReadOnly")[0].dataset.role === "scheduler") {
        $("#SchedulerReadOnly").data("kendoScheduler").date(tarih);
    }
};

function DurumaGoreDataGetir(hash) {
    if (hash === "#view-randevular") {
        GetRandevuKayit(scope.SecilenYonetici.YoneticiID);
    }
    if (hash === "#view-arayanlar") {
        GetArayanKayit(scope.SecilenYonetici.YoneticiID);
    }
};

function LoadAngularData() {
    scope.$apply(function () {
        scope.loginData = loginDataJson;
    });
};

function GetRandevuKayit(yoneticiid) {
    $.ajax({
        type: "POST",
        data: {
            "KullaniciID": loginDataJson.KullaniciID,
            "AccessToken": loginDataJson.AccessToken,
            "YoneticiID": yoneticiid,
            "Tarih": scope.Tarih,
            "RandevuTipi": scope.RandevuTipi
        },
        url: app.endpoints.getrandevular,
        dataType: "json",
        beforeSend: function () { app.application.showLoading(); },
        complete: function () { app.application.hideLoading(); },
        crossDomain: true,
        success: function (jsonData) {
            app.application.hideLoading();
            app.application.navigate("#view-randevular", "none");
            SetSettingsResmiOzelRandevuIcon();
            if (!(jsonData === undefined || jsonData === null || jsonData === "")) {
                scope.$apply(function () {
                    scope.Randevular = jsonData;
                });
            }
            else {
                alert("Randevu verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
            }
        },
        error: function (e) {
            alert(e.statusText);
            alert("Randevu verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
        }
    });
};

function GetArayanKayit(yoneticiid) {
    $.ajax({
        type: "POST",
        data: {
            "KullaniciID": loginDataJson.KullaniciID,
            "AccessToken": loginDataJson.AccessToken,
            "YoneticiID": yoneticiid,
            "Tarih": scope.Tarih
        },
        url: app.endpoints.getarayanlar,
        dataType: "json",
        beforeSend: function () { app.application.showLoading(); },
        complete: function () { app.application.hideLoading(); },
        crossDomain: true,
        success: function (jsonData) {
            app.application.hideLoading();
            app.application.navigate("#view-arayanlar", "none");
            if (!(jsonData === undefined || jsonData === null || jsonData === "")) {
                scope.$apply(function () {
                    scope.Arayanlar = jsonData;
                });
            }
            else {
                alert("Arayan verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
                location.reload();
            }
        },
        error: function (e) {
            alert(e.statusText);
            alert("Arayan verileri alınırken bir hata oldu. Lütfen tekrar deneyiniz.");
        }
    });
};

function RandevuAciklamaEkle(yoneticiid, randevuid, randevutipi, aciklama) {
    $.ajax({
        type: "POST",
        data: {
            "KullaniciID": loginDataJson.KullaniciID,
            "AccessToken": loginDataJson.AccessToken,
            "YoneticiID": yoneticiid,
            "RandevuId": randevuid,
            "RandevuTipi": randevutipi,
            "BaskanAciklamasi": aciklama,
            "MevcutRandevuAciklama": scope.SecilenRandevu.Aciklama
        },
        url: app.endpoints.randevudetayaciklamaekle,
        dataType: "json",
        crossDomain: true,
        success: function (result) {
            if (result === true) {
                $("#secilen-randevu-aciklama-input")[0].value = "";
                alert("Randevu açıklamanız başarıyla eklenmiştir.");
                GetRandevuKayit(scope.SecilenYonetici.YoneticiID);
            }
            else {
                alert("Randevu açıklama eklenirken bir hata meydana geldi. Lütfen tekrar deneyiniz");
            }
        },
        error: function () {
            alert("Randevu açıklama eklenirken bir hata meydana geldi.");
        }
    });
};

function ArayanSonucEkle(yoneticiid, arayanid, sonuc) {
    $.ajax({
        type: "POST",
        data: {
            "KullaniciID": loginDataJson.KullaniciID,
            "AccessToken": loginDataJson.AccessToken,
            "YoneticiID": yoneticiid,
            "ArayanId": arayanid,
            "BaskanSonuc": sonuc,
            "MevcutArayanSonuc": scope.SecilenArayan.Sonuc
        },
        url: app.endpoints.arayandetaysonucekle,
        dataType: "json",
        crossDomain: true,
        success: function (result) {
            if (result === true) {
                $("#secilen-arayan-sonuc-input")[0].value = "";
                alert("Arayan açıklamanız başarıyla eklenmiştir.");
                GetArayanKayit(scope.SecilenYonetici.YoneticiID);
            }
            else {
                alert("Arayan sonuç eklenirken bir hata meydana geldi. Lütfen tekrar deneyiniz");
            }
        },
        error: function () {
            alert("Arayan sonuç eklenirken bir hata meydana geldi.");
        }
    });
};

function selectResmiOzelRandevuButton() {
    if (this.selectedIndex === 0) {
        scope.$apply(function () {
            scope.RandevuTipi = 1;
        });
    }
    if (this.selectedIndex === 1) {
        scope.$apply(function () {
            scope.RandevuTipi = 2;
        });
    }
    GetRandevuKayit(scope.SecilenYonetici.YoneticiID);
};

function SetSettingsResmiOzelRandevuIcon() {
    ($("#button-group-resmiozelrandevu").data("kendoMobileButtonGroup")).select(scope.RandevuTipi - 1);
};

function RandevuAciklamaIptalButton() {
    $("#secilen-randevu-aciklama-input")[0].value = "";
    app.application.navigate("#:back", "slide:right");
};

function ArayanSonucIptalButton() {
    $("#secilen-arayan-sonuc-input")[0].value = "";
    app.application.navigate("#:back", "slide:right");
};

function initPullToRefreshScroller(e) {
    var scroller = e.view.scroller;
    scroller.setOptions({
        pullToRefresh: true,
        pullTemplate: source.yenilemekicincekin,
        refreshTemplate: source.yenileniyor,
        releaseTemplate: source.yenilemekicinbirakin,
        useNative: true,
        zoom: true,
        pull: function () {
            DurumaGoreDataGetir(window.location.hash);
            //location.reload();
            setTimeout(function () { scroller.pullHandled(); }, 1000);
        }
    });
};

function checkStorageData(data) {
    //LocalStorage'da datanın varlığına bakılır.
    if (data === undefined || data === null || data === "")
        return false;
    else return true;
};

function AjaxSetup() {
    //AjaxSetup
    $.ajaxSetup({
        beforeSend: function () { app.application.showLoading(); },
        complete: function () { app.application.hideLoading(); },
        error: function (jqXHR, exception) {
            if (jqXHR.status === 0) {
                navigator.notification.alert("Uygulama internet bağlantısı gerektirir.", function () {
                    navigator.app.exitApp();
                }, "Bağlantı Hatası", 'Tamam');
            } else if (jqXHR.status == 404) {
                alert("Servis noktası bulunamadı.");
            } else if (jqXHR.status >= 500) {
                alert("Serviste sunucu hatası.");
            } else if (exception === 'parsererror') {
                alert("Servisten dönen kayıt hatalı.");
            } else if (exception === 'timeout') {
                alert("İstek zaman aşımına uğradı.");
            } else if (exception === 'abort') {
                alert("İstek iptal edildi.");
            } else {
                alert("Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");
            }
        }
    });
};

function gotoIndexPage() {
    window.location = "index.html";
};

function GetTarihByString(tar) {
    var dizi = tar.split(".");
    return new Date(dizi[2], (dizi[1] - 1), dizi[0]);
};

function isNullUndefinedOrEmpty(value) {
    /// <summary>Gelen değerin null, undefined veya empty ('') olması durumunu inceleyen method</summary>
    /// <param name="value" type="string">kullanılan string değeri.</param>
    if (value === null || value === undefined || value === "") return true;
    else return false;
};

function decreaseFromDate(tar) {
    //Date decrease :
    var dateString = (tar).split('.');
    var date = new Date(dateString[2], parseInt(dateString[1]) - 1, dateString[0]);
    return (formatDate(addDays(date, -1)));
}

function increaseFromDate(tar) {
    //Date increase :
    var fromDateString = (tar).split('.');
    var fromDate = new Date(fromDateString[2], parseInt(fromDateString[1]) - 1, fromDateString[0]);
    return (formatDate(addDays(fromDate, 1)));
}

function increaseFromDateGivenDays(tar, gun) {
    //Date increase :
    var fromDateString = (tar).split('.');
    var fromDate = new Date(fromDateString[2], parseInt(fromDateString[1]) - 1, fromDateString[0]);
    return (formatDate(addDays(fromDate, gun)));
}

function formatDate(date) {
    return ("00" + date.getDate()).slice(-"00".length) + '.' + ("00" + (date.getMonth() + 1)).slice(-"00".length) + '.' + date.getFullYear();
}

function addDays(date, days) {
    var today = new Date(date);
    var tomorrow = new Date();
    tomorrow.setTime(today.getTime() + (days * 24 * 60 * 60 * 1000));
    return tomorrow;
};

function daysInMonth(month, year) {
    var dd = new Date(year, month, 0);
    return dd.getDate();
};

function getSaat(value) {
    return (((value.split(":"))[0]).trim()).toString();
};

function getDakika(value) {
    return (((value.split(":"))[1]).trim()).toString();
};

