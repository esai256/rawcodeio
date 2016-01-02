var isMac = /mac/i.test(navigator.platform);
var ctrlKey = 17, vKey = 86, cKey = 67;

window.addEventListener('keydown', function(e) {

    // alt + space
    if (e.keyCode === 32 && e.altKey) {
      e.preventDefault();
      if($(".globalsearch").hasClass("visible")){
        $(".globalsearch").removeClass("visible")
      }else{
        $(".globalsearch").addClass("visible");
        $(".globalsearch input").focus();
      }
    }

    $(document).on("click", ".globalsearch-close", function(){
      $(".globalsearch").removeClass("visible");
    });

    // alt + n
    if (e.keyCode === 78 && e.altKey) {
      // e.preventDefault();
      window.location.href="/snippets/create";
    }

    // alt + c
    // if(e.keyCode === 67 && e.altKey) {
    //   e.preventDefault();
    //   console.log("copy");
    //   $(".toClipboard").click();
    // }

    // // alt + t
    // if(e.keyCode === 84 && e.altKey) {
    //   e.preventDefault();
    // }

    // // alt + s
    // if(e.keyCode === 83 && e.altKey) {
    //   e.preventDefault();
    // }


});



/*

alt + space = search anywhere
alt + n = create new snippet
alt + s = save snippet
alt + t =


*/