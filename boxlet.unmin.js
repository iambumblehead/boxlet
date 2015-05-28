// Filename: boxlet.full.js  
// Timestamp: 2014/05/10 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com), Dan Pupius (www.pupius.co.uk)  

// Filename: domlt.js  
// Timestamp: 2013.12.24-17:13:49 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
//
// documentElement.getBoundingClientRect() is mature and widely supported:
// https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect

var domlt = function (el) {
  var rect = el.getBoundingClientRect();
  return [rect.left, rect.top];
};
// Filename: incrnum.js  
// Timestamp: 2013.10.22-11:32:49 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  

var incrnum = (function (uid, fn) {
  
  fn = function () { return uid++; };
  fn.toString = function () { return uid++; };

  return fn;

}(0));
// Filename: eventhook.js
// Timestamp: 2013.10.30-10:51:34 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)
// Requires: incrnum.js



var eventhook = (function () {

  var proto = {
    fnArr: [],

    addFn: function (fn) {
      if (typeof fn === 'function') {
        fn.oname = 'fn' + incrnum;
        this.fnArr.push(fn);
      }
    },

    rmFn: function (fn) {
      var oname = fn.oname;

      if (typeof fn === 'function') {
        this.fnArr = this.fnArr.filter(function (fn) {
          return fn.oname !== oname;
        });
      }
    },

    fire: function (a1,a2,a3,a4) {
      this.fnArr.map(function (fn) {
        fn(a1,a2,a3,a4);
      });
    }
  };

  return {
    proto : proto,
    getNew : function () {
      var that = Object.create(proto);
      that.fnArr = [];
      return that;
    }
  };

}());
// Filename: beast.js  
// Timestamp: 2013.12.24-16:37:55 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
// Requires: eventhook.js



var beast = (function (p) {

  var proto = {
    frames : 30,
    fpms : (30 / 1000),
    mspf : 0.03,
    timer : null,
    frameindex : 0,
    ngnArr : [],
    isKilled : false,
    isComplete : false,
    // st: 1 continue, 2 sleep, 3 reset, 4 kill
    st : 1, 

    onComplete : function (fn) {
      this.onCompleteHook.addFn(fn);
      return this;
    },

    onKill : function (fn) {
      this.onKillHook.addFn(fn);
      return this;
    },

    onBegin : function (fn) {
      this.onBeginHook.addFn(fn);
      return this;
    },

    updateNgnItems : function (frame) {
      this.ngnArr.map(function (ngn) {
        ngn.updatefn(frame);
      });    
    },

    initNgnItems : function (frames, opts) {
      frames = this.frames;
      this.ngnArr.map(function (ngn) {
        ngn.init(frames, ngn.opts);
        ngn.updatefn = ngn.getupdatefn(frames, ngn.opts);
      });
    },

    killNgnItems : function (frames, opts) {
      frames = this.frames;
      this.ngnArr.map(function (ngn) {
        ngn.kill(frames, ngn.opts);
      });
    },

    completeNgns : function (frames, opts) {
      frames = this.frames;
      this.ngnArr.map(function (ngn) {
        ngn.complete(frames, ngn.opts);
      });
    },

    applyFnComplete : function () {
      if (this.st === 1 || this.st === 4) {
        this.onCompleteHook.fire();
      }
    },

    applyFnKill : function () {
      this.onKillHook.fire();
    },

    applyFnBegin : function () {
      this.onBeginHook.fire();
    },

    updateNgns : function () {
      var that = this;

      that.updateNgnItems(that.frameindex);
      ++that.frameindex;
    },

    updateAnimationState : function () {
      var that = this;

      if (that.isKilled) {
        that.st = 3;
      } else if (that.frameindex >= that.frames) {
        that.st = 4;
      }
    },

    animate : function () {
      var my = this;
      (function nextFrame() {
        my.updateAnimationState();
        switch (my.st) {
        case 1: // continue
          my.updateNgns();
          my.timer = setTimeout(nextFrame, my.mspf);
          break;
        case 2: // sleep
          my.st = 1;
          break;
        case 3: // killed
          my.st = 3;
          my.kill();
          break;
        default: // completed
          my.st = 4;
          my.complete();
          break;
        }
      }());
    },

    complete : function () {
      var that = this;

      if (!that.isKilled && !that.isComplete) {
        that.isComplete = true;
        // ... for external call to kill loop
        that.st = 4;
        that.completeNgns();
        that.applyFnComplete();
      }
    },

    kill : function () {
      var that = this;
      
      if (!that.isKilled && !that.isComplete) {
        that.isKilled = true;
        that.st = 3;
        that.killNgnItems();
        that.applyFnKill();
      }
    },

    init : function (fn) {
      var that = this;

      if (typeof fn === 'function') {
        that.onComplete(fn);
      }

      if (that.st === 4) {
        that.st = 1;
        that.applyFnBegin();
        that.isKilled = false;
        that.isComplete = false;
        that.frameindex = 0;
        that.initNgnItems();
        that.animate();
      }
    },

    reinit : function () {
      var that = this;

      that.kill();
      that.st = 4;
      that.init();
    }
  };

  p = function (spec) {
    var that;

    that = Object.create(proto);
    that.timer = null;

    that.onCompleteHook = eventhook.getNew();
    that.onKillHook = eventhook.getNew();
    that.onBeginHook = eventhook.getNew();
    that.ngnArr = [];
    that.isKilled = false;
    that.isComplete = false;
    that.frameindex = 0;
    that.st = 4;

    that.frames = spec.frames || 30;
    that.fpms = (spec.fps || 30) / 1000;
    that.mspf = 1 / that.fpms; 
    return that;
  };

  p.proto = proto;

  return p;

}());

// Filename: elemst.js  
// Timestamp: 2013.12.16-00:25:06 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
//
// methods for handling "state" of an element through className:
//
// elemstate.up()
// elemstate.is()
// elemstate.rm()

var elemst = {

  // elemstate.up(elem, 'select-active');
  // - ensures `st-select-active` is defined on elem.className
  // - if `st-select-active` is defined on elem.className, elem is not modified
  // - if `st-select-\w*` is defined on elem.className, it is replaced.
  // 
  // all states are prefixed with `st-`
  // ex, 
  //  elemstate.up(elem, 'select-active'); // st-select-active
  //  elemstate.up(elem, 'active'); // st-active
  //
  // why? easier to identify and replace classNames associated with this script
  //
  // if a hyphen is given the word behind the first hyphen
  // is recognized as an *id*. word(s) after hyphen are the
  // *state*. if no hyphen, value is assumed to be *state*.
  //
  // Use of *id* allows one to store multiple states on a className, associating 
  // each with a different *id*, for example:
  //  `st-isselected-true st-isopen-true st-iscomplete-false`
  //
  // *id* is not required -this OK:
  //  `st-active`
  //
  up : function (elem, stateidStr) {
    var className, 
        newclass = 'st-' + stateidStr,
        stateid = (stateidStr || '').match(/(\w*(?:-)|\b)(\w*)/) || [],
        state = stateid[2],
        id = stateid[1] || '';

    if (elem && state) {
      className = elem.className;
      if (!className.match(newclass)) {
        stateid = new RegExp('st-' + '\(' + id + '\\w*\)');
        if (className.match(stateid)) {
          elem.className = className.replace(stateid, newclass);
        } else {
          elem.className = className + ' ' + newclass;
        }
      }
    }
  },

  // elemstate.rm(elem, 'select');
  // - removes entire word class with substring at index 0 matching stateidstr
  //
  // console.log(elem.className); // bttn st-select-active st-active
  // elemstate.rm(elem, 'select');
  // console.log(elem.className); // bttn st-active
  // elemstate.rm(elem, 'active');
  // console.log(elem.className); // bttn
  //
  rm : function (elem, stateidStr) {
    var className, 
        stateid = new RegExp('[\b ]st-' + stateidStr + '\(-\\w*\)?');

    if (elem) {
      className = elem.className;
      if (className.match(stateid)) {
        elem.className = className.replace(stateid, '');
      }
    }
  },

  is : function (elem, stateidStr) {
    return (elem && elem.className.match('st-' + stateidStr)) ? true : false;
  }
};
// Filename: beastplug.js  
// Timestamp: 2015.03.03-16:16:39 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
// Requires: elemst.js, beast.js



var beastplug = function (name, augmfn) {
  // redefine these values with plugin
  var pluginproto = {
    className : ':name-beast-animating',
    isclean : true,

    // convenience methods for use by plugins
    doframeloop : function (frames, fn) {
      for (var i = 0, step = frames - 1; i < frames; i++) fn(i/step, i);
    },
    getComputed : function (elem, style) {
      return getComputedStyle(elem, null).getPropertyValue(style);
    },
    getasfilleddimarr : function (arr1, arr2) {
      var isarr = Array.isArray;
      return [
        isarr(arr1) && typeof arr1[0] === 'number' ? arr1[0] : arr2[0],
        isarr(arr1) && typeof arr1[1] === 'number' ? arr1[1] : arr2[1]
      ];
    },
    isanimated : function (arr1, arr2, i) {
      return arr1[i] !== arr2[i];
    },

    // methods called at begin of animation for setup
    getdata : function (frames, opts) {},

    getupdatefn : function (frames, opts) {
      return function () {};
    },

    // methods called during the animation cycle
    init : function (frames, opts) {
      elemst.up(opts.elem, this.className);
      opts.oparr = this.getdata(frames, opts);
    },

    clean : function (frames, opts) {},

    kill : function (frames, opts) {
      elemst.rm(opts.elem, this.className);
      if (this.isclean) this.clean(frames, opts);
    },

    complete : function (frames, opts) {
      if (opts.classNameEnd) {
        elemst.up(opts.elem, opts.classNameEnd);
      }
      elemst.rm(opts.elem, this.className);
      if (this.isclean) this.clean(frames, opts);
    }
  };

  beast.proto[name] = function (opts) {
    var that = Object.create(pluginproto);
    
    augmfn(that);
    that.opts = opts;
    that.className = that.className.replace(/:name/, name);
    if (typeof opts.isclean === 'boolean') {
      that.isclean = opts.isclean;
    }
    this.ngnArr.push(that);

    return this;
  };
};
// Filename: curved.js
// Timestamp: 2013.12.26-21:18:26 (last modified)  
// Author(s): Dan Pupius (www.pupius.co.uk), Bumblehead (www.bumblehead.com)
//
// thanks to Daniel Pupius
// http://13thparallel.com/archive/bezier-curves/
//
// Bernstein Basis Function
// 1 = t + (1 - t)
//
// Bernstein Basis Function, cubed
// 1^3 = (t + (1 - t))^3
//
// Above Function, represented in terms of 1.
// » 1 = (t + (1 - t)) . (t^2 + 2t(1 - t) + (1 - t)^2)
// » 1 = t^3 + 3t^2(1 - t) + 3t(1 - t)^2 + (1 - t)^3
//
// each function
// B[1](t) = t^3
// B[2](t) = 3t^2(1 - t)
// B[3](t) = 3t(1 - t)^2
// B[4](t) = (1 - t)^3
//
// Where C is the control, and '[ ]' indicates subscript
// point = C[1]B[1](d) + C[2]B[2](d) + C[3]B[3](d) + C[4]B[4](d)
//
// change to the scripting at the link above:
// - given values are 'shifted' into a positive axis so that curves may be
//   generated when negative values are given.

var curved = (function () {

  function B1(t) { return t * t * t; }
  function B2(t) { return 3 * t * t * (1 - t); }
  function B3(t) { return 3 * t * (1 - t) * (1 - t); }
  function B4(t) { return (1 - t) * (1 - t) * (1 - t); }

  function getShift(x1, x2) {
    var min = Math.min(x1, x2);
    return min && -min;
  }

  // easeStr should be a string 'ease-end' or 'ease-bgn'
  return function (bgnCoord, endCoord, easeStr) {
    var shiftval = getShift(bgnCoord, endCoord),
        C1 = endCoord + shiftval,
        C4 = bgnCoord + shiftval,
        C2_3 = easeStr === 'end' ? C1 : C4;

    return function (per) {
      return Math.round(
        C1 * B1(per) +
        C2_3 * B2(per) +
        C2_3 * B3(per) +
        C4 * B4(per)
      ) - shiftval;
    };
  };

}());
// Filename: beastmove.js  
// Timestamp: 2015.03.03-16:18:22 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
// Requires: curved.js, elemst.js, beastplug.js, domlt.js
//
//
// ex,
//
// beast({ frames : 30 }).move({ 
//   elem : elem, 
//   ltbgn : [0, 0],
//   ltend : [200, 200]
// }).init();
//
// element should be styled 'absolute' and 'block'

beastplug('move', function (b) {

  b.getdata = function (frames, opts) {
    var elem = opts.elem,
        ease = opts.ease,
        ltcur = domlt(elem),
        ltbgn = b.getasfilleddimarr(opts.ltbgn, ltcur),
        ltend = b.getasfilleddimarr(opts.ltend, ltcur),
        ltarr = [],
        isl = b.isanimated(ltbgn, ltend, 0),
        ist = b.isanimated(ltbgn, ltend, 1),
        xcurve = isl && curved(ltbgn[0], ltend[0], ease),
        ycurve = ist && curved(ltbgn[1], ltend[1], ease);

    b.doframeloop(frames, function (per, frame) {
      ltarr.push([
        xcurve && xcurve(per),
        ycurve && ycurve(per)
      ]);    
    });

    b.isl = isl;
    b.ist = ist;
    b.ltarr = ltarr;
    return ltarr;
  };

  b.clean = function (frames, opts) {
    var style = opts.elem.style;
    style.top = '';
    style.left = '';
  };

  b.getupdatefn = function (frames, opts) {
    var stylestr = ':0px',
        ltarr = b.ltarr,
        style = opts.elem.style,
        isl = b.isl,
        ist = b.ist,
        lt;

    return function (frame) {
      lt = ltarr[frame];
      if (isl) style.left = stylestr.replace(/:0/, lt[0]);
      if (ist) style.top = stylestr.replace(/:0/, lt[1]);
    };
  };
});
// Filename: beastcolor.js  
// Timestamp: 2013.12.26-21:24:12 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
// Requires: elemst.js, curved.js, beastplug.js
//
//
// ex,
//
// beast({ frames : 30 }).color({ 
//   elem : elem, 
//   ease : 'out' 
//   bgnColor : '#aaf',
//   endColor : '#aaf',
//   endBackgroundColor : 'rgb("255", "255", "255")'
// }).init();


beastplug('color', function (b) {

  b.extractRGBarr = function (rgbStr) {
    if (rgbStr.match(/^#/)) {
      return rgbStr
        .replace(/^#(\w\w\w)$/, '$1$1')
        .match(/(\w\w)(\w\w)(\w\w)/)
        .slice(1, 4)
        .map(function (n) { return parseInt(n, 16); });
    } else if (rgbStr.match(/^rgba?/)) {
      return rgbStr
        .match(/^rgba?\((\d{1,3}), (\d{1,3}), (\d{1,3}),? ?(\d{1,3})?\)$/)
        .slice(1, 4)
        .map(function (n) { return parseInt(n, 10); });
    }
  };

  b.buildRGBarray = function (frames, opts, bgnRGB, endRGB) {
    var rgbarr = [],
        ease = opts.ease,
        bgnRGBarr = b.extractRGBarr(bgnRGB),
        endRGBarr = b.extractRGBarr(endRGB),
        rcurve = curved(bgnRGBarr[0], endRGBarr[0], ease),
        gcurve = curved(bgnRGBarr[1], endRGBarr[1], ease),
        bcurve = curved(bgnRGBarr[2], endRGBarr[2], ease);

    b.doframeloop(frames, function (per, frame) {
      rgbarr.push([
        rcurve(per), gcurve(per), bcurve(per)
      ]);
    });

    return rgbarr;
  };

  b.clean = function (frames, opts) {
    var style = opts.elem.style;
    style.backgroundColor = '';
    style.color = '';
  };

  b.getdata = function (frames, opts) {
    var elem = opts.elem,
        bgarr = [],
        fgarr = [],
        endfgrgb = opts.endColor || 
                     b.getComputed(elem, 'color'),
        endbgrgb = opts.endBackgroundColor || 
                     b.getComputed(elem, 'background-color'),
        bgnfgrgb = opts.bgnColor ||
                     b.getComputed(elem, 'color'),
        bgnbgrgb = opts.bgnBackgroundColor ||
                     b.getComputed(elem, 'background-color');


    opts.fgarr = b.buildRGBarray(frames, opts, bgnfgrgb, endfgrgb);
    opts.bgarr = b.buildRGBarray(frames, opts, bgnbgrgb, endbgrgb);
  };

  b.getupdatefn = function (frames, opts) {
    var bgarr = opts.bgarr,
        fgarr = opts.fgarr,
        style = opts.elem.style,
        rgbStr = "rgb(:r, :g, :b)",
        bg, fg;
    
    return function (frame) {
      bg = bgarr[frame];
      fg = fgarr[frame];

      style.backgroundColor = 
        rgbStr.replace(/:r/, bg[0]).replace(/:g/, bg[1]).replace(/:b/, bg[2]);
      style.color = 
        rgbStr.replace(/:r/, fg[0]).replace(/:g/, fg[1]).replace(/:b/, fg[2]);
    };
  };
});
// Filename: domopacity.js  
// Timestamp: 2013.12.22-20:53:15 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
//
// if undefined, getComputedStyle should be defined by polyfill.
//
// the 'is' method for the IE branch is from Garret Smith's APE library:
//   - http://www.highdots.com/forums/javascript/get-opacity-value-291932.html
//   - https://github.com/GarrettS/ape-javascript-library

var domopacity = (function (s, p, deffn) {
  
  s = document.documentElement.style;
  deffn = function () {};

  if ('opacity' in s) {
    p = function (elem, percent) {
      elem.style.opacity = percent;
    };
    p.rm = function (elem) {
      elem.style.opacity = '';
    };
    p.is = function (elem) {
      return getComputedStyle(elem, null).getPropertyValue('opacity');
    };
  } else if ('filter' in s) {
    p = function (elem, percent) {
      elem.style.filter = 'alpha(opacity=:o)'.replace(/:o/, percent * 100);
    };
    p.rm = function (elem) {
      elem.style.filter = '';
    };
    p.is = function (elem) {
      var re = /\Wopacity\s*=\s*([\d]+)/i,
          cs = elem.currentStyle, f, o;

      if (typeof cs === 'object') {
        f = cs.filter;
        if (!re.test(f)) {
          return 1;
        } else {
          o = re.exec(f);
          return o[1]/100;      
        }
      };
    };
  } else {
    p = p.rm = p.is = deffn;
  }
  
  return p;

}());
// Filename: beastfade.js  
// Timestamp: 2013.12.26-21:23:39 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
// Requires: elemst.js, curved.js, beastplug.js, domopacity.js
//
// 555 Smith Boulevard, #4459
// San Angelo, TX 76905
//
// ex,
//
// beast({ frames : 30 }).fade({ 
//   elem : elem, 
//   ease : 'bgn' 
// }).init();


beastplug('fade', function (b) {

  b.getdata = function (frames, opts) {
    var arr = [],
        bgn = +(domopacity.is(opts.elem, 'opacity') || 1) * 100,
        curve = curved(bgn, opts.endop, opts.ease);

    b.doframeloop(frames, function (per, frame) {
      arr.push(curve(per) / 100);
    });

    return arr;
  };

  b.clean = function (frames, opts) {
    domopacity.rm(opts.elem);    
  };

  b.getupdatefn = function (frames, opts) {
    var oparr = opts.oparr || [],
        elem = opts.elem;

    return function (frame) {
      domopacity(elem, oparr[frame]);
    };
  };

});
// Filename: domwh.js  
// Timestamp: 2015.01.03-17:27:17 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  

var domwh = (function (p, d, doc) {

  doc = typeof document !== 'undefined' && doc;

  p = function(elem) {
    var d, dims = [elem.offsetWidth, elem.offsetHeight];

    if (!dims[0]) {
      d = elem.style;      
      if (d.display === 'none') {
        d.display = 'block';
        dims = [elem.offsetWidth, elem.offsetHeight];
        d.display = 'none';
      } else if (d.display === '') {
        d.display = 'block';
        dims = [elem.offsetWidth, elem.offsetHeight];
        d.display = '';
      }
    }
    return dims;
  };

  p.window = function () {
    if (window && window.innerHeight) {
      return [window.innerWidth, window.innerHeight];
    } else if ((d = doc.documentElement)) {
      d = d.clientWidth ? d : doc.documentBody;
      return [d.clientWidth, d.clientHeight];
    } else {
      return null;
    }
  };

  return p;

}());
// Filename: beastshape.js  
// Timestamp: 2015.03.03-16:17:28 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
// Requires: curved.js, elemst.js, domwh.js, beastplug.js
//
//
// adds 'plugin' ability to the animation system here.
//

beastplug('shape', function (b) {

  b.getdata = function (frames, opts) {
    var elem = opts.elem,
        ease = opts.ease,
        whcur = domwh(elem),
        whbgn = b.getasfilleddimarr(opts.whbgn, whcur),
        whend = b.getasfilleddimarr(opts.whend, whcur),
        wharr = [],
        isw = b.isanimated(whbgn, whend, 0),
        ish = b.isanimated(whbgn, whend, 1),
        wcurve = isw && curved(whbgn[0], whend[0], ease),
        hcurve = ish && curved(whbgn[1], whend[1], ease);

    b.doframeloop(frames, function (per, frame) {
      wharr.push([
        wcurve && wcurve(per),
        hcurve && hcurve(per)
      ]);    
    });

    b.isw = isw;
    b.ish = ish;
    b.wharr = wharr;
    return wharr;
  };

  b.clean = function (frames, opts) {
    var style = opts.elem.style;
    style.width = '';
    style.height = '';
  };

  b.getupdatefn = function (frames, opts) {
    var stylestr = ':0px',
        wharr = b.wharr,
        style = opts.elem.style,
        isw = b.isw,
        ish = b.ish,
        wh;

    return function (frame) {
      wh = wharr[frame];
      if (isw) style.width = stylestr.replace(/:0/, wh[0]);
      if (ish) style.height = stylestr.replace(/:0/, wh[1]);
    };
  };
});

// Filename: domev.js
// Timestamp: 2015.02.23-11:51:35 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)

var domev = {
  getElemAt : function (e) {
    var fn = function () {};
    if (typeof e === 'object' && e) {
      if ('target' in e) {
        fn = function (ev) {
          return ev.target;
        };
      } else if ('srcElement' in e) {
        fn = function (ev) {
          return ev.srcElement;
        };
      }
    }
    return (domev.getElemAt = fn)(e);
  },

  stopDefaultAt : function (e) {
    var fn = function () {};
    if (typeof e === 'object' && e) {
      if (e.preventDefault) {
        fn = function (ev) {
          return ev.preventDefault();          
        };
      } else {
        fn = function (ev) {
          return ev.returnValue = false;          
        };
      }
    }
    return (domev.stopDefaultAt = fn)(e);
  },
  
  hasElem : function (e, elem, evelem) {
    evelem = this.getElemAt(e, elem);

    return elem && evelem 
        && (elem.isEqualNode(evelem) || elem.contains(evelem));  
  }
};


// Filename: lockfnthrottling.js
// Timestamp: 2015.04.08-18:22:12 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)
//
//
// The constructed function is called multiple times with callbacks.
// One callback is processed and then, during a specified period of time, 
// callbacks that are given afterward are ignored.
// 
// Intended for functions bound to events triggered rapidly many times.
// 
// lockFnThrottling = LockFnThrottling.getNew({ ms : 500 });
// lockFnThrottling(function () { console.log('go!') }); // go
// lockFnThrottling(function () { console.log('go!') });

var lockfnthrottling =
  ((typeof module === 'object') ? module : {}).exports = (function (f) {

  var throttle = {
    ms : 500,
    timer : null,
    lastFn : null,

    throttledFn : function (fn) {
      var that = this;

      if (that.timer) {
        that.lastFn = fn;
      } else {
        that.timer = setTimeout(function () {
          if (that.lastFn) {
            that.lastFn();
            that.lastFn = null;
          }
          clearTimeout(that.timer);
          that.timer = null;
        }, that.ms); 
        fn();
      }
    }
  };

  f = function (spec) {
    return f.getNew(spec);
  };

  f.getNew = function (spec) {
    var that = Object.create(throttle);
    that.ms = spec.ms || 500;
    that.timer = null;
    that.lastFn = null;
    return function (fn) { that.throttledFn(fn); };
  };
    
  return f;

}());
// Filename: lockfnrebounding.js
// Timestamp: 2015.04.17-15:50:49 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)
//
// first function is processed until a value is reached...
// during that time, future calls are rebounded until the function returns
// useful for button press or form submission calls

var lockfnrebounding =
  ((typeof module === 'object') ? module : {}).exports = (function (f) {

  var cache = {
    flag : false,

    go : function (fn) {
      var that = this, 
          flag = that.flag;

      if (flag === false) {
        that.flag = true;
        if (typeof fn === 'function') {
          fn(function () { that.flag = false; });
        } else {
          that.flag = false;
        }
      }
    }
  };

  f = function (getvalfn) {
    var rebound = f.getNew();

    return function () {
      var l = arguments.length,
          fn = arguments[--l],      
          args;

      fn = typeof fn === 'function' ? fn : false;
      args = [].slice.call(arguments, 0, fn ? l : ++l);

      rebound(function (exitfn) {
        args.push(function () {
          exitfn();
          if (typeof fn === 'function') {
            fn.apply(l, arguments);
          }
        });

        getvalfn.apply(l, args);
      });
    };
  };

  f.getNew = function () {
    var that = Object.create(cache);
    that.flag = false;
    return function (fn) { that.go(fn); };
  };

  return f;

}());
// Filename: lockfnexpiring.js
// Timestamp: 2015.04.16-17:42:42 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)
//
// auto-call a function after given period of time has passed.
// 
// useful if your script waits on a response from a server -expire
// the wait function after a few seconds.


var lockfnexpiring = function (fn, expirems) {
  var fnopen = true,
      expirefn = function () { fnopen && !(fnopen = false) && fn(); };

  setTimeout(expirefn, expirems);

  return expirefn;
};
// Filename: lockfnqueuing.js
// Timestamp: 2015.04.11-03:20:30 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)
//
// the returned function stores mulitple callbacks and processes them one after
// another -waiting for the first to complete before calling the next, useful
// for holding off execution of function bodies that add numerous calls to the 
// stack.
// 
// lockFnQueueing = LockFnQueuing.getNew();
// lockFnQueueing(callback, function (exitFn) {
//   x = 5;
//   exitFn(null, x);
// });

var lockfnqueuing = 
      ((typeof module === 'object') ? module : {}).exports = (function (f) {

  var cache = {
    isActive : false,
    fnArr : [],
    getValArr : [],

    callLimit : function () {
      var that = this, 
          onValArr = that.fnArr, 
          getValArr = that.getValArr;

      (function nextCall (x, getVal, onVal) {
        getVal = getValArr.shift();
        onVal = onValArr.shift();
        getVal(function (a, b, c) {
          if (onVal) onVal(a, b, c);
          if (getValArr.length) {
            nextCall(getValArr.length);            
          } else {
            that.isActive = false;
          }
        });
      }(getValArr.length));
    },

    queueAdd : function (onValFn, getValFn) {
      var that = this;
      that.fnArr.push(onValFn);
      that.getValArr.push(getValFn);
      if (that.isActive === false) {
        that.isActive = true;
        that.callLimit();
      }
    }
  };

  f = function (getvalfn) {
    var o = function () {
      var l = arguments.length,
          fn = arguments[--l],
          args = [].slice.call(arguments, 0, l);

      if (typeof fn !== 'function') {
        throw new Error('last param must be function');
      }

      o.lock(fn, function (exitfn) {
        args.push(exitfn);
        getvalfn.apply(l, args);
      });
    };
    return (o.lock = f.getNew()) && o;
  };

  f.getNew = function () {
    var that = Object.create(cache);
    that.isActive = false;
    that.fnArr = [];
    that.getValArr = [];
    return function (onValFn, getValFn) { 
      that.queueAdd(onValFn, getValFn); 
    };
  };

  return f;

}());
// Filename: lockfncaching.js
// Timestamp: 2015.04.11-03:30:08 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)
//
// gets a value with getValFn, then calls onValFn(err, res)
// multiple requests made to the returned function are served
// a value that is once-only generated by onValFun
// 
// --------------------------------------------------------
// var fncaching = lockfncaching.getNew();
// var onValFn = function (err, val) {
//   console.log(null, val);
// };
// fncaching(onValFn, function getValFn (exitFn) {
//   exitFn(null, 3);
// });
// 
// "null, 3"
//

var lockfncaching = (function (f) {

  var cache = {
    val : undefined,
    isActive : false,
    funcArr : [],

    callFuncArr : function (err, blocks) {
      var that = this, funcArr = that.funcArr;
      that.isActive = false;
      while (funcArr.length) funcArr.pop()(err, blocks);
    },

    // persists the returned value with this object
    cacheVal : function (onValFunc, getValFunc) {
      var that = this, val = that.val;

      that.funcArr.push(onValFunc);
      if (that.isActive === false) {
        that.isActive = val === undefined;
        if (typeof val === 'undefined') {
          getValFunc(function (err, newVal) {
            if (err) return that.callFuncArr(err, newVal);
            that.callFuncArr(err, (that.val = newVal));
          });
        } else {
          that.callFuncArr(null, val);
        }
      }
    }
  };

  // lock = lockfncaching.namespace(function (arg1, arg2, arg3, fn) {
  //   doasync(arg1, arg2, arg3, fn);
  // });
  // 
  // lock(a1, a2, a3, function (err, res) {
  //   console.log(res);
  // });
  //
  // lock(a1, a2, a3, function (err, cachedres) {
  //   console.log(res);
  // })
  f = function (getvalfn) {
    var o = function () {
      var l = arguments.length,
          fn = arguments[--l],
          args = [].slice.call(arguments, 0, l);

      if (typeof fn !== 'function') {
        throw new Error('last param must be function');
      }

      o.lock(fn, function (exitfn) {
        args.push(exitfn);
        getvalfn.apply(l, args);
      });
    };

    return (o.clear = function () { 
      return (o.lock = f.getNew()) && o;
    })();
  };

  // lock = lockfncaching.namespace(function (arg1, arg2, arg3_namespace, fn) {
  //   doasync(arg1, arg2, arg3, fn);
  // });
  // 
  // lock(a1, a2, a3, function (err, res) {
  //   console.log(res);
  // });
  //
  // lock(a1, a2, a3, function (err, cachedres) {
  //   console.log(res);
  // })
  f.namespace = function (getvalfn) {
    var o = function () {
      var l = arguments.length,
          fn = arguments[--l],
          name = arguments[--l],
          args = [].slice.call(arguments, 0, ++l);

      if (typeof fn !== 'function') {
        throw new Error('last param must be function');
      } else if (typeof name !== 'string') { 
        throw new Error('name param must be function');           
      }

      o.lock(name, fn, function (exitfn) {
        args.push(exitfn);
        getvalfn.apply(l, args);
      });
    };

    return (o.clear = function () { 
      return (o.lock = f.getNamespaceNew()) && o;
    })();
  };

  f.getNew = function () {
    var that = Object.create(cache);
    that.isActive = false;
    that.funcArr = [];
    that.val = undefined;
    return function (onValFunc, getValFunc) { 
      that.cacheVal(onValFunc, getValFunc); 
    };
  };

  f.getNamespaceCache = (function () {
    return function (namespace, namespacesObj) {
      return namespacesObj[namespace] ||
        (namespacesObj[namespace] = f.getNew());
    };
  }());

  f.getNamespaceNew = function () {
    var namespacesobj = {};
    return function (namespace, onValFunc, getValFunc) { 
      f.getNamespaceCache(namespace, namespacesobj)(onValFunc, getValFunc);
    };
  };

  return f;

}());
// Filename: lockfn.js
// Timestamp: 2015.04.17-16:29:19 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)
// Requires: 
// lockfncaching.js, 
// lockfnqueuing.js, 
// lockfnexpiring.js,
// lockfnrebounding.js, 
// lockfnthrottling.js







var lockfn = {
  queuing : lockfnqueuing,
  caching : lockfncaching,
  expiring : lockfnexpiring,
  rebounding : lockfnrebounding,
  throttling : lockfnthrottling
};
// Filename: lsn.js
// Timestamp: 2014.04.05-17:03:14 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)

var lsn = (function (de, deffn, o, p) {

  function isMethod (o) {
    return /^(?:function|object|unknown)$/.test(typeof o) ? true : false;
  }

  de = typeof document === 'undefined' || document.documentElement;
  deffn = function () {};

  o = {
    add : (function (fn) {
      if (isMethod(de.addEventListener)) {
        fn = function (el, e, fn) {
          el.addEventListener(e, fn, false);
        };
      } else if (isMethod(de.addatchEvent)) {
        fn = function (el, e, fn) {
          el.attachEvent('on'+e, function (e) {
            fn(e || window.event);
          });
        };
      }
      return fn || deffn;
    }()),

    rm : (function (fn) {
      if (isMethod(de.removeEventListener)) {      
        fn = function (el, e, fn) {
          el.removeEventListener(e, fn, false);
        };
      } else if (isMethod(de.detachEvent)) {      
        fn = function (el, e, fn) {
          el.detachEvent('on'+e, fn);
        };
      }
      return fn || deffn;
    }())
  };

  p = o.add;
  p.rm = o.rm;

  return p;
}());


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


var boxlet = (function (boxengine) {


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
// Filename: boxlet.full.js  
// Timestamp: 2014.05.10-21:11:34 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  
// Requires: boxlet.js
//
// placeholder file for directing boxlet build
