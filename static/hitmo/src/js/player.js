$(function () {


    //
    // player
    //




    //var savedVolume = localStorage.volume || 100;
    var savedVolume = getCookie("vol") || 100;
    var tmpVolume = 100;
    var $myPlayer = $('#jquery_jplayer');

    if(is_mobile_ua())
    {
        savedVolume = 100;
    }

    var arrOfPlaylist = [];

    var myPlaylist = new jPlayerPlaylist({
            jPlayer: $myPlayer,
            cssSelectorAncestor: "#jp_container"
        },

        arrOfPlaylist,

        {
            useStateClassSkin: true,
            playlistOptions: {
                displayTime: 0,
                addTime: 0,
                removeTime: 0,
                shuffleTime: 0
            },
            loop: true,
            volume: (savedVolume/100),

            play: function (e) {
                setTrackData(e);

                // синхроним классы паузы и играющего итема
                var $playlistCurrent = $('a.jp-playlist-current');
                var $plcID = $playlistCurrent.data('id');

                $('.mustoggler_paused').removeClass('mustoggler_paused');
                $('.mustoggler_playing').removeClass('mustoggler_playing');

                $('[data-musid=' + $plcID + ']').addClass('mustoggler_playing');
            },

            pause: function (e) {
                var $currentPlaying = $('.mustoggler_playing');

                $currentPlaying.addClass('mustoggler_paused');
            },

            loadstart: function (e) {
                setTrackData(e);
                //setPlayerVolume(savedVolume);
            },

            timeupdate: function (e) {
                //синхроним время песни в плеере с итемом
                var $timeInPlayer = $('.jp-current-time').html();
                var $currenDurDiv = $('.mustoggler_playing').find('.track__duration');

                $currenDurDiv.html($timeInPlayer);
            }
        });

    $(".jp-volume-bar").slider({
        range: "min",
        min: 0,
        max: 100,
        value: savedVolume,

        slide: function (event, ui) {
            setPlayerVolume(ui.value);
            saveVolume(ui.value);
        }
    });

    $(".jp-track-durbar").slider({
        range: "min",
        min: 0,
        max: 100,
        value: 0,

        slide: function (event, ui) {
            $myPlayer.jPlayer("playHead", ui.value);
        },

        create: function () {
            $myPlayer.jPlayer("option", "cssSelector.seekBar", '.jp-track-durbar');
            $myPlayer.jPlayer("option", "cssSelector.playBar", ".jp-track-durbar .ui-slider-range");
        }
    });

    function setTrackData(e) {
        var title = e.jPlayer.status.media.title,
            poster = e.jPlayer.status.media.poster,
            artist = e.jPlayer.status.media.artist,
            $trackInfo = $('.jp-track-info');

        $trackInfo.find('.jp-track-info__track').text(title);
        $trackInfo.find('.jp-track-info__artist').text(artist);
        $trackInfo.find('.jp-track-info__img').css('background-image', 'url("' + poster + '")');
    };

    function setPlayerVolume(vol) {
        var $volBtn = $('.jp-volume-ico');

        (vol > 0) ? $volBtn.removeClass('muted') : $volBtn.addClass('muted');

        $myPlayer.jPlayer("volume", vol / 100);
    };

    function saveVolume(vol) {
        //localStorage.volume = vol;
        setCookie("vol", vol, {expires: (365*86400)})
    };

    function getCurrentVolume() {
        //return (localStorage.volume || 100);
        return (getCookie("vol") || 100);
    };



    $('.jp-volume-ico').on('click', function () {
        var $this = $(this);
        var isMuted = $this.hasClass('muted');

        if (isMuted) {

            $(".jp-volume-bar").slider("value", tmpVolume);
            setPlayerVolume(tmpVolume);
            saveVolume(tmpVolume)

        } else {

            tmpVolume = getCurrentVolume();

            $(".jp-volume-bar").slider("value", 0);
            setPlayerVolume(0);
            saveVolume(0);

        }
        ;
    });

    //$('.mustoggler').on('click', function (e) {
    $(document).on('click', '.mustoggler', function (e) {
        e.stopPropagation();
        e.preventDefault();

        var $this = $(this);
        var $musList = $this.closest('.muslist');
        var $musItems = $musList.find('.mustoggler');
        var $playlistItems;
        var arOfData = [];
        var id = $this.data('musid');
        var indexInList = false;
        var currentPlaying = $this.hasClass('mustoggler_playing');
        var currentPlayingAndPause = currentPlaying && $this.hasClass('mustoggler_paused');

        //актив класс на кнопке ините музыки
        $('.mustoggler_playing').removeClass('mustoggler_playing');
        $this.addClass('mustoggler_playing');

        //сбор массива данных
        $musItems.each(function () {
            var $this = $(this);
            var data = $this.data('musmeta');
            arOfData.push(data);
        });

        //добавление трека в лист
        arOfData.forEach(function (el) {
            var $playlistItems = $('.jp-playlist-item');
            var arrIDInPlaylist = [];
            var canBeAdded = true;

            //сбор имеющихся айди треков
            $playlistItems.each(function (index, item) {
                arrIDInPlaylist.push($(item).data('id'));
            });

            // проверка на уникальность
            arrIDInPlaylist.forEach(function (id) {
                if (id == el.id) {
                    canBeAdded = false;
                }
            });

            // если уже есть в списке, не добавляем
            if (canBeAdded) {
                myPlaylist.add({
                    title: el.title,
                    artist: el.artist,
                    mp3: el.url,
                    poster: el.img,
                    id: el.id
                });
            }
            ;
        });

        $playlistItems = $('.jp-playlist-item');
        indexInList = $playlistItems.filter('[data-id="' + id + '"]').closest('li').index();

        if (currentPlayingAndPause) {

            myPlaylist.play();

        } else if (currentPlaying) {

            myPlaylist.pause();

        } else {

            myPlaylist.select(indexInList);
            myPlaylist.play();

        }
    });

    //$('.mustoggler').on('click', 'a, button', function (e) {
    $(document).on('click', '.mustoggler a, .mustoggler button', function (e) {
        e.stopPropagation();
    });

    //
    // player ... end;
    //

    $('.jp-play').one('click', function (e) {
        var $playlistItems = $('.jp-playlist-item');
        if ($playlistItems.length == 0) {
            $('.mustoggler:first').click();
        }
    });

    var jp_hq_active = getCookie("hq") || "0";
    if(jp_hq_active != "0")
    {
        $('.jp-hq').addClass('active');
    }


    $(document).on('click', '.jp-hq', function (e) {
        var $this = $(this);
        var is_active = $this.hasClass('active');

        if(is_active) {
            $this.removeClass('active');
            setCookie("hq", 0, {expires: (365*86400)});
        }
        else {
            $this.addClass('active');
            setCookie("hq", 1, {expires: (365*86400)});
        }
    });

    // возвращает cookie с именем name, если есть, если нет, то undefined
    function getCookie(name) {
      var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function setCookie(name, value, options) {
      options = options || {};
      options.path = '/';

      var expires = options.expires;

      if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
      }
      if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
      }

      value = encodeURIComponent(value);

      var updatedCookie = name + "=" + value;

      for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
          updatedCookie += "=" + propValue;
        }
      }

      document.cookie = updatedCookie;
    }

    function is_mobile_ua()
    {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    }




});