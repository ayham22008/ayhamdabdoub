 const calendar = document.getElementById("calendar");
    const monthYear = document.getElementById("monthYear");
    const modal = document.getElementById("eventModal");
    const modalDate = document.getElementById("modalDate");
    const modalEvent = document.getElementById("modalEvent");
    const eventsContainer = document.getElementById("events");
    const legend = document.getElementById("legend");

    let currentDate = new Date();
    function renderCalendar() {
      calendar.innerHTML = "";
      let year = currentDate.getFullYear();
      let month = currentDate.getMonth();

      let firstDay = new Date(year, month, 1).getDay();
      let lastDate = new Date(year, month + 1, 0).getDate();
      let today = new Date();

      const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
      const days = ["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"];

      monthYear.textContent = months[month] + " " + year;
      days.forEach(d => {
        const div = document.createElement("div");
        div.classList.add("day", "header");
        div.textContent = d;
        calendar.appendChild(div);
      });

      for (let i=0;i<firstDay;i++){ calendar.appendChild(document.createElement("div")); }

      for (let d=1; d<=lastDate; d++){
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const div = document.createElement("div");
        div.classList.add("day");
        div.textContent = d;

        zones.forEach(z => {
          if (new Date(dateStr) >= new Date(z.start) && new Date(dateStr) <= new Date(z.end)) div.classList.add(z.class);
        });

        if(events[dateStr]){
          div.classList.add("event", events[dateStr].type);
          div.onclick = () => openModal(dateStr);
        } else {
          div.onclick = () => openModal(dateStr);
        }

        if(today.getDate() === d && today.getMonth() === month && today.getFullYear() === year) div.classList.add("today");
        calendar.appendChild(div);
      }
      renderLegend();
      renderEvents();
      
    }
function renderLegend(){
      legend.innerHTML = "";
      const items = [
        { color: "#e1f8fe", label: "الفصل الاول" },
        { color: "#f5e5f0", label: "الفصل الثاني" },
        { color: "#fff3e0", label: "الفصل الصيفي" },
        { color: "#e0e2ff", label: "الامتحانات النصفية" },
        { color: "#ffe7e0", label: "الامتحانات النهائية" },
        { color: "#f0ffe0", label: "فترة تسجيل " }
      ];
      items.forEach(it=>{
        let div = document.createElement("div");
        div.classList.add("legend-item");
        div.innerHTML = `<span class="legend-color" style="background:${it.color}"></span>${it.label}`;
        legend.appendChild(div);
      });
    }
    function renderEvents(){
      eventsContainer.innerHTML = "";
      const upcoming = Object.keys(events).filter(d => new Date(d) >= new Date()).sort();
      if(upcoming.length===0){ eventsContainer.innerHTML="<p>لا توجد أحداث قادمة.</p>"; return; }

      let grouped = {};
      upcoming.forEach(d=>{
        let dateObj = new Date(d);
        let monthName = dateObj.toLocaleString("ar-EG", { month: "long" });
        let yearNumber = dateObj.getFullYear(); 
        let monthYearStr = `${monthName} ${yearNumber}`;

        if(!grouped[monthYearStr]) grouped[monthYearStr]=[];
        grouped[monthYearStr].push(d);
      });

      for(let m in grouped){
        const monthTitle = document.createElement("h3");
        monthTitle.textContent = m;
        monthTitle.style.color = "#2e7d32";
        eventsContainer.appendChild(monthTitle);

        grouped[m].forEach(d=>{
          const div = document.createElement("div");
          div.classList.add("event-item", events[d].type);
          div.textContent = `${d}: ${events[d].title}`;
          eventsContainer.appendChild(div);
        });
      }
    }

    

   
function openModal(dateStr) {
  modal.style.display = "block";
  modalDate.textContent = dateStr;

  let zoneLabel = ""; 

  if (events[dateStr]) {
    modalEvent.textContent = events[dateStr].title;
  } else {
    zones.forEach(z => {
      if (new Date(dateStr) >= new Date(z.start) && new Date(dateStr) <= new Date(z.end)) {
        zoneLabel = z.label;
      }
    });

    if (zoneLabel) {
      modalEvent.textContent = zoneLabel;
    } else {
      modalEvent.textContent = "لا يوجد أحداث في هذا اليوم.";
    }
  }
}



    function closeModal() {
      modal.style.display = "none";
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        closeModal();
      }
    }

    function prevMonth() {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    }
    function nextMonth() {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    }

    renderCalendar();

 
