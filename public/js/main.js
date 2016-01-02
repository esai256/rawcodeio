$(function(){

  /* ====================================================
  FRONTPAGE - STARTSCREEN
  ==================================================== */

  if($("input[type='search']")){
    $("input[type='search']").blur();
    $("input[type='search']").focus();
  }

  $(document).on("click", ".dropdown-wrap .currentvalue", function(){
    $(this).parent().toggleClass("open");
  });

  $(document).on("click", ".dropdown a", function(evnt){
    evnt.preventDefault();
    $(this).closest($(".dropdown-wrap")).find("input[type='hidden']").val($(this).attr("data-value"));
    $(this).closest($(".dropdown-wrap")).find(".currentvalue").text("");
    $(this).closest($(".dropdown-wrap")).find(".currentvalue").text($(this).attr("data-value"));
    $(this).closest($(".dropdown-wrap")).removeClass("open");
  })

    $(document).on("change", ".newcontent textarea", function(){
      $(this).css("background-image", "none");
    });


    $(document).on("click", ".snippetlanguage .header", function(){
      $("#languagelist").toggleClass("visible");
    });

    $(document).on("click", "#languagelist ul li", function(){
      $(".snippetlanguage .header input").val($(this).text());
      $("#languagelist ul li").not(this).removeClass();
      $(this).toggleClass("active");
      $("#languagelist").removeClass("visible");
    });

    $(document).on("click", ".tt-suggestion", function(){
      $("#language").val($(this).text());
    });


  /* ====================================================
    LISTPANEL
    ==================================================== */
  $(document).on("click", ".menubtn", function(evnt){
    $("#listpanel").toggleClass("visible");

    var docH = $(document).height();
    $("#listpanel").css("height", docH+"px");

    $(this).toggleClass('open');
    $("#pagewrap").toggleClass("pushed");
  });

  /* ====================================================
    NEWSSTUFF
    ==================================================== */

  if($("body").hasClass("news")){
    var num = $(".cntr").text();
    $("li").each(function(index){
      if(index <= num){
        $(".newsmodule li:nth-of-type("+index+")").prepend("<span class='newnews'>New</span>");
      }
    });
  }

  /* ====================================================
    LINK TO GITHUB
    ==================================================== */
    $("#linkgithubform").submit(function(event) {
      event.preventDefault();
      if($("#githubpw").val() != "" && $("#githubusername").val() != ""){

        var $this = $(this);
        $.post(
          $this.attr("action"),
          $this.serialize(),
          function(data) {
             notify(data, null);
            $("#linkgithubform").css("display", "none");
            $(".linkgithub").append('<p class="alrdylinked">Your account is already linked to GitHub!</p>');
          },"text");
      }else{
        notify("Please enter your GitHub credentials.", null);
      }
    });


  /* ====================================================
    UPVOTE SNIPPET
    ==================================================== */
  $(document).on("click", ".voteup", function(evnt){
    evnt.preventDefault();

    var url = window.location.href.split('/');

    $.ajax({
      method: "POST",
      url: "/snippets/voteup",
      data: { snippetid: url[4] }
    }).done(function( res ) {

        var curr = $(".num").text();
        $(".num").text(parseInt(curr)+1);

        $(".notification .msg").text(res);
        $(".notification").addClass("visible").delay(2000).queue(function(next){
          $(this).removeClass("visible");
          next();
        });
    });
  });


  /* ====================================================
    DOWNVOTE SNIPPET
    ==================================================== */
  $(document).on("click", ".votedown", function(evnt){
    evnt.preventDefault();

    var curr = $(".num").text();
    var url = window.location.href.split('/');

    if(parseInt(curr) > 0){
      $.ajax({
        method: "POST",
        url: "/snippets/votedown",
        data: { snippetid: url[4] }
      }).done(function( res ) {

        $(".num").text(parseInt(curr)-1);

        $(".notification .msg").text(res);
        $(".notification").addClass("visible").delay(2000).queue(function(next){
          $(this).removeClass("visible");
          next();
        });

      });
    }
  });


  /* ====================================================
    ADDITIONAL SNIPPET INFO
    ==================================================== */
  $(document).on("click", "a[href='#addinfo']", function(evnt){
    evnt.preventDefault();
    $(".snippetinfo").toggleClass("visible");
  });


  /* ====================================================
    DROP SNIPPET FROM FILE
    ==================================================== */
  var dropZone = document.querySelector('body');
  var fileContentPane = document.querySelector('#content');

  // Event Listener for when the dragged file is over the drop zone.
  dropZone.addEventListener('dragover', function(e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();

    e.dataTransfer.dropEffect = 'copy';
  });

  // Event Listener for when the dragged file enters the drop zone.
  dropZone.addEventListener('dragenter', function(e) {
    this.classList.add("over");
  });

  // Event Listener for when the dragged file leaves the drop zone.
  dropZone.addEventListener('dragleave', function(e) {
    this.classList.remove("over");
  });

  // Event Listener for when the dragged file dropped in the drop zone.
  dropZone.addEventListener('drop', function(e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();

    this.classList.remove("over");

    var fileList = e.dataTransfer.files;

    if (fileList.length > 0) {
      $("#content").val("");
      $("#content").css("background-image", "none");
      readTextFile(fileList[0]);
    }
  });


  // Read the contents of a file.
  function readTextFile(file) {
    var reader = new FileReader();

    reader.onloadend = function(e) {
      if (e.target.readyState == FileReader.DONE) {
        var content = reader.result;
        fileContentPane.value = content;
      }
    }
    reader.readAsBinaryString(file);
  }

  /* ====================================================
    DRAG-HELPER
    ==================================================== */
  function onDragStart(event) {
      event.dataTransfer.setData('text/html', null); //cannot be empty string
  }

  if(document.getElementById("draghandler")){
    document.getElementById("draghandler").addEventListener('dragstart', function(event){
      event.dataTransfer.setData('text/html', null);
    });
  }

  /* ====================================================
    DRAG SINGLE SNIPPET AROUND
    ==================================================== */
    var dragIcon = document.createElement('img');
    dragIcon.src = '/img/dragicon.png';


      if(document.querySelector('#draghandler')){
        document.querySelector('#draghandler').addEventListener('dragstart', function(e) {

        // originalEvent
        if($("body").hasClass("loggedin")){
          document.querySelector('#listpanel').className = "visible";
          var docH = $(document).height();
          $("#listpanel").css("height", docH+"px");
        } // end if has bodyClass "loggedin"
        e.dataTransfer.setDragImage(dragIcon, 40, 20);

        var drop = document.querySelector('code').textContent;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text', drop);
          e.dataTransfer.setData('id', $(this).attr("data-id"));
          elementDragged = this;
        });
      }

      // Drag finished
      if($("#draghandler").length > 0){
        document.getElementById("draghandler").addEventListener('dragend', function(e) {
          elementDragged = null;
          $("#listpanel").removeClass("visible");
          $("#overlay").removeClass("visible");
        });
      }

      // Drop event in listpanel
      $('.droparea').on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).css("transform", "scale(1.1)");
      });

      $('.droparea').on('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();

      });

      $('.droparea').on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).css("transform", "scale(1)");
      });


      /* ====================================================
        CREATE NEW LIST
        ==================================================== */
      $(document).on("click", "#newlistpanel #savebtn", function(e){
        e.preventDefault();
        if($("#newlistpanel #listname").val().length > 0){
          $.ajax({
            method: "POST",
            url: "/lists/create",
            data: {
              listname: $("#newlistpanel #listname").val(),
              listid: $("#newlistpanel #listid").val(),
              listinfo: $("#newlistpanel #listinfo").val(),
              onoffswitch: $("#newlistpanel #onoffswitch").val()
            }
          }).done(function( res ) {
            $("#newlistpanel").removeClass("visible");
            notify(res, null);
            elementDragged = null;
          });
        }else{
          notify("Your new list must have a name!", null);
        }

      });

      /* ====================================================
        ADD SNIPPET TO LIST
        ==================================================== */
      $(".droparea").on("drop", function(e){
        if(e.originalEvent.dataTransfer){
          var snippetID = e.originalEvent.dataTransfer.getData("id");
          var listID = $(this).attr("data-listID");
          $("#listid").val(snippetID);

          // if = new list
          // else = add to list
          if($(this).hasClass("newlist")){

            $("#newlistpanel").addClass("visible");

          } else {

            $("#listpanel").removeClass("visible");
            $("#overlay").removeClass("visible");

            $.ajax({
              method: "POST",
              url: "/lists/add",
              data: {
                snippetid: snippetID,
                listid: listID
              }
            }).done(function( res ) {
              notify(res, null);
              elementDragged = null;
            });

          }

        }
      });

      $(document).on("click", "#cancelnewlist", function(evnt){
        evnt.preventDefault();
        $("#newlistpanel").removeClass("visible");
      });



  /* ====================================================
    API AJAX CALLS
    ==================================================== */

    $(document).on("click", ".dropdown a", function(e){
      e.preventDefault();

      if($(this).text() == "Public" && $("#getsnippets").hasClass("active")){
        getSnippets("");
        $("#searchtype").val("pubsnippets");
        $("input[name='searchterm']").attr("placeholder", "Search public snippets");
      }

      if($(this).text() == "Private" && $("#getsnippets").hasClass("active")){
        getSnippets("priv");
        $("#searchtype").val("privsnippets");
        $("input[name='searchterm']").attr("placeholder", "Search private snippets");
      }

      if($(this).text() == "Public" && $("#getlists").hasClass("active")){
        getLists("");
        $("#searchtype").val("publists");
        $("input[name='searchterm']").attr("placeholder", "Search public lists");
      }

      if($(this).text() == "Private" && $("#getlists").hasClass("active")){
        getLists("priv");
        $("#searchtype").val("privlists");
        $("input[name='searchterm']").attr("placeholder", "Search private lists");
      }
    });

    // Get snippets
    $(document).on("click", "#getsnippets", function(e){
      e.preventDefault();

      $("#getlists").removeClass("active");
      if(!$(this).hasClass("switch")){
        $(this).addClass("active");
      }
      if($(".currentvalue").text() == "Public"){
        getSnippets("");
        $("#searchtype").val("pubsnippets");
        $("input[name='searchterm']").attr("placeholder", "Search public snippets");
      }else if($(".currentvalue").text() == "Private"){
        getSnippets("priv");
        $("#searchtype").val("privsnippets");
        $("input[name='searchterm']").attr("placeholder", "Search private snippets");
      }else{
        getSnippets("");
        $("#searchtype").val("pubsnippets");
        $("input[name='searchterm']").attr("placeholder", "Search public snippets");
      }
    });

    // Get lists
    $(document).on("click", "#getlists", function(e){
      e.preventDefault();

      $("#getsnippets").removeClass("active");
      $(this).addClass("active");
      if($(".currentvalue").text() == "Public"){
        getLists("");
        $("#searchtype").val("publists");
        $("input[name='searchterm']").attr("placeholder", "Search public lists");
      }else if($(".currentvalue").text() == "Private"){
        getLists("priv");
        $("#searchtype").val("privlists");
        $("input[name='searchterm']").attr("placeholder", "Search private lists");
      }else{
        getLists("");
        $("#searchtype").val("publists");
        $("input[name='searchterm']").attr("placeholder", "Search public lists");
      }
    });


    var url = window.location.href.split('/');

    function getSnippets(priv){
      $.ajax({
        method: "GET",
        url: "/api/"+priv+"snippets/"+url[4]
      }).done(function(res) {
        console.log(res);
        $(".grid").html("");
        res.forEach(function(el, index){
          if(el != null){
            var pub;
            if(!el.public) var pub = "private";
            var created = new Date(el.created),
                lang = el.language
            $(".grid").append('<div class="item '+pub+'"><div class="inner"><a href="/snippets/'+el._id+'" class="inneritem"><span class="'+el.language.toLowerCase()+' lang">  '+lang+' </span><h2>'+el.name+'</h2><p>'+el.info.split(/\s+/,10).join(" ") +' ...</p></a></div></div>');
          }
        });

      });
    }

    function getLists(priv){
      $.ajax({
        method: "GET",
        url: "/api/"+priv+"lists/"+url[4]
      }).done(function( res ) {
        $(".grid").html("");
        res.forEach(function(el, index){
          if(el != null){
            var created = new Date(el.created);
            $(".grid").append('<div class="item list"><div class="inner"><a href="/lists/'+el._id+'" class="inneritem clearfix"><div class="listicon"></div><div class="listadditional"><h3>'+el.name +'</h3><p>'+el.info.split(/\s+/,10).join(" ") +' ...</p></div></a></div></div>');
          }
        });

      });
    }


    /* ====================================================
      LIST INFO OVERLAY
    ==================================================== */
    $(document).on("click", ".item.listinfos", function(){
      $(".listinfo-overlay").addClass("visible");
    });

    $(document).on("click", ".listinfo-overlay-close", function(){
      $(".listinfo-overlay").removeClass("visible");
    });


    /* ====================================================
        CLIPBOARD
    ==================================================== */
    var clipboard = new Clipboard('.toClipboard');

    clipboard.on('success', function(e) {
      notify("Snippet was copied to clipboard.", null);
      e.clearSelection();
    });

    clipboard.on('error', function(e) {
      notify("There was error cpoying your snippet.", null);
    });

    /* ====================================================
        SAVE USER PREFERENCES
    ==================================================== */


    $(document).on("click", "#saveprefbtn", function(e){
      e.preventDefault();

        var syntaxselect = $("#syntaxselect").val(),
            fontselect = $("#fontselect").val(),
            fontsize = $("#fontsize").val();

      $.ajax({
        method: "POST",
        url: "/users/savepref",
        data:{
          colorscheme: syntaxselect,
          font: fontselect,
          fontsize: fontsize
        }
      }).done(function(res) {

      notify(res, null);
      $(".setting-example code").css("font-size", fontsize+" !important");

      });

    });

    /*
    * Preference preview
    */
    $(document).on("change", "#syntaxselect", function(e){
      var lnk=document.createElement('link');
      lnk.href="/css/hljs/"+$("#syntaxselect").val()+'.css';
      lnk.rel='stylesheet';
      lnk.type='text/css';
      (document.head||document.documentElement).appendChild(lnk);
    });

    $(document).on("change", "#fontselect", function(e){
      var lnk=document.createElement('link');
      lnk.href="/snippetfonts/"+$("#fontselect").val()+'.css';
      lnk.rel='stylesheet';
      lnk.type='text/css';
      (document.head||document.documentElement).appendChild(lnk);
    });

    $(document).on("change", "#fontsize", function(e){
      $("head style").remove();
      $(".setting-example code").css("font-size", $(this).val()+"px");
    });

    /* ====================================================
      NOTIFICATIONS
    ==================================================== */
    function notify(msg, type){
      $(".notification .msg").text(msg);
      $(".notification").addClass("visible").delay(2000).queue(function(next){
        $(this).removeClass("visible");
        next();
      });
    }



    /* ====================================================
      USER SETTINGS
    ==================================================== */

    $(document).on("click", ".usersettingsmenu a", function(){
      var part = $(this).attr("href").substr(1);

      $(".rightside > div").removeClass("active");
      $(".usersettingsmenu a").removeClass("active");

      $(".settings-"+part+"").addClass("active");
      $(this).addClass("active");

    });


    /* ====================================================
      IMPORT FROM GITHUB
      ==================================================== */

    $(".importgithub form").submit(function(event) {
      event.preventDefault();
      if($("#githubpw").val() != "" && $("#githubusername").val() != ""){
        $(".spinner").addClass("visible");
        var $this = $(this);
        $.post(
          $this.attr("action"),
          $this.serialize(),
          function(data) {
             notify(data, null);
            $(".spinner").removeClass("visible");
          },"text");
      }else{
        notify("Please enter your GitHub credentials to import", null);
      }
    });


    /* ====================================================
      FUN
      ==================================================== */

    // GTB
    var day = new Date(),
        hr = day.getHours();
    if(hr>=23){
      $(".avatar").append("<div class='latework'></div>");
      $(".usermenu ul").append("<li class='gtb'>It's past 11 o'clock!<br>We won't be mad if you go to sleep. Promise.</li>")
    }



      // console.log("%cRAW\n%cCODE", "color:#333; font-size: 94px; line-height: 82px; font-weight:900; border:none;", "color:#333; font-size:70px;");



});