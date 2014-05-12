// Filename: boxlet-test.js
// Timestamp: 2014.05.11-19:10:43 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)
// Requires: boxlet.js, beast.js

var test = {
  init : function () {

    // building an advanced component around beast
    var boxlet1 = boxlet({
      boxId : 'Boxlet',
      boxTitleId : 'BoxTitle',
      boxContentFullId : 'BoxContentFull',
      boxContentPrevId : 'BoxContentPrev'
    });

    var boxlet2 = boxlet({
      boxId : 'Boxlet2',
      boxTitleId : 'BoxTitle2',
      boxContentFullId : 'BoxContentFull2',
      boxContentPrevId : 'BoxContentPrev2'
    });

    function switchState (fn) {
      var b = boxlet.boxengine({ 
        frames : 6 
      });

      if (boxlet2.isOpen()) {
        b.fadeOut(boxlet1).fadeOut(boxlet2)
          .then().grow(boxlet1).shrink(boxlet2)
          .then().fadeIn(boxlet1).fadeIn(boxlet2);

        b.init(function () {      
          fn();
        });
      } else {
        b.fadeOut(boxlet1).fadeOut(boxlet2)
          .then().shrink(boxlet1).grow(boxlet2)
          .then().fadeIn(boxlet1).fadeIn(boxlet2);

        b.init(function () {      
          fn();
        });
      }
    }

    boxlet1.switchState = switchState;
    boxlet2.switchState = switchState;

    console.log('boxlet1');
  }
};

