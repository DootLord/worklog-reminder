const { ipcRenderer } = require('electron');
let submitBtn = document.getElementById("submitWork");
let viewBtn = document.getElementById("viewWork");
let workTable = document.getElementById("workTable");
let timeValue = null;
let availableDates = [];

document.addEventListener('DOMContentLoaded', function () {
    var timeDropdown = document.getElementById("timeDropdown");
    var modal = document.querySelectorAll('.modal');
    M.Modal.init(modal, {});
    M.FormSelect.init(timeDropdown, {});

    timeDropdown.addEventListener("change", function () {
        ipcRenderer.invoke("timeValue", this.value);
    });

    // Get current delay value
    ipcRenderer.on("getTimeValue", (event, arg) => {
        timeValue = arg;
        console.log(timeValue);
    });

    ipcRenderer.send("requestTimeValue");

    // Populate what dates are available
    ipcRenderer.on("getDates", (event, arg) => {
        availableDates = arg;
        renderDateDropdown();
    });

    ipcRenderer.send("requestDates");
});

submitBtn.addEventListener("click", function () {
    let workDesc = document.getElementById("workDesc").value;
    let workTitle = document.getElementById("workTitle").value;
    let workItem = {
        "title": workTitle,
        "desc": workDesc,
        "duration": timeValue
    }
    ipcRenderer.send("workItem", workItem);
});

viewBtn.addEventListener("click", function () {
    var workData;

    ipcRenderer.on("workData", function (event, args) {
        workData = args.data;
        workData.forEach(workItem => {
            let tr = document.createElement("tr");
            let title = document.createElement("td");
            let desc = document.createElement("td");
            let duration = document.createElement("td");

            title.innerText = workItem.title;
            desc.innerText = workItem.desc;

            switch (workItem.duration) {
                case "1800":
                    duration.innerText = "30m";
                    break;
                case "3600":
                    duration.innerText = "1h";
                    break;
                case "5400":
                    duration.innerText = "1h 30m";
                    break;
                case "7200":
                    duration.innerText = "2h";
                    break;
                default:
                    duration.innerText = "N/A";
                    break;
            }

            tr.appendChild(title);
            tr.appendChild(desc);
            tr.appendChild(duration);

            workTable.appendChild(tr);
        });
        console.log(workData);
    });

    ipcRenderer.send("requestWorkData");
});

// Creates the dropdown
function renderDateDropdown() {
    var selectDropdown = document.getElementById('workDates');
    
    availableDates.forEach(dateItem => {
        var option = document.createElement("option");
        option.innerText = dateItem;
        option.setAttribute("value", "");

        selectDropdown.appendChild(option);
    });

    M.FormSelect.init(selectDropdown);
}