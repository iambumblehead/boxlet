// Filename: boxlet.js
// Timestamp: 2015.05.28-11:09:11 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)
// Requires: lsn.js, lockfn.js, elemst.js, domev.js,
// beast.js, beastshape.js, beastfade.js, beastcolor.js, beastmove.js
//
// show boxlet-contet-prev or boxlet-content-full
// hide one boxlet-content when the other is shown.
//
// +-----------------------------+
// |  boxlet                     |
// |   +---------------------+   |
// |   | boxlet-title        |   | 
// |   +---------------------+   |
// |   +---------------------+   |
// |   |                     |   |
// |   | boxlet-content-prev |   | 
// |   |                     |   | 
// |   |                     |   | 
// |   +---------------------+   |
// |   +---------------------+   |
// |   |▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓|   | 
// |   | boxlet-content-full |   | 
// |   |▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓|   | 
// |   |▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓|   | 
// |   +---------------------+   |
// |                             |
// +-----------------------------+
//
// +-----------------------------+
// |  boxlet                  +  |
// |                             |
// |     preview content         |
// |     foo bar baz             |
// |                             |
// +-----------------------------+
//
// +-----------------------------+
// |  boxlet                  -  |
// |▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓|
// |▓▓▓▓ full content ▓▓▓▓▓▓▓▓▓▓▓|
// |▓▓▓▓ foo bar baz ▓▓▓▓▓▓▓▓▓▓▓▓|
// |▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓|
// +-----------------------------+


var boxlet = ((typeof module === 'object') ? module : {}).exports = (function (boxengine) {


  boxengine = (function () {

    var proto = {
      beast : null,

      getContentFullElem : function (box) {
        return box.getContentFullElem();
      },

      getContentPrevElem : function (box) {
        return box.getContentPrevElem();
      },      
      
      fadeOut : function (box) {
        var that = this,
            beast = that.beast;

        if (box) {
          beast.fade({
            classNameEnd : 'vis-hide',
            ease : 'end',
            elem : that.getContentFullElem(box), 
            endop : 0
          }).fade({
            classNameEnd : 'vis-hide',
            ease : 'end',
            elem : that.getContentPrevElem(box), 
            endop : 0
          });
        }

        return that; 
      },

      fadeIn : function (box) {
        var that = this,
            beast = that.beast;

        
        if (box) {
          beast.fade({
            classNameEnd : 'vis-show',
            elem : that.getContentFullElem(box), 
            endop : 100
          }).fade({
            classNameEnd : 'vis-show',
            elem : that.getContentPrevElem(box), 
            endop : 100
          });
        }

        return that; 
      },

      shrink : function (box) {
        var that = this,
            beast = that.beast;

        if (box) {
          beast.shape({
            elem : that.getContentFullElem(box),
            ease : 'end',
            whend : [null,0],
            classNameEnd : 'show-shut'
          }).shape({
            elem : that.getContentPrevElem(box),
            ease : 'end',
            whbgn : [null,0],
            classNameEnd : 'show-open'
          });
        }

        return that; 
      },

      grow : function (box) {
        var that = this,
            beast = that.beast;

        if (box) {
          beast.shape({
            elem : that.getContentFullElem(box),
            ease : 'end',
            whbgn : [null,0],
            classNameEnd : 'show-open'
          }).shape({
            elem : that.getContentPrevElem(box),
            ease : 'end',
            whend : [null,0],
            classNameEnd : 'show-shut'
          });
        }

        return that; 
      },

      then : function () {
        var that = this,
            newbeast = boxengine(that.beast);

            
        that.beast.onComplete(function () {
          newbeast.init();
        });

        return newbeast;
      },

      init : function (fn) {
        var that = this;
        that.beast.init(fn);
        return that;         
      }
    };
  
    var p = function (opts) {
      var that = Object.create(proto);
      that.beast = beast(opts);

      if (opts.getContentPrevElem) {
        that.getContentPrevElem = opts.getContentPrevElem;
      }

      if (opts.getContentFullElem) {
        that.getContentFullElem = opts.getContentFullElem;
      }      

      return that;
    };

    p.proto = proto;
    p.boxengine = boxengine;

    return p;
  }());


  var proto = {
    boxId : '',
    boxTitleId : '',
    boxContentFullId : '',
    boxContentPrevId : '',
    shape : null,
    fade : null,
    beast : null,

    getEBI : function (id) {
      return document.getElementById(id);        
    },
  
    getBoxletElem : function () {
      return this.getEBI(this.boxId);
    },

    getTitleElem : function () {
      return this.getEBI(this.boxTitleId);
    },

    getContentFullElem : function () {
      return this.getEBI(this.boxContentFullId);
    },

    getContentPrevElem : function () {
      return this.getEBI(this.boxContentPrevId);
    },

    showFull : function (fn) {
      var that = this,
          elem = that.getBoxletElem();

      var b = boxengine({ 
        frames : 6 
      });

      b.fadeOut(this)
        .then().grow(this)
        .then().fadeIn(this);

      b.init(function () {      
        if (typeof fn === 'function') {
          fn();
        }
      });
    },

    showPrev : function (fn) {
      var that = this,
          elem = that.getBoxletElem();


      var b = boxengine({ 
        frames : 6 
      });

      b.fadeOut(that)
        .then().shrink(that)
        .then().fadeIn(that);

      b.init(function () {     
        fn(null, 'done');
      });
    },

    isOpen : function () {
      var elem = this.getContentFullElem();
      return elem && elemst.is(elem, 'show-open');
    },

    switchState : function (fn) {
      var that = this;

      if (that.isOpen()) {
        that.showPrev(fn);
      } else { 
        that.showFull(fn);
      }
    },

    reboundSwitchState : function (boxlet) {
      var that = this;

      that.reboundfn(function (exitfn) {
        that.switchState(function () {
          exitfn();
        });
      });
    },

    attach : function () {
      var that = this, 
          boxTitleElem = that.getTitleElem();

      that.reboundfn = lockfn.rebounding.getNew();

      lsn(boxTitleElem, 'click', function (e) {
        that.reboundSwitchState();
        return domev.stopDefaultAt(e);
      });
    }
  };

  var p = function (spec) {
    var that = Object.create(proto);
    that.boxId = spec.boxId;
    that.reboundfn = null;
    that.boxTitleId = spec.boxTitleId;
    that.boxContentFullId = spec.boxContentFullId;
    that.boxContentPrevId = spec.boxContentPrevId;
    that.attach();
    return that;
  };

  p.boxengine = boxengine;
  p.proto = proto;

  return p;

}());
