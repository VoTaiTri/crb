$(document).ready(function() {
  setTimeout(function() {
    $('.hide-flash').fadeOut('normal');
  }, 4000);

  var current_user_id = $('body').data('current-user-id');
  var view_type = localStorage.getItem("view_type");
  var now = new Date();
  var day_now = now.getDate();
  var month_now = now.getMonth();
  if(day_now<10){
    day_now = "0" + day_now;
  };
  if(month_now<10){
    month_now = "0" + month_now;
  };
  var date_time_now = now.getFullYear() + '-' + month_now + '-' day_now;
  var current_time = now.getHours() + ':' + now.getMinutes();
  if(current_time <= "07:00"){
    var dtp_min_time = "07:00";
  }else{
    var dtp_min_time = current_time;
  };
  var dtp_allow_time = ['07:00','07:15','07:30','07:45','08:00','08:15','08:30','08:45',
                        '09:00','09:15','09:30','09:45','10:00','10:15','10:30','10:45',
                        '11:00','11:15','11:30','11:45','12:00','12:15','12:30','12:45',
                        '13:00','13:15','13:30','13:45','14:00','14:15','14:30','14:45',
                        '15:00','15:15','15:30','15:45','16:00','16:15','16:30','16:45',
                        '17:00','17:15','17:30','17:45','18:00','18:15','18:30','18:45',
                        '19:00','19:15','19:30','19:45','20:00','20:15','20:30','20:45',
                        '21:00','21:15','21:30','21:45','22:00','22:15','22:30','22:45'];

  $('#calendar').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaFourDay,agendaDay'
    },
    views: {
      agendaFourDay: {
        type: 'agenda',
        duration: {days: 4},
        buttonText: '4 days'
      }
    },
    defaultView: view_type == "undefined" ? "month" : view_type,
    defaultDate: new Date(),
    editable: true,
    eventLimit: true,
    weekends: false,
    height: $(window).height() - $("header").height() - $("footer").height() - 60,
    minTime: "07:00:00",
    maxTime: "22:00:00",
    allDaySlot: false,
    editable: true,
    eventLimit: true,
    keepOpen: false,
    selectable: true,
    selectHelper: true,
    events: function(start, end, timezone, callback) {
      $.ajax({
        url: '/schedules.json',
        type: 'GET',
        success: function(doc) {
          var events = [];
          if(doc.schedules){
            $.map(doc.schedules, function(schedule) {
              events.push({
                id: schedule.id,
                title: schedule.title,
                start: schedule.start_time,
                end: schedule.finish_time,
                user_id: schedule.user_id,
                room: schedule.room_name,
              });
            });
          }
          callback(events);
        }
      });
    },
    select: function (start, end, jsEvent, view) {
      if((view.type != 'month') && (start._d >= (new Date()))) {
        $("#modal-form").modal('show');
        $('#start-time').datetimepicker('setDate', start._d);
        $('#finish-time').datetimepicker('setDate', end._d);
      }
      else {
        $('#calendar').fullCalendar('unselect');
      }  
    },
    eventRender: function (event, element) {
      time_start = "From: " + event.start.format('HH:mm') + "-";
      time_end = "To: " + event.end.format('HH:mm');
      
      btn_edit = "<a href='schedules/" + event.id + "/edit'>Edit</a>";
      btn_delete = "<a href='schedules/" + event.id + "' data-method='delete' data-confirm='You sure?'>Delete</a>"; 
      btn_detail = "<a href='schedules/" + event.id + "'>Detail</a>"
      if (!event.url) {
        if(event.user_id == current_user_id) {
          element.popover({
            placement: 'top',
            html:true,                        
            title: "<b>Title: " + event.title + "</b><br/><br/>" + time_start + time_end + "</br>Room: " + event.room,
            content: "<table style='border-style:hidden;'><tr><td>" + btn_detail + "</td><td>" + btn_edit + "</td><td>" + btn_delete + "</td></tr></table>",
          });
        }else {
          element.popover({
            placement: 'top',
            html:true,                        
            title: "<b>Title: " + event.title + "</b><br/><br/>" + time_start + time_end + "</br>Room: " + event.room,
            content: "<table style='border-style:hidden;'><tr><td>" + btn_detail + "</td></tr></table>",
          });
        };
        $('body').on('click', function (e) {
          if (!element.is(e.target) && element.has(e.target).length === 0 && $('.popover').has(e.target).length === 0)
          element.popover('hide');
        });
      }           
    },
    dayClick: function(date, jsEvent, view) {
      if((view.type == 'month' && date.format() >= (new Date()).toISOString().slice(0, 10)) || date._d >= (new Date())) {
        $("#modal-form").modal('show');
        var TimeZoned = new Date(date.toDate().setTime(date.toDate().getTime() + (date.toDate().getTimezoneOffset() * 60000)));
        $('#start-time').datetimepicker('setDate', TimeZoned);
      }
    },
    viewRender: function(view, element) { 
      localStorage.setItem("view_type", view.type);
    }
  });

  $("#modal-form").on('hidden.bs.modal', function(){
    $(this).find('form')[0].reset();
    $(".select-members").select2("val", "");
    $("#error_explanation").remove();
  });

  $('#start-datetime').datetimepicker({
    format: 'Y-m-d H:i',
    maxTime: '23:00',
    allowTimes: dtp_allow_time,
    minDate: new Date(),
    format: 'Y-m-d H:i',
    // minTime: dtp_min_time,
    onShow:function(ct){
      this.setOptions({
        maxDate: $('#finish-datetime').val()?new Date((($('#finish-datetime').val()).split(" "))[0]):false,
        maxTime: (($('#start-datetime').val() && $('#finish-datetime').val() && ((($('#finish-datetime').val()).split(" "))[0] == (($('#start-datetime').val()).split(" "))[0])))?(($('#finish-datetime').val()).split(" "))[1]:false,
        // minTime: ($('start-datetime').val() && ((($('#start-datetime').val()).split(" "))[0] == date_time_now))?dtp_min_time:false,
      })
    },
  }).on("changeDate", function (e) {
    var TimeZoned = new Date(e.date.setTime(e.date.getTime() + (e.date.getTimezoneOffset() * 60000)));
    $('#finish-datetime').datetimepicker('setDate', TimeZoned);
  });

  $('#finish-datetime').datetimepicker({
    format: 'Y-m-d H:i',
    maxTime: '23:00',
    allowTimes: dtp_allow_time,
    onShow:function(ct){
      this.setOptions({
        minDate: $('#start-datetime').val()?new Date((($('#start-datetime').val()).split(" "))[0]):new Date,
        minTime: (($('#start-datetime').val())||($('#start-datetime').val() && $('#finish-datetime').val() && ((($('#finish-datetime').val()).split(" "))[0] == (($('#start-datetime').val()).split(" "))[0])))?(($('#start-datetime').val()).split(" "))[1]:dtp_min_time
      })
    },
  }).on("changeDate", function (e) {
    var TimeZoned = new Date(e.date.setTime(e.date.getTime() + (e.date.getTimezoneOffset() * 60000)));
    $('#finish-datetime').datetimepicker('setDate', TimeZoned);
  });

  $('.select-room').select2({
    width: 300
  });

  $('.select-members').select2({
    width: "100%"
  });
});
