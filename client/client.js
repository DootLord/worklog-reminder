const { ipcRenderer } = require('electron');
let submitBtn = document.getElementById("submitWork");
let viewBtn = document.getElementById("viewWork");
let workTable = document.getElementById("workTable");
let timeValue = null;


document.addEventListener('DOMContentLoaded', function () {
    var timeDropdown = document.getElementById("timeDropdown");
    var modal = document.querySelectorAll('.modal');
    M.Modal.init(modal, {});
    M.FormSelect.init(timeDropdown, {});

    timeDropdown.addEventListener("change", function () {
        ipcRenderer.invoke("timeValue", this.value);
    });

    ipcRenderer.on("getTimeValue", (event, arg) => {
        timeValue = arg;
        console.log(timeValue);
    });

    ipcRenderer.send("requestTimeValue");
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
    var dateTitle = document.getElementById("workDate");
    var workData;

    ipcRenderer.on("workData", function (event, args) {
        workData = args.data;
        dateTitle.innerText = args.date;
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
