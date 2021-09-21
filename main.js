const { app, BrowserWindow, Tray, Menu, ipcMain } = require("electron");
const ElectronStore = require("electron-store");
const store = new ElectronStore();

let tray = null;
let timeoutEvent = null;
let activeWindow = null;
let timeVal = null;
var workDates = [];
let workItems = {};



function createWindow(htmlPath = "client/index.html") {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(htmlPath);

    activeWindow = win;
}

app.whenReady().then(init);

function init() {
    createWindow();
    tray = new Tray("./clock.ico");
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Item3', type: 'radio', checked: true },
        {
            label: 'Exit', click: () => {
                app.quit();
            }
        }
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip("Shaun's Tempo Tracker");

    tray.on("click", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    if(store.get("workLog") !== undefined) {
        var workLog = store.get("workLog");

        for(const [key, value] of Object.entries(workLog)) {
            workDates.push(key);
        }

        console.log(workDates);
    }

    ipcMain.handle("timeValue", async (event, arg) => {
        timeVal = await arg;

        if (timeVal !== "na") {
            timeoutEvent = setTimeout(createWindow, timeVal);
        }

        closeWindow();
    });

    ipcMain.on("requestTimeValue", (event, arg) => {
        event.reply("getTimeValue", timeVal);
    });

    ipcMain.on("workItem", (event, arg) => {
        var workItems = store.get("workLog");

        if (workItems[getTodayDate()] === undefined) {
            workItems[getTodayDate()] = [];
        }

        workItems[getTodayDate()].push(arg);
        store.set("workLog", workItems);

        if (timeVal !== "na") {
            timeoutEvent = setTimeout(createWindow, timeVal);
        }

        closeWindow();
    });

    ipcMain.on("requestWorkData", (event, arg) => {
        var selectedDate = getTodayDate();

        if(arg !== undefined) {
            selectedDate = arg;
        }

        var resData = {
            "date": selectedDate,
            "data": store.get("workLog")[selectedDate]
        };

        event.reply("workData", resData);
    });

}

function closeWindow() {
    activeWindow.close();
    activeWindow = null;
}

// setInterval(() => {console.log(timeVal)}, 1000);

app.on('window-all-closed', function () {
    // if (process.platform !== 'darwin') app.quit()
})

function getTodayDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = "0" + dd;
    }

    if (mm < 10) {
        mm = "0" + mm;
    }

    return dd + "/" + mm + "/" + yyyy;
}
