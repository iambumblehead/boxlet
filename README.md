boxlet
======
**(c)[Bumblehead][0], 2014** [MIT-license](#license)

### Overview:

Scripted open/shut behaviour for transitioned box content. Behaviour is customizable but specific markup is required. Behaviours may include animated changes to background and foreground color, opacity, size and visibility.

Animated content activity of one box (note that titles are animatable also):
 ![screenshot][1]

Mulitple box animations may be coordinated as well:
 ![screenshot][2]

Boxlet does not use CSS3. It modifies each element with [beast.js][3]. An advantage is that multiple animations may be synchronised and callbacks may be used when they complete.

For tablets, phones and older IE browsers... in many use-cases beast performs with no observable 'choppiness'. If choppiness is experienced try more conservative frames and fps values.

Boxlet originates from a single-page checkout developed for [Ties.com][4]. Shipping, billing etc -each stage of the checkout process used a different box -this increased conversions.

[1]: https://github.com/iambumblehead/boxlet/raw/master/img/boxlet-animation-1.png
[2]: https://github.com/iambumblehead/boxlet/raw/master/img/boxlet-animation-2.png
[3]: https://github.com/iambumblehead/beast
[4]: http://ties.com

---------------------------------------------------------
#### <a id="install"></a>Install:

boxlet may be downloaded directly or installed through `npm`.

 * **npm**

 ```bash
 $ npm install boxlet
 ```

 * **Direct Download**
 
 ```bash
 $ git clone https://github.com/iambumblehead/boxlet.git
 ```

Boxlet is meant to be npm-installed and deployed with [scroungejs][3]. Alternatively, this repository contains two ready-to-use files, [boxlet.min.js][6] and [boxlet.unmin.js][7].

Run `npm start` to build a sample boxlet page and to see an advanced component constructed around boxlet as an example.


[3]: https://github.com/iambumblehead/scroungejs          "scroungejs"
[6]: http://github.com/iambumblehead/boxlet/raw/master/boxlet.min.js
[7]: http://github.com/iambumblehead/boxlet/raw/master/boxlet.unmin.js

---------------------------------------------------------
#### <a id="test"></a>Test:

Tests are not automated and are performed by loading a document in the browser and using the browser console.

- load `test/index.html` in your browser and run tests from the console.

---------------------------------------------------------
#### <a id="get-started">GET STARTED:

The demo boxlet uses the following markup:
```html
    <div id="Boxlet" class="boxlet st-content-preview">
      <div id="BoxTitle" class="boxlet-title">
        title
      </div>

      <div id="BoxContentPrev" class="boxlet-content-preview st-show-open">
        <div class="boxlet-content-preview-bd">
          <p>content</p>
        </div>
      </div>

      <div id="BoxContentFull" class="boxlet-content-main st-show-shut">
        <div class="boxlet-content-main-bd">
          content main
        </div>
      </div>
    </div>
```

When markup is available in the document, include boxlet scripts and call them:
```javascript
var boxlet1 = boxlet({
    boxId : 'Boxlet',
    boxTitleId : 'BoxTitle',
    boxContentFullId : 'BoxContentFull',
    boxContentPrevId : 'BoxContentPrev'
});
```

For synchronized boxlet animation see the test files.

---------------------------------------------------------
#### <a id="license">License:

 ![scrounge](http://github.com/iambumblehead/scroungejs/raw/master/img/hand.png) 

(The MIT License)

Copyright (c) 2014 [Bumblehead][0] <chris@bumblehead.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
