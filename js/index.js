var $wpm = $('#spritz_wpm');
var interval = 60000 / $wpm.val();
var paused = false;
var $space = $('#spritz_word');
var i = 0;
var night = false;
var zoom = 1;
var autosave = false;
var $words = $('#spritz_words');
var local_spritz = {};

function words_load() {
    local_spritz = {
      autosave: false,
      night: false,
      word: 0,
      words: "",
      wpm: "300",
      zoom: 1
    }
    $wpm.val(local_spritz.wpm);
    interval = 60000 / local_spritz.wpm;
    spritz_zoom(0);
    words_process();
    word_show(i);
    word_update();
    spritz_pause(true);
}


function words_process() {
  $text = $words.text();
  // Catch h2s and clean them up
  // Look for the anything between {{}} and replace any spaces in between
  // with a whitespace
  var h2_reg = /\{{([^}]+)\}}/igm;
  var h2_match = $words.text().match(h2_reg);
  for (var i = 0; i < h2_match.length; i++) {
    copied = h2_match[i];
    h2_match[i] = h2_match[i].replace(/ /g, '&#8192;');
    $text = $text.replace(copied, h2_match[i]);
  }
  // General text cleanup
  words = $text.trim()
      .replace(/[\r\n]/g, ' {linebreak} ')
      .replace(/[ \t]{2,}/g, ' ')
      .split(' ');
  // splice iterator
  var t = 0;
  for (spliced_word in words) {
    // some extra time if there is a comma
    if (words[t].indexOf(',') != -1) {
      words.splice(t + 1, 0, words[t]);
      t++;
    }
    // some extra time for the h2s
    if (words[t].indexOf('}') != -1) {
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      t++;
      t++;
      t++;
      t++;
    }
    // some extra time if there is a ;
    if (words[t].indexOf(';') != -1) {
      words.splice(t + 1, 0, words[t]);
      t++;
    }
    // some extra time if there is a ;
    if (words[t].indexOf('-') != -1) {
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      t++;
      t++;
    }
    // some extra time if there is a dot
    if (words[t].indexOf('.') != -1) {
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      t++;
      t++;
    }
    // some extra time if the word is long
    if (words[t].length > 9 && words[t].length < 15 && words[t].indexOf("{'images/") == 1) {
      words.splice(t + 1, 0, words[t]);
      t++;
    }
    // Pause on photos
    if (words[t].indexOf("{'images/") != -1) {
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      t++;
      t++;
      t++;
      t++;
      t++;
    }
    // some extra time for the H2s
    if (words[t].length > 20 && words[t].length > 10 && words[t].indexOf("{'images/") == 1) {
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      words.splice(t + 1, 0, words[t]);
      t++;
      t++;
      t++;
    }
    t++;
  }

  words_set(words);
}

function words_set(w) {
  for (var j = 1; j < w.length; j++) {
      w[j] = w[j].replace(/{linebreak}/g, '   ');
  }
}

function word_show(i) {
    $('#spritz_progress').width(100 * i / words.length + '%');
    var word = words[i];
    if (word.startsWith("{'images")) {
      replace_word = word;
      word = '&#8192;';
      image_now = replace_word.replace("{'", '');
      image_path = image_now.replace("'}", '');
      $('#image-display').animate({ duration: 5000 })
               .css({'background': 'url('+image_path+') no-repeat center center'});
    }
    word = word.replace('&#8192;', ' ');
    var stop = Math.round((word.length + 1) * 0.4) - 1;
    // if is not h2
    if (stop < 10) {
      $space.html('<div>' + word.slice(0, stop) + '</div><div>' + word[stop] + '</div><div>' + word.slice(stop + 1) + '</div>');
    } else {
      // this is an h2 so remove the {{}}
      $space.html('<div></div>' + word.replace('{{', '').replace('}}', '') + '<div></div>');
    }
}

function word_next() {
    i++;
    word_show(i);
}

function word_prev() {
    i--;
    word_show(i);
}

function word_update() {
    spritz = setInterval(function() {
        word_next();
        if (i + 1 == words.length) {
            setTimeout(function() {
                $space.html('');
                spritz_pause(true);
                i = 0;
                word_show(0);
            }, interval);
            clearInterval(spritz);
        };
    }, interval);
}

function spritz_pause(ns) {
  if (!paused) {
    clearInterval(spritz);
    paused = true;
    $('html').addClass('paused');
    if (autosave && !ns) {
        words_save();
    };
  }
}

function spritz_play() {
  word_update();
  paused = false;
  $('html').removeClass('paused');
}

function spritz_flip() {
  if (paused) {
    spritz_play();
  } else {
    spritz_pause();
  };
}

function spritz_speed() {
    interval = 60000 / $('#spritz_wpm').val();
    if (!paused) {
        clearInterval(spritz);
        word_update();
    };
    $('#spritz_save').removeClass('saved loaded');
}

function spritz_faster() {
    $('#spritz_wpm').val(parseInt($('#spritz_wpm').val()) + 50);
    spritz_speed();
}

function spritz_slower() {
    if ($('#spritz_wpm').val() >= 100) {
        $('#spritz_wpm').val(parseInt($('#spritz_wpm').val()) - 50);
    }
    spritz_speed();
}

function spritz_zoom(c) {
    zoom = zoom + c
    $('#spritz').css('font-size', zoom + 'em');
}

function spritz_select() {
    $words.select();
};



$('#spritz_wpm').on('input', function() {
    spritz_speed();
});

$("#spritz_pause").click(function() {
  $('body').animate({scrollTop: $("#spritz").offset().top});
  $('#image-display').css('height', '700px');
});

$('.controls').on('click', 'a, label', function() {
    switch (this.id) {
        case 'spritz_slower':
            spritz_slower();
            break;
        case 'spritz_faster':
            spritz_faster();
            break;
        case 'spritz_save':
            words_save();
            break;
        case 'spritz_pause':
            spritz_flip();
            break;
        case 'spritz_smaller':
            spritz_zoom(-0.1);
            break;
        case 'spritz_bigger':
            spritz_zoom(0.1);
            break;
        case 'spritz_autosave':
            spritz_autosave();
            break;
        case 'spritz_select':
            spritz_select();
            break;
    };
    return false;
});

words_load();
