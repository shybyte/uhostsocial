/**
 * @license AngularJS v0.9.19
 * (c) 2010-2011 AngularJS http://angularjs.org
 * License: MIT
 */
'use strict';
(function(window, document, undefined){

////////////////////////////////////

if (typeof document.getAttribute == $undefined)
  document.getAttribute = function() {};

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.lowercase
 * @function
 *
 * @description Converts string to lowercase
 * @param {string} string String to be lowercased.
 * @returns {string} Lowercased string.
 */
var lowercase = function (string){ return isString(string) ? string.toLowerCase() : string; };


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.uppercase
 * @function
 *
 * @description Converts string to uppercase.
 * @param {string} string String to be uppercased.
 * @returns {string} Uppercased string.
 */
var uppercase = function (string){ return isString(string) ? string.toUpperCase() : string; };


var manualLowercase = function (s) {
  return isString(s)
      ? s.replace(/[A-Z]/g, function (ch) {return fromCharCode(ch.charCodeAt(0) | 32); })
      : s;
};
var manualUppercase = function (s) {
  return isString(s)
      ? s.replace(/[a-z]/g, function (ch) {return fromCharCode(ch.charCodeAt(0) & ~32); })
      : s;
};


// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods with
// correct but slower alternatives.
if ('i' !== 'I'.toLowerCase()) {
  lowercase = manualLowercase;
  uppercase = manualUppercase;
}

function fromCharCode(code) { return String.fromCharCode(code); }


var _undefined        = undefined,
    _null             = null,
    $$element         = '$element',
    $$scope           = '$scope',
    $$validate        = '$validate',
    $angular          = 'angular',
    $array            = 'array',
    $boolean          = 'boolean',
    $console          = 'console',
    $date             = 'date',
    $element          = 'element',
    $function         = 'function',
    $length           = 'length',
    $name             = 'name',
    $noop             = 'noop',
    $null             = 'null',
    $number           = 'number',
    $object           = 'object',
    $string           = 'string',
    $value            = 'value',
    $selected         = 'selected',
    $undefined        = 'undefined',
    NG_EXCEPTION      = 'ng-exception',
    NG_VALIDATION_ERROR = 'ng-validation-error',
    NOOP              = 'noop',
    PRIORITY_FIRST    = -99999,
    PRIORITY_WATCH    = -1000,
    PRIORITY_LAST     =  99999,
    PRIORITY          = {'FIRST': PRIORITY_FIRST, 'LAST': PRIORITY_LAST, 'WATCH':PRIORITY_WATCH},
    Error             = window.Error,
    /** holds major version number for IE or NaN for real browsers */
    msie              = parseInt((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1], 10),
    jqLite,           // delay binding since jQuery could be loaded after us.
    jQuery,           // delay binding
    slice             = [].slice,
    push              = [].push,
    error             = window[$console]
                           ? bind(window[$console], window[$console]['error'] || noop)
                           : noop,

    /** @name angular */
    angular           = window[$angular] || (window[$angular] = {}),
    /** @name angular.markup */
    angularTextMarkup = extensionMap(angular, 'markup'),
    /** @name angular.attrMarkup */
    angularAttrMarkup = extensionMap(angular, 'attrMarkup'),
    /** @name angular.directive */
    angularDirective  = extensionMap(angular, 'directive'),
    /** @name angular.widget */
    angularWidget     = extensionMap(angular, 'widget', lowercase),
    /** @name angular.validator */
    angularValidator  = extensionMap(angular, 'validator'),
    /** @name angular.fileter */
    angularFilter     = extensionMap(angular, 'filter'),
    /** @name angular.formatter */
    angularFormatter  = extensionMap(angular, 'formatter'),
    /** @name angular.service */
    angularService    = extensionMap(angular, 'service'),
    angularCallbacks  = extensionMap(angular, 'callbacks'),
    nodeName_,
    rngScript         = /^(|.*\/)angular(-.*?)?(\.min)?.js(\?[^#]*)?(#(.*))?$/,
    uid               = ['0', '0', '0'],
    DATE_ISOSTRING_LN = 24;

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.forEach
 * @function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection. The collection can either
 * be an object or an array. The `iterator` function is invoked with `iterator(value, key)`, where
 * `value` is the value of an object property or an array element and `key` is the object property
 * key or array element index. Optionally, `context` can be specified for the iterator function.
 *
 * Note: this function was previously known as `angular.foreach`.
 *
   <pre>
     var values = {name: 'misko', gender: 'male'};
     var log = [];
     angular.forEach(values, function(value, key){
       this.push(key + ': ' + value);
     }, log);
     expect(log).toEqual(['name: misko', 'gender:male']);
   </pre>
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {function()} iterator Iterator function.
 * @param {Object} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */
function forEach(obj, iterator, context) {
  var key;
  if (obj) {
    if (isFunction(obj)){
      for (key in obj) {
        if (key != 'prototype' && key != $length && key != $name && obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
      obj.forEach(iterator, context);
    } else if (isObject(obj) && isNumber(obj.length)) {
      for (key = 0; key < obj.length; key++)
        iterator.call(context, obj[key], key);
    } else {
      for (key in obj)
        iterator.call(context, obj[key], key);
    }
  }
  return obj;
}

function forEachSorted(obj, iterator, context) {
  var keys = [];
  for (var key in obj) keys.push(key);
  keys.sort();
  for ( var i = 0; i < keys.length; i++) {
    iterator.call(context, obj[keys[i]], keys[i]);
  }
  return keys;
}


function formatError(arg) {
  if (arg instanceof Error) {
    if (arg.stack) {
      arg = (arg.message && arg.stack.indexOf(arg.message) === -1) ?
            'Error: ' + arg.message + '\n' + arg.stack : arg.stack;
    } else if (arg.sourceURL) {
      arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
    }
  }
  return arg;
}

/**
 * @description
 * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
 * characters such as '012ABC'. The reason why we are not using simply a number counter is that
 * the number string gets longer over time, and it can also overflow, where as the the nextId
 * will grow much slower, it is a string, and it will never overflow.
 *
 * @returns an unique alpha-numeric string
 */
function nextUid() {
  var index = uid.length;
  var digit;

  while(index) {
    index--;
    digit = uid[index].charCodeAt(0);
    if (digit == 57 /*'9'*/) {
      uid[index] = 'A';
      return uid.join('');
    }
    if (digit == 90  /*'Z'*/) {
      uid[index] = '0';
    } else {
      uid[index] = String.fromCharCode(digit + 1);
      return uid.join('');
    }
  }
  uid.unshift('0');
  return uid.join('');
}

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.extend
 * @function
 *
 * @description
 * Extends the destination object `dst` by copying all of the properties from the `src` object(s) to
 * `dst`. You can specify multiple `src` objects.
 *
 * @param {Object} dst The destination object.
 * @param {...Object} src The source object(s).
 */
function extend(dst) {
  forEach(arguments, function(obj){
    if (obj !== dst) {
      forEach(obj, function(value, key){
        dst[key] = value;
      });
    }
  });
  return dst;
}


function inherit(parent, extra) {
  return extend(new (extend(function(){}, {prototype:parent}))(), extra);
}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.noop
 * @function
 *
 * @description
 * Empty function that performs no operation whatsoever. This function is useful when writing code
 * in the functional style.
   <pre>
     function foo(callback) {
       var result = calculateResult();
       (callback || angular.noop)(result);
     }
   </pre>
 */
function noop() {}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.identity
 * @function
 *
 * @description
 * A function that does nothing except for returning its first argument. This function is useful
 * when writing code in the functional style.
 *
   <pre>
     function transformer(transformationFn, value) {
       return (transformationFn || identity)(value);
     };
   </pre>
 */
function identity($) {return $;}


function valueFn(value) {return function(){ return value; };}

function extensionMap(angular, name, transform) {
  var extPoint;
  return angular[name] || (extPoint = angular[name] = function (name, fn, prop){
    name = (transform || identity)(name);
    if (isDefined(fn)) {
      extPoint[name] = extend(fn, prop || {});
    }
    return extPoint[name];
  });
}

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isUndefined
 * @function
 *
 * @description
 * Checks if a reference is undefined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is undefined.
 */
function isUndefined(value){ return typeof value == $undefined; }


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isDefined
 * @function
 *
 * @description
 * Checks if a reference is defined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is defined.
 */
function isDefined(value){ return typeof value != $undefined; }


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isObject
 * @function
 *
 * @description
 * Checks if a reference is an `Object`. Unlike in JavaScript `null`s are not considered to be
 * objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 */
function isObject(value){ return value!=null && typeof value == $object;}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isString
 * @function
 *
 * @description
 * Checks if a reference is a `String`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `String`.
 */
function isString(value){ return typeof value == $string;}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isNumber
 * @function
 *
 * @description
 * Checks if a reference is a `Number`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Number`.
 */
function isNumber(value){ return typeof value == $number;}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isDate
 * @function
 *
 * @description
 * Checks if value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
function isDate(value){ return value instanceof Date; }


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isArray
 * @function
 *
 * @description
 * Checks if a reference is an `Array`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
function isArray(value) { return value instanceof Array; }


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.isFunction
 * @function
 *
 * @description
 * Checks if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value){ return typeof value == $function;}


/**
 * Checks if `obj` is a window object.
 *
 * @private
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
function isWindow(obj) {
  return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}

function isBoolean(value) { return typeof value == $boolean;}
function isTextNode(node) { return nodeName_(node) == '#text'; }
function trim(value) { return isString(value) ? value.replace(/^\s*/, '').replace(/\s*$/, '') : value; }
function isElement(node) {
  return node &&
    (node.nodeName  // we are a direct element
    || (node.bind && node.find));  // we have a bind and find method part of jQuery API
}

/**
 * @param str 'key1,key2,...'
 * @returns {object} in the form of {key1:true, key2:true, ...}
 */
function makeMap(str){
  var obj = {}, items = str.split(","), i;
  for ( i = 0; i < items.length; i++ )
    obj[ items[i] ] = true;
  return obj;
}



/**
 * HTML class which is the only class which can be used in ng:bind to inline HTML for security reasons.
 * @constructor
 * @param html raw (unsafe) html
 * @param {string=} option if set to 'usafe' then get method will return raw (unsafe/unsanitized) html
 */
function HTML(html, option) {
  this.html = html;
  this.get = lowercase(option) == 'unsafe'
    ? valueFn(html)
    : function htmlSanitize() {
        var buf = [];
        htmlParser(html, htmlSanitizeWriter(buf));
        return buf.join('');
      };
}

if (msie < 9) {
  nodeName_ = function(element) {
    element = element.nodeName ? element : element[0];
    return (element.scopeName && element.scopeName != 'HTML' ) ? uppercase(element.scopeName + ':' + element.nodeName) : element.nodeName;
  };
} else {
  nodeName_ = function(element) {
    return element.nodeName ? element.nodeName : element[0].nodeName;
  };
}

function isVisible(element) {
  var rect = element[0].getBoundingClientRect(),
      width = (rect.width || (rect.right||0 - rect.left||0)),
      height = (rect.height || (rect.bottom||0 - rect.top||0));
  return width>0 && height>0;
}

function map(obj, iterator, context) {
  var results = [];
  forEach(obj, function(value, index, list) {
    results.push(iterator.call(context, value, index, list));
  });
  return results;
}


/**
 * @ngdoc function
 * @name angular.Object.size
 * @function
 *
 * @description
 * Determines the number of elements in an array, number of properties of an object or string
 * length.
 *
 * Note: this function is used to augment the Object type in angular expressions. See
 * {@link angular.Object} for more info.
 *
 * @param {Object|Array|string} obj Object, array or string to inspect.
 * @param {boolean} [ownPropsOnly=false] Count only "own" properties in an object
 * @returns {number} The size of `obj` or `0` if `obj` is neither an object or an array.
 *
 * @example
 * <doc:example>
 *  <doc:source>
 *   Number of items in array: {{ [1,2].$size() }}<br/>
 *   Number of items in object: {{ {a:1, b:2, c:3}.$size() }}<br/>
 *  </doc:source>
 *  <doc:scenario>
 *   it('should print correct sizes for an array and an object', function() {
 *     expect(binding('[1,2].$size()')).toBe('2');
 *     expect(binding('{a:1, b:2, c:3}.$size()')).toBe('3');
 *   });
 *  </doc:scenario>
 * </doc:example>
 */
function size(obj, ownPropsOnly) {
  var size = 0, key;

  if (isArray(obj) || isString(obj)) {
    return obj.length;
  } else if (isObject(obj)){
    for (key in obj)
      if (!ownPropsOnly || obj.hasOwnProperty(key))
        size++;
  }

  return size;
}


function includes(array, obj) {
  for ( var i = 0; i < array.length; i++) {
    if (obj === array[i]) return true;
  }
  return false;
}

function indexOf(array, obj) {
  for ( var i = 0; i < array.length; i++) {
    if (obj === array[i]) return i;
  }
  return -1;
}

function isLeafNode (node) {
  if (node) {
    switch (node.nodeName) {
    case "OPTION":
    case "PRE":
    case "TITLE":
      return true;
    }
  }
  return false;
}

/**
 * @ngdoc function
 * @name angular.Object.copy
 * @function
 *
 * @description
 * Creates a deep copy of `source`.
 *
 * If `source` is an object or an array, all of its members will be copied into the `destination`
 * object.
 *
 * If `destination` is not provided and `source` is an object or an array, a copy is created &
 * returned, otherwise the `source` is returned.
 *
 * If `destination` is provided, all of its properties will be deleted.
 *
 * Note: this function is used to augment the Object type in angular expressions. See
 * {@link angular.Object} for more info.
 *
 * @param {*} source The source to be used to make a copy.
 *                   Can be any type including primitives, `null` and `undefined`.
 * @param {(Object|Array)=} destination Optional destination into which the source is copied. If
 *     provided, must be of the same type as `source`.
 * @returns {*} The copy or updated `destination` if `destination` was specified.
 *
 * @example
 * <doc:example>
 *  <doc:source>
     Salutation: <input type="text" name="master.salutation" value="Hello" /><br/>
     Name: <input type="text" name="master.name" value="world"/><br/>
     <button ng:click="form = master.$copy()">copy</button>
     <hr/>

     The master object is <span ng:hide="master.$equals(form)">NOT</span> equal to the form object.

     <pre>master={{master}}</pre>
     <pre>form={{form}}</pre>
 *  </doc:source>
 *  <doc:scenario>
   it('should print that initialy the form object is NOT equal to master', function() {
     expect(element('.doc-example-live input[name=master.salutation]').val()).toBe('Hello');
     expect(element('.doc-example-live input[name=master.name]').val()).toBe('world');
     expect(element('.doc-example-live span').css('display')).toBe('inline');
   });

   it('should make form and master equal when the copy button is clicked', function() {
     element('.doc-example-live button').click();
     expect(element('.doc-example-live span').css('display')).toBe('none');
   });
 *  </doc:scenario>
 * </doc:example>
 */
function copy(source, destination){
  if (!destination) {
    destination = source;
    if (source) {
      if (isArray(source)) {
        destination = copy(source, []);
      } else if (isDate(source)) {
        destination = new Date(source.getTime());
      } else if (isObject(source)) {
        destination = copy(source, {});
      }
    }
  } else {
    if (isArray(source)) {
      while(destination.length) {
        destination.pop();
      }
      for ( var i = 0; i < source.length; i++) {
        destination.push(copy(source[i]));
      }
    } else {
      forEach(destination, function(value, key){
        delete destination[key];
      });
      for ( var key in source) {
        destination[key] = copy(source[key]);
      }
    }
  }
  return destination;
}


/**
 * @ngdoc function
 * @name angular.Object.equals
 * @function
 *
 * @description
 * Determines if two objects or value are equivalent.
 *
 * To be equivalent, they must pass `==` comparison or be of the same type and have all their
 * properties pass `==` comparison. During property comparision properties of `function` type and
 * properties with name starting with `$` are ignored.
 *
 * Supports values types, arrays and objects.
 *
 * Note: this function is used to augment the Object type in angular expressions. See
 * {@link angular.Object} for more info.
 *
 * @param {*} o1 Object or value to compare.
 * @param {*} o2 Object or value to compare.
 * @returns {boolean} True if arguments are equal.
 *
 * @example
 * <doc:example>
 *  <doc:source>
     Salutation: <input type="text" name="greeting.salutation" value="Hello" /><br/>
     Name: <input type="text" name="greeting.name" value="world"/><br/>
     <hr/>

     The <code>greeting</code> object is
     <span ng:hide="greeting.$equals({salutation:'Hello', name:'world'})">NOT</span> equal to
     <code>{salutation:'Hello', name:'world'}</code>.

     <pre>greeting={{greeting}}</pre>
 *  </doc:source>
 *  <doc:scenario>
     it('should print that initialy greeting is equal to the hardcoded value object', function() {
       expect(element('.doc-example-live input[name=greeting.salutation]').val()).toBe('Hello');
       expect(element('.doc-example-live input[name=greeting.name]').val()).toBe('world');
       expect(element('.doc-example-live span').css('display')).toBe('none');
     });

     it('should say that the objects are not equal when the form is modified', function() {
       input('greeting.name').enter('kitty');
       expect(element('.doc-example-live span').css('display')).toBe('inline');
     });
 *  </doc:scenario>
 * </doc:example>
 */
function equals(o1, o2) {
  if (o1 == o2) return true;
  if (o1 === null || o2 === null) return false;
  var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
  if (t1 == t2 && t1 == 'object') {
    if (o1 instanceof Array) {
      if ((length = o1.length) == o2.length) {
        for(key=0; key<length; key++) {
          if (!equals(o1[key], o2[key])) return false;
        }
        return true;
      }
    } else {
      keySet = {};
      for(key in o1) {
        if (key.charAt(0) !== '$' && !isFunction(o1[key]) && !equals(o1[key], o2[key])) return false;
        keySet[key] = true;
      }
      for(key in o2) {
        if (!keySet[key] && key.charAt(0) !== '$' && !isFunction(o2[key])) return false;
      }
      return true;
    }
  }
  return false;
}

function setHtml(node, html) {
  if (isLeafNode(node)) {
    if (msie) {
      node.innerText = html;
    } else {
      node.textContent = html;
    }
  } else {
    node.innerHTML = html;
  }
}

function isRenderableElement(element) {
  var name = element && element[0] && element[0].nodeName;
  return name && name.charAt(0) != '#' &&
    !includes(['TR', 'COL', 'COLGROUP', 'TBODY', 'THEAD', 'TFOOT'], name);
}

function elementError(element, type, error) {
  var parent;

  while (!isRenderableElement(element)) {
    parent = element.parent();
    if (parent.length) {
      element = element.parent();
    } else {
      return;
    }
  }

  if (element[0]['$NG_ERROR'] !== error) {
    element[0]['$NG_ERROR'] = error;
    if (error) {
      element.addClass(type);
      element.attr(type, error.message || error);
    } else {
      element.removeClass(type);
      element.removeAttr(type);
    }
  }
}

function concat(array1, array2, index) {
  return array1.concat(slice.call(array2, index, array2.length));
}


/**
 * @workInProgress
 * @ngdoc function
 * @name angular.bind
 * @function
 *
 * @description
 * Returns a function which calls function `fn` bound to `self` (`self` becomes the `this` for `fn`).
 * Optional `args` can be supplied which are prebound to the function, also known as
 * [function currying](http://en.wikipedia.org/wiki/Currying).
 *
 * @param {Object} self Context which `fn` should be evaluated in.
 * @param {function()} fn Function to be bound.
 * @param {...*} args Optional arguments to be prebound to the `fn` function call.
 * @returns {function()} Function that wraps the `fn` with all the specified bindings.
 */
function bind(self, fn) {
  var curryArgs = arguments.length > 2
    ? slice.call(arguments, 2, arguments.length)
    : [];
  if (typeof fn == $function && !(fn instanceof RegExp)) {
    return curryArgs.length
      ? function() {
          return arguments.length
            ? fn.apply(self, curryArgs.concat(slice.call(arguments, 0, arguments.length)))
            : fn.apply(self, curryArgs);
        }
      : function() {
          return arguments.length
            ? fn.apply(self, arguments)
            : fn.call(self);
        };
  } else {
    // in IE, native methods are not functions and so they can not be bound (but they don't need to be)
    return fn;
  }
}

function toBoolean(value) {
  if (value && value.length !== 0) {
    var v = lowercase("" + value);
    value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
  } else {
    value = false;
  }
  return value;
}

function merge(src, dst) {
  for ( var key in src) {
    var value = dst[key];
    var type = typeof value;
    if (type == $undefined) {
      dst[key] = fromJson(toJson(src[key]));
    } else if (type == 'object' && value.constructor != array &&
        key.substring(0, 1) != "$") {
      merge(src[key], value);
    }
  }
}


/** @name angular.compile */
function compile(element) {
  return new Compiler(angularTextMarkup, angularAttrMarkup, angularDirective, angularWidget)
    .compile(element);
}
/////////////////////////////////////////////////

/**
 * Parses an escaped url query string into key-value pairs.
 * @returns Object.<(string|boolean)>
 */
function parseKeyValue(/**string*/keyValue) {
  var obj = {}, key_value, key;
  forEach((keyValue || "").split('&'), function(keyValue){
    if (keyValue) {
      key_value = keyValue.split('=');
      key = unescape(key_value[0]);
      obj[key] = isDefined(key_value[1]) ? unescape(key_value[1]) : true;
    }
  });
  return obj;
}

function toKeyValue(obj) {
  var parts = [];
  forEach(obj, function(value, key) {
    parts.push(escape(key) + (value === true ? '' : '=' + escape(value)));
  });
  return parts.length ? parts.join('&') : '';
}


/**
 * We need our custom mehtod because encodeURIComponent is too agressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
  return encodeUriQuery(val, true).
             replace(/%26/gi, '&').
             replace(/%3D/gi, '=').
             replace(/%2B/gi, '+');
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method becuase encodeURIComponent is too agressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
  return encodeURIComponent(val).
             replace(/%40/gi, '@').
             replace(/%3A/gi, ':').
             replace(/%24/g, '$').
             replace(/%2C/gi, ',').
             replace((pctEncodeSpaces ? null : /%20/g), '+');
}


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:autobind
 * @element script
 *
 * @TODO ng:autobind is not a directive!! it should be documented as bootstrap parameter in a
 *     separate bootstrap section.
 * @TODO rename to ng:autobind to ng:autoboot
 *
 * @description
 *
 * `ng:autobind` with no parameters tells angular to compile and manage the whole page.
 *
 * `ng:autobind="[root element ID]"` tells angular to compile and manage part of the docucment,
 * starting at "root element ID".
 *
 * For details on bootstrapping angular, see {@link guide/dev_guide.bootstrap Initializing Angular}
 * in the Angular Developer Guide.
 */
function angularInit(config, document){
  var autobind = config.autobind;

  if (autobind) {
    var element = isString(autobind) ? document.getElementById(autobind) : document,
        scope = compile(element)(createScope({'$config':config})),
        $browser = scope.$service('$browser');

    if (config.css)
      $browser.addCss(config.base_url + config.css);
    else if(msie<8)
      $browser.addJs(config.ie_compat, config.ie_compat_id);
  }
}

function angularJsConfig(document, config) {
  bindJQuery();
  var scripts = document.getElementsByTagName("script"),
      match;
  config = extend({
    ie_compat_id: 'ng-ie-compat'
  }, config);
  for(var j = 0; j < scripts.length; j++) {
    match = (scripts[j].src || "").match(rngScript);
    if (match) {
      config.base_url = match[1];
      config.ie_compat = match[1] + 'angular-ie-compat' + (match[2] || '') + '.js';
      extend(config, parseKeyValue(match[6]));
      eachAttribute(jqLite(scripts[j]), function(value, name){
        if (/^ng:/.exec(name)) {
          name = name.substring(3).replace(/-/g, '_');
          value = value || true;
          config[name] = value;
        }
      });
    }
  }
  return config;
}

function bindJQuery(){
  // bind to jQuery if present;
  jQuery = window.jQuery;
  // reset to jQuery or default to us.
  if (jQuery) {
    jqLite = jQuery;
    extend(jQuery.fn, {
      scope: JQLitePrototype.scope
    });
  } else {
    jqLite = jqLiteWrap;
  }
  angular.element = jqLite;
}

/**
 * throw error of the argument is falsy.
 */
function assertArg(arg, name, reason) {
  if (!arg) {
    var error = new Error("Argument '" + (name||'?') + "' is " +
        (reason || "required"));
    throw error;
  }
}

function assertArgFn(arg, name) {
  assertArg(isFunction(arg, name, 'not a function'));
}


/**
 * @ngdoc property
 * @name angular.version
 * @description
 * Object which contains information about the current AngularJS version. The object has following
 * properties:
 *
 * - `full` – `{string}` – full version string, e.g. "0.9.18"
 * - `major` – `{number}` – major version number, e.g. 0
 * - `minor` – `{number}` – minor version number, e.g. 9
 * - `dot` – `{number}` – dot version number, e.g. 18
 * - `codeName` – `{string}` – code name of the release, e.g. "jiggling-armfat"
 */
var version = {
  full: '0.9.19',    // all of these placeholder strings will be replaced by rake's
  major: 0,    // compile task
  minor: 9,
  dot: 19,
  codeName: 'canine-psychokinesis'
};

var array = [].constructor;

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.toJson
 * @function
 *
 * @description
 * Serializes the input into a JSON formated string.
 *
 * @param {Object|Array|Date|string|number} obj Input to jsonify.
 * @param {boolean=} pretty If set to true, the JSON output will contain newlines and whitespace.
 * @returns {string} Jsonified string representing `obj`.
 */
function toJson(obj, pretty) {
  var buf = [];
  toJsonArray(buf, obj, pretty ? "\n  " : null, []);
  return buf.join('');
}

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.fromJson
 * @function
 *
 * @description
 * Deserializes a string in the JSON format.
 *
 * @param {string} json JSON string to deserialize.
 * @param {boolean} [useNative=false] Use native JSON parser if available
 * @returns {Object|Array|Date|string|number} Deserialized thingy.
 */
function fromJson(json, useNative) {
  if (!isString(json)) return json;

  var obj;

  try {
    if (useNative && window.JSON && window.JSON.parse) {
      obj = JSON.parse(json);
      return transformDates(obj);
    }
    return parser(json, true).primary()();
  } catch (e) {
    error("fromJson error: ", json, e);
    throw e;
  }

  // TODO make forEach optionally recursive and remove this function
  function transformDates(obj) {
    if (isString(obj) && obj.length === DATE_ISOSTRING_LN) {
      return angularString.toDate(obj);
    } else if (isArray(obj) || isObject(obj)) {
      forEach(obj, function(val, name) {
        obj[name] = transformDates(val);
      });
    }
    return obj;
  }
}

angular.toJson = toJson;
angular.fromJson = fromJson;

function toJsonArray(buf, obj, pretty, stack) {
  if (isObject(obj)) {
    if (obj === window) {
      buf.push('WINDOW');
      return;
    }

    if (obj === document) {
      buf.push('DOCUMENT');
      return;
    }

    if (includes(stack, obj)) {
      buf.push('RECURSION');
      return;
    }
    stack.push(obj);
  }
  if (obj === null) {
    buf.push($null);
  } else if (obj instanceof RegExp) {
    buf.push(angular.String.quoteUnicode(obj.toString()));
  } else if (isFunction(obj)) {
    return;
  } else if (isBoolean(obj)) {
    buf.push('' + obj);
  } else if (isNumber(obj)) {
    if (isNaN(obj)) {
      buf.push($null);
    } else {
      buf.push('' + obj);
    }
  } else if (isString(obj)) {
    return buf.push(angular.String.quoteUnicode(obj));
  } else if (isObject(obj)) {
    if (isArray(obj)) {
      buf.push("[");
      var len = obj.length;
      var sep = false;
      for(var i=0; i<len; i++) {
        var item = obj[i];
        if (sep) buf.push(",");
        if (!(item instanceof RegExp) && (isFunction(item) || isUndefined(item))) {
          buf.push($null);
        } else {
          toJsonArray(buf, item, pretty, stack);
        }
        sep = true;
      }
      buf.push("]");
    } else if (isDate(obj)) {
      buf.push(angular.String.quoteUnicode(angular.Date.toString(obj)));
    } else {
      buf.push("{");
      if (pretty) buf.push(pretty);
      var comma = false;
      var childPretty = pretty ? pretty + "  " : false;
      var keys = [];
      for(var k in obj) {
        if (obj.hasOwnProperty(k) && obj[k] !== undefined) {
          keys.push(k);
        }
      }
      keys.sort();
      for ( var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        var key = keys[keyIndex];
        var value = obj[key];
        if (typeof value != $function) {
          if (comma) {
            buf.push(",");
            if (pretty) buf.push(pretty);
          }
          buf.push(angular.String.quote(key));
          buf.push(":");
          toJsonArray(buf, value, childPretty, stack);
          comma = true;
        }
      }
      buf.push("}");
    }
  }
  if (isObject(obj)) {
    stack.pop();
  }
}

/**
 * Template provides directions an how to bind to a given element.
 * It contains a list of init functions which need to be called to
 * bind to a new instance of elements. It also provides a list
 * of child paths which contain child templates
 */
function Template(priority) {
  this.paths = [];
  this.children = [];
  this.inits = [];
  this.priority = priority;
  this.newScope = false;
}

Template.prototype = {
  attach: function(element, scope) {
    var inits = {};
    this.collectInits(element, inits, scope);
    forEachSorted(inits, function(queue){
      forEach(queue, function(fn) {fn();});
    });
  },

  collectInits: function(element, inits, scope) {
    var queue = inits[this.priority], childScope = scope;
    if (!queue) {
      inits[this.priority] = queue = [];
    }
    if (this.newScope) {
      childScope = createScope(scope);
      scope.$onEval(childScope.$eval);
      element.data($$scope, childScope);
    }
    forEach(this.inits, function(fn) {
      queue.push(function() {
        childScope.$tryEval(function(){
          return childScope.$service.invoke(childScope, fn, [element]);
        }, element);
      });
    });
    var i,
        childNodes = element[0].childNodes,
        children = this.children,
        paths = this.paths,
        length = paths.length;
    for (i = 0; i < length; i++) {
      children[i].collectInits(jqLite(childNodes[paths[i]]), inits, childScope);
    }
  },


  addInit:function(linkingFn) {
    if (linkingFn) {
      if (!linkingFn.$inject)
        linkingFn.$inject = [];
      this.inits.push(linkingFn);
    }
  },


  addChild: function(index, template) {
    if (template) {
      this.paths.push(index);
      this.children.push(template);
    }
  },

  empty: function() {
    return this.inits.length === 0 && this.paths.length === 0;
  }
};

///////////////////////////////////
//Compiler
//////////////////////////////////

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.compile
 * @function
 *
 * @description
 * Compiles a piece of HTML string or DOM into a template and produces a template function, which
 * can then be used to link {@link angular.scope scope} and the template together.
 *
 * The compilation is a process of walking the DOM tree and trying to match DOM elements to
 * {@link angular.markup markup}, {@link angular.attrMarkup attrMarkup},
 * {@link angular.widget widgets}, and {@link angular.directive directives}. For each match it
 * executes corresponding markup, attrMarkup, widget or directive template function and collects the
 * instance functions into a single template function which is then returned.
 *
 * The template function can then be used once to produce the view or as it is the case with
 * {@link angular.widget.@ng:repeat repeater} many-times, in which case each call results in a view
 * that is a DOM clone of the original template.
 *
   <pre>
    // compile the entire window.document and give me the scope bound to this template.
    var rootScope = angular.compile(window.document)();

    // compile a piece of html
    var rootScope2 = angular.compile('<div ng:click="clicked = true">click me</div>')();

    // compile a piece of html and retain reference to both the dom and scope
    var template = angular.element('<div ng:click="clicked = true">click me</div>'),
        scope = angular.compile(template)();
    // at this point template was transformed into a view
   </pre>
 *
 *
 * @param {string|DOMElement} element Element or HTML to compile into a template function.
 * @returns {function([scope][, cloneAttachFn])} a template function which is used to bind template
 * (a DOM element/tree) to a scope. Where:
 *
 *  * `scope` - A {@link angular.scope Scope} to bind to. If none specified, then a new
 *               root scope is created.
 *  * `cloneAttachFn` - If `cloneAttachFn` is provided, then the link function will clone the
 *               `template` and call the `cloneAttachFn` function allowing the caller to attach the
 *               cloned elements to the DOM document at the appropriate place. The `cloneAttachFn` is
 *               called as: <br/> `cloneAttachFn(clonedElement, scope)` where:
 *
 *      * `clonedElement` - is a clone of the original `element` passed into the compiler.
 *      * `scope` - is the current scope with which the linking function is working with.
 *
 * Calling the template function returns the scope to which the element is bound to. It is either
 * the same scope as the one passed into the template function, or if none were provided it's the
 * newly create scope.
 *
 * If you need access to the bound view, there are two ways to do it:
 *
 * - If you are not asking the linking function to clone the template, create the DOM element(s)
 *   before you send them to the compiler and keep this reference around.
 *   <pre>
 *     var view = angular.element('<p>{{total}}</p>'),
 *         scope = angular.compile(view)();
 *   </pre>
 *
 * - if on the other hand, you need the element to be cloned, the view reference from the original
 *   example would not point to the clone, but rather to the original template that was cloned. In
 *   this case, you can access the clone via the cloneAttachFn:
 *   <pre>
 *     var original = angular.element('<p>{{total}}</p>'),
 *         scope = someParentScope.$new(),
 *         clone;
 *
 *     angular.compile(original)(scope, function(clonedElement, scope) {
 *       clone = clonedElement;
 *       //attach the clone to DOM document at the right place
 *     });
 *
 *     //now we have reference to the cloned DOM via `clone`
 *   </pre>
 *
 *
 * Compiler Methods For Widgets and Directives:
 *
 * The following methods are available for use when you write your own widgets, directives,
 * and markup.  (Recall that the compile function's this is a reference to the compiler.)
 *
 *  `compile(element)` - returns linker -
 *  Invoke a new instance of the compiler to compile a DOM element and return a linker function.
 *  You can apply the linker function to the original element or a clone of the original element.
 *  The linker function returns a scope.
 *
 *  * `comment(commentText)` - returns element - Create a comment element.
 *
 *  * `element(elementName)` - returns element - Create an element by name.
 *
 *  * `text(text)` - returns element - Create a text element.
 *
 *  * `descend([set])` - returns descend state (true or false). Get or set the current descend
 *  state. If true the compiler will descend to children elements.
 *
 *  * `directives([set])` - returns directive state (true or false). Get or set the current
 *  directives processing state. The compiler will process directives only when directives set to
 *  true.
 *
 * For information on how the compiler works, see the
 * {@link guide/dev_guide.compiler Angular HTML Compiler} section of the Developer Guide.
 */
function Compiler(markup, attrMarkup, directives, widgets){
  this.markup = markup;
  this.attrMarkup = attrMarkup;
  this.directives = directives;
  this.widgets = widgets;
}

Compiler.prototype = {
  compile: function(templateElement) {
    templateElement = jqLite(templateElement);
    var index = 0,
        template,
        parent = templateElement.parent();
    if (templateElement.length > 1) {
      // https://github.com/angular/angular.js/issues/338
      throw Error("Cannot compile multiple element roots: " +
          jqLite('<div>').append(templateElement.clone()).html());
    }
    if (parent && parent[0]) {
      parent = parent[0];
      for(var i = 0; i < parent.childNodes.length; i++) {
        if (parent.childNodes[i] == templateElement[0]) {
          index = i;
        }
      }
    }
    template = this.templatize(templateElement, index, 0) || new Template();
    return function(scope, cloneConnectFn){
      // important!!: we must call our jqLite.clone() since the jQuery one is trying to be smart
      // and sometimes changes the structure of the DOM.
      var element = cloneConnectFn
        ? JQLitePrototype.clone.call(templateElement) // IMPORTANT!!!
        : templateElement;
        scope = scope || createScope();
      element.data($$scope, scope);
      scope.$element = element;
      (cloneConnectFn||noop)(element, scope);
      template.attach(element, scope);
      scope.$eval();
      return scope;
    };
  },


  /**
   * @workInProgress
   * @ngdoc directive
   * @name angular.directive.ng:eval-order
   *
   * @description
   * Normally the view is updated from top to bottom. This usually is
   * not a problem, but under some circumstances the values for data
   * is not available until after the full view is computed. If such
   * values are needed before they are computed the order of
   * evaluation can be changed using ng:eval-order
   *
   * @element ANY
   * @param {integer|string=} [priority=0] priority integer, or FIRST, LAST constant
   *
   * @example
   * try changing the invoice and see that the Total will lag in evaluation
   * @example
     <doc:example>
       <doc:source>
        <div>TOTAL: without ng:eval-order {{ items.$sum('total') | currency }}</div>
        <div ng:eval-order='LAST'>TOTAL: with ng:eval-order {{ items.$sum('total') | currency }}</div>
        <table ng:init="items=[{qty:1, cost:9.99, desc:'gadget'}]">
          <tr>
            <td>QTY</td>
            <td>Description</td>
            <td>Cost</td>
            <td>Total</td>
            <td></td>
          </tr>
          <tr ng:repeat="item in items">
            <td><input name="item.qty"/></td>
            <td><input name="item.desc"/></td>
            <td><input name="item.cost"/></td>
            <td>{{item.total = item.qty * item.cost | currency}}</td>
            <td><a href="" ng:click="items.$remove(item)">X</a></td>
          </tr>
          <tr>
            <td colspan="3"><a href="" ng:click="items.$add()">add</a></td>
            <td>{{ items.$sum('total') | currency }}</td>
          </tr>
        </table>
       </doc:source>
       <doc:scenario>
         it('should check ng:format', function(){
           expect(using('.doc-example-live div:first').binding("items.$sum('total')")).toBe('$9.99');
           expect(using('.doc-example-live div:last').binding("items.$sum('total')")).toBe('$9.99');
           input('item.qty').enter('2');
           expect(using('.doc-example-live div:first').binding("items.$sum('total')")).toBe('$9.99');
           expect(using('.doc-example-live div:last').binding("items.$sum('total')")).toBe('$19.98');
         });
       </doc:scenario>
     </doc:example>
   */

  templatize: function(element, elementIndex, priority){
    var self = this,
        widget,
        fn,
        directiveFns = self.directives,
        descend = true,
        directives = true,
        elementName = nodeName_(element),
        elementNamespace = elementName.indexOf(':') > 0 ? lowercase(elementName).replace(':', '-') : '',
        template,
        selfApi = {
          compile: bind(self, self.compile),
          descend: function(value){ if(isDefined(value)) descend = value; return descend;},
          directives: function(value){ if(isDefined(value)) directives = value; return directives;},
          scope: function(value){ if(isDefined(value)) template.newScope = template.newScope || value; return template.newScope;}
        };
    try {
      priority = element.attr('ng:eval-order') || priority || 0;
    } catch (e) {
      // for some reason IE throws error under some weird circumstances. so just assume nothing
      priority = priority || 0;
    }
    element.addClass(elementNamespace);
    if (isString(priority)) {
      priority = PRIORITY[uppercase(priority)] || parseInt(priority, 10);
    }
    template = new Template(priority);
    eachAttribute(element, function(value, name){
      if (!widget) {
        if (widget = self.widgets('@' + name)) {
          element.addClass('ng-attr-widget');
          widget = bind(selfApi, widget, value, element);
        }
      }
    });
    if (!widget) {
      if (widget = self.widgets(elementName)) {
        if (elementNamespace)
          element.addClass('ng-widget');
        widget = bind(selfApi, widget, element);
      }
    }
    if (widget) {
      descend = false;
      directives = false;
      var parent = element.parent();
      template.addInit(widget.call(selfApi, element));
      if (parent && parent[0]) {
        element = jqLite(parent[0].childNodes[elementIndex]);
      }
    }
    if (descend){
      // process markup for text nodes only
      for(var i=0, child=element[0].childNodes;
          i<child.length; i++) {
        if (isTextNode(child[i])) {
          forEach(self.markup, function(markup){
            if (i<child.length) {
              var textNode = jqLite(child[i]);
              markup.call(selfApi, textNode.text(), textNode, element);
            }
          });
        }
      }
    }

    if (directives) {
      // Process attributes/directives
      eachAttribute(element, function(value, name){
        forEach(self.attrMarkup, function(markup){
          markup.call(selfApi, value, name, element);
        });
      });
      eachAttribute(element, function(value, name){
        fn = directiveFns[name];
        if (fn) {
          element.addClass('ng-directive');
          template.addInit((directiveFns[name]).call(selfApi, value, element));
        }
      });
    }
    // Process non text child nodes
    if (descend) {
      eachNode(element, function(child, i){
        template.addChild(i, self.templatize(child, i, priority));
      });
    }
    return template.empty() ? null : template;
  }
};

function eachNode(element, fn){
  var i, chldNodes = element[0].childNodes || [], chld;
  for (i = 0; i < chldNodes.length; i++) {
    if(!isTextNode(chld = chldNodes[i])) {
      fn(jqLite(chld), i);
    }
  }
}

function eachAttribute(element, fn){
  var i, attrs = element[0].attributes || [], chld, attr, name, value, attrValue = {};
  for (i = 0; i < attrs.length; i++) {
    attr = attrs[i];
    name = attr.name;
    value = attr.value;
    if (msie && name == 'href') {
      value = decodeURIComponent(element[0].getAttribute(name, 2));
    }
    attrValue[name] = value;
  }
  forEachSorted(attrValue, fn);
}

function getter(instance, path, unboundFn) {
  if (!path) return instance;
  var element = path.split('.');
  var key;
  var lastInstance = instance;
  var len = element.length;
  for ( var i = 0; i < len; i++) {
    key = element[i];
    if (!key.match(/^[\$\w][\$\w\d]*$/))
        throw "Expression '" + path + "' is not a valid expression for accessing variables.";
    if (instance) {
      lastInstance = instance;
      instance = instance[key];
    }
    if (isUndefined(instance)  && key.charAt(0) == '$') {
      var type = angular['Global']['typeOf'](lastInstance);
      type = angular[type.charAt(0).toUpperCase()+type.substring(1)];
      var fn = type ? type[[key.substring(1)]] : undefined;
      if (fn) {
        instance = bind(lastInstance, fn, lastInstance);
        return instance;
      }
    }
  }
  if (!unboundFn && isFunction(instance)) {
    return bind(lastInstance, instance);
  }
  return instance;
}

function setter(instance, path, value){
  var element = path.split('.');
  for ( var i = 0; element.length > 1; i++) {
    var key = element.shift();
    var newInstance = instance[key];
    if (!newInstance) {
      newInstance = {};
      instance[key] = newInstance;
    }
    instance = newInstance;
  }
  instance[element.shift()] = value;
  return value;
}

///////////////////////////////////
var scopeId = 0,
    getterFnCache = {},
    compileCache = {},
    JS_KEYWORDS = {};
forEach(
    ("abstract,boolean,break,byte,case,catch,char,class,const,continue,debugger,default," +
    "delete,do,double,else,enum,export,extends,false,final,finally,float,for,function,goto," +
    "if,implements,import,ininstanceof,intinterface,long,native,new,null,package,private," +
    "protected,public,return,short,static,super,switch,synchronized,this,throw,throws," +
    "transient,true,try,typeof,var,volatile,void,undefined,while,with").split(/,/),
  function(key){ JS_KEYWORDS[key] = true;}
);
function getterFn(path){
  var fn = getterFnCache[path];
  if (fn) return fn;

  var code = 'var l, fn, t;\n';
  forEach(path.split('.'), function(key) {
    key = (JS_KEYWORDS[key]) ? '["' + key + '"]' : '.' + key;
    code += 'if(!s) return s;\n' +
            'l=s;\n' +
            's=s' + key + ';\n' +
            'if(typeof s=="function" && !(s instanceof RegExp)) s = function(){ return l'+key+'.apply(l, arguments); };\n';
    if (key.charAt(1) == '$') {
      // special code for super-imposed functions
      var name = key.substr(2);
      code += 'if(!s) {\n' +
              '  t = angular.Global.typeOf(l);\n' +
              '  fn = (angular[t.charAt(0).toUpperCase() + t.substring(1)]||{})["' + name + '"];\n' +
              '  if (fn) s = function(){ return fn.apply(l, [l].concat(Array.prototype.slice.call(arguments, 0, arguments.length))); };\n' +
              '}\n';
    }
  });
  code += 'return s;';
  fn = Function('s', code);
  fn["toString"] = function(){ return code; };

  return getterFnCache[path] = fn;
}

///////////////////////////////////

function expressionCompile(exp){
  if (typeof exp === $function) return exp;
  var fn = compileCache[exp];
  if (!fn) {
    var p = parser(exp);
    var fnSelf = p.statements();
    fn = compileCache[exp] = extend(
      function(){ return fnSelf(this);},
      {fnSelf: fnSelf});
  }
  return fn;
}

function errorHandlerFor(element, error) {
  elementError(element, NG_EXCEPTION, isDefined(error) ? formatError(error) : error);
}


/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.scope
 *
 * @description
 * Scope is a JavaScript object and the execution context for expressions. You can think about
 * scopes as JavaScript objects that have extra APIs for registering watchers. A scope is the
 * context in which model (from the model-view-controller design pattern) exists.
 *
 * Angular scope objects provide the following methods:
 *
 * * {@link angular.scope.$become $become()} -
 * * {@link angular.scope.$bind $bind()} -
 * * {@link angular.scope.$eval $eval()} -
 * * {@link angular.scope.$get $get()} -
 * * {@link angular.scope.$new $new()} -
 * * {@link angular.scope.$onEval $onEval()} -
 * * {@link angular.scope.$service $service()} -
 * * {@link angular.scope.$set $set()} -
 * * {@link angular.scope.$tryEval $tryEval()} -
 * * {@link angular.scope.$watch $watch()} -
 *
 * For more information about how angular scope objects work, see {@link guide/dev_guide.scopes
 * Angular Scope Objects} in the angular Developer Guide.
 */
function createScope(parent, providers, instanceCache) {
  function Parent(){}
  parent = Parent.prototype = (parent || {});
  var instance = new Parent();
  var evalLists = {sorted:[]};
  var $log, $exceptionHandler;

  extend(instance, {
    'this': instance,
    $id: (scopeId++),
    $parent: parent,

    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$bind
     * @function
     *
     * @description
     * Binds a function `fn` to the current scope. See: {@link angular.bind}.

       <pre>
         var scope = angular.scope();
         var fn = scope.$bind(function(){
           return this;
         });
         expect(fn()).toEqual(scope);
       </pre>
     *
     * @param {function()} fn Function to be bound.
     */
    $bind: bind(instance, bind, instance),


    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$get
     * @function
     *
     * @description
     * Returns the value for `property_chain` on the current scope. Unlike in JavaScript, if there
     * are any `undefined` intermediary properties, `undefined` is returned instead of throwing an
     * exception.
     *
       <pre>
         var scope = angular.scope();
         expect(scope.$get('person.name')).toEqual(undefined);
         scope.person = {};
         expect(scope.$get('person.name')).toEqual(undefined);
         scope.person.name = 'misko';
         expect(scope.$get('person.name')).toEqual('misko');
       </pre>
     *
     * @param {string} property_chain String representing name of a scope property. Optionally
     *     properties can be chained with `.` (dot), e.g. `'person.name.first'`
     * @returns {*} Value for the (nested) property.
     */
    $get: bind(instance, getter, instance),


    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$set
     * @function
     *
     * @description
     * Assigns a value to a property of the current scope specified via `property_chain`. Unlike in
     * JavaScript, if there are any `undefined` intermediary properties, empty objects are created
     * and assigned to them instead of throwing an exception.
     *
       <pre>
         var scope = angular.scope();
         expect(scope.person).toEqual(undefined);
         scope.$set('person.name', 'misko');
         expect(scope.person).toEqual({name:'misko'});
         expect(scope.person.name).toEqual('misko');
       </pre>
     *
     * @param {string} property_chain String representing name of a scope property. Optionally
     *     properties can be chained with `.` (dot), e.g. `'person.name.first'`
     * @param {*} value Value to assign to the scope property.
     */
    $set: bind(instance, setter, instance),


    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$eval
     * @function
     *
     * @description
     * Without the `exp` parameter triggers an eval cycle for this scope and its child scopes.
     *
     * With the `exp` parameter, compiles the expression to a function and calls it with `this` set
     * to the current scope and returns the result. In other words, evaluates `exp` as angular
     * expression in the context of the current scope.
     *
     * # Example
       <pre>
         var scope = angular.scope();
         scope.a = 1;
         scope.b = 2;

         expect(scope.$eval('a+b')).toEqual(3);
         expect(scope.$eval(function(){ return this.a + this.b; })).toEqual(3);

         scope.$onEval('sum = a+b');
         expect(scope.sum).toEqual(undefined);
         scope.$eval();
         expect(scope.sum).toEqual(3);
       </pre>
     *
     * @param {(string|function())=} exp An angular expression to be compiled to a function or a js
     *     function.
     *
     * @returns {*} The result of calling compiled `exp` with `this` set to the current scope.
     */
    $eval: function(exp) {
      var type = typeof exp;
      var i, iSize;
      var j, jSize;
      var queue;
      var fn;
      if (type == $undefined) {
        for ( i = 0, iSize = evalLists.sorted.length; i < iSize; i++) {
          for ( queue = evalLists.sorted[i],
              jSize = queue.length,
              j= 0; j < jSize; j++) {
            instance.$tryEval(queue[j].fn, queue[j].handler);
          }
        }
      } else if (type === $function) {
        return exp.call(instance);
      } else  if (type === 'string') {
        return expressionCompile(exp).call(instance);
      }
    },


    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$tryEval
     * @function
     *
     * @description
     * Evaluates the expression in the context of the current scope just like
     * {@link angular.scope.$eval} with expression parameter, but also wraps it in a try/catch
     * block.
     *
     * If an exception is thrown then `exceptionHandler` is used to handle the exception.
     *
     * # Example
       <pre>
         var scope = angular.scope();
         scope.error = function(){ throw 'myerror'; };
         scope.$exceptionHandler = function(e) {this.lastException = e; };

         expect(scope.$eval('error()'));
         expect(scope.lastException).toEqual('myerror');
         this.lastException = null;

         expect(scope.$eval('error()'),  function(e) {this.lastException = e; });
         expect(scope.lastException).toEqual('myerror');

         var body = angular.element(window.document.body);
         expect(scope.$eval('error()'), body);
         expect(body.attr('ng-exception')).toEqual('"myerror"');
         expect(body.hasClass('ng-exception')).toEqual(true);
       </pre>
     *
     * @param {string|function()} expression Angular expression to evaluate.
     * @param {(function()|DOMElement)=} exceptionHandler Function to be called or DOMElement to be
     *     decorated.
     * @returns {*} The result of `expression` evaluation.
     */
    $tryEval: function (expression, exceptionHandler) {
      var type = typeof expression;
      try {
        if (type == $function) {
          return expression.call(instance);
        } else if (type == 'string'){
          return expressionCompile(expression).call(instance);
        }
      } catch (e) {
        if ($log) $log.error(e);
        if (isFunction(exceptionHandler)) {
          exceptionHandler(e);
        } else if (exceptionHandler) {
          errorHandlerFor(exceptionHandler, e);
        } else if (isFunction($exceptionHandler)) {
          $exceptionHandler(e);
        }
      }
    },


    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$watch
     * @function
     *
     * @description
     * Registers `listener` as a callback to be executed every time the `watchExp` changes. Be aware
     * that the callback gets, by default, called upon registration, this can be prevented via the
     * `initRun` parameter.
     *
     * # Example
       <pre>
         var scope = angular.scope();
         scope.name = 'misko';
         scope.counter = 0;

         expect(scope.counter).toEqual(0);
         scope.$watch('name', 'counter = counter + 1');
         expect(scope.counter).toEqual(1);

         scope.$eval();
         expect(scope.counter).toEqual(1);

         scope.name = 'adam';
         scope.$eval();
         expect(scope.counter).toEqual(2);
       </pre>
     *
     * @param {function()|string} watchExp Expression that should be evaluated and checked for
     *    change during each eval cycle. Can be an angular string expression or a function.
     * @param {function()|string} listener Function (or angular string expression) that gets called
     *    every time the value of the `watchExp` changes. The function will be called with two
     *    parameters, `newValue` and `oldValue`.
     * @param {(function()|DOMElement)=} [exceptionHanlder=angular.service.$exceptionHandler] Handler
     *    that gets called when `watchExp` or `listener` throws an exception. If a DOMElement is
     *    specified as a handler, the element gets decorated by angular with the information about the
     *    exception.
     * @param {boolean=} [initRun=true] Flag that prevents the first execution of the listener upon
     *    registration.
     *
     */
    $watch: function(watchExp, listener, exceptionHandler, initRun) {
      var watch = expressionCompile(watchExp),
          last = watch.call(instance);
      listener = expressionCompile(listener);
      function watcher(firstRun){
        var value = watch.call(instance),
            // we have to save the value because listener can call ourselves => inf loop
            lastValue = last;
        if (firstRun || lastValue !== value) {
          last = value;
          instance.$tryEval(function(){
            return listener.call(instance, value, lastValue);
          }, exceptionHandler);
        }
      }
      instance.$onEval(PRIORITY_WATCH, watcher);
      if (isUndefined(initRun)) initRun = true;
      if (initRun) watcher(true);
    },

    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$onEval
     * @function
     *
     * @description
     * Evaluates the `expr` expression in the context of the current scope during each
     * {@link angular.scope.$eval eval cycle}.
     *
     * # Example
       <pre>
         var scope = angular.scope();
         scope.counter = 0;
         scope.$onEval('counter = counter + 1');
         expect(scope.counter).toEqual(0);
         scope.$eval();
         expect(scope.counter).toEqual(1);
       </pre>
     *
     * @param {number} [priority=0] Execution priority. Lower priority numbers get executed first.
     * @param {string|function()} expr Angular expression or function to be executed.
     * @param {(function()|DOMElement)=} [exceptionHandler=angular.service.$exceptionHandler] Handler
     *     function to call or DOM element to decorate when an exception occurs.
     *
     */
    $onEval: function(priority, expr, exceptionHandler){
      if (!isNumber(priority)) {
        exceptionHandler = expr;
        expr = priority;
        priority = 0;
      }
      var evalList = evalLists[priority];
      if (!evalList) {
        evalList = evalLists[priority] = [];
        evalList.priority = priority;
        evalLists.sorted.push(evalList);
        evalLists.sorted.sort(function(a,b){return a.priority-b.priority;});
      }
      evalList.push({
        fn: expressionCompile(expr),
        handler: exceptionHandler
      });
    },

    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$become
     * @function
     * @deprecated This method will be removed before 1.0
     *
     * @description
     * Modifies the scope to act like an instance of the given class by:
     *
     * - copying the class's prototype methods
     * - applying the class's initialization function to the scope instance (without using the new
     *   operator)
     *
     * That makes the scope be a `this` for the given class's methods — effectively an instance of
     * the given class with additional (scope) stuff. A scope can later `$become` another class.
     *
     * `$become` gets used to make the current scope act like an instance of a controller class.
     * This allows for use of a controller class in two ways.
     *
     * - as an ordinary JavaScript class for standalone testing, instantiated using the new
     *   operator, with no attached view.
     * - as a controller for an angular model stored in a scope, "instantiated" by
     *   `scope.$become(ControllerClass)`.
     *
     * Either way, the controller's methods refer to the model  variables like `this.name`. When
     * stored in a scope, the model supports data binding. When bound to a view, {{name}} in the
     * HTML template refers to the same variable.
     */
    $become: function(Class) {
      if (isFunction(Class)) {
        instance.constructor = Class;
        forEach(Class.prototype, function(fn, name){
          instance[name] = bind(instance, fn);
        });
        instance.$service.invoke(instance, Class, slice.call(arguments, 1, arguments.length));

        //TODO: backwards compatibility hack, remove when we don't depend on init methods
        if (isFunction(Class.prototype.init)) {
          instance.init();
        }
      }
    },

    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$new
     * @function
     *
     * @description
     * Creates a new {@link angular.scope scope}, that:
     *
     * - is a child of the current scope
     * - will {@link angular.scope.$become $become} of type specified via `constructor`
     *
     * @param {function()} constructor Constructor function of the type the new scope should assume.
     * @returns {Object} The newly created child scope.
     *
     */
    $new: function(constructor) {
      var child = createScope(instance);
      child.$become.apply(instance, concat([constructor], arguments, 1));
      instance.$onEval(child.$eval);
      return child;
    }

  });

  if (!parent.$root) {
    instance.$root = instance;
    instance.$parent = instance;

    /**
     * @workInProgress
     * @ngdoc function
     * @name angular.scope.$service
     * @function
     *
     * @description
     * Provides access to angular's dependency injector and
     * {@link angular.service registered services}. In general the use of this api is discouraged,
     * except for tests and components that currently don't support dependency injection (widgets,
     * filters, etc).
     *
     * @param {string} serviceId String ID of the service to return.
     * @returns {*} Value, object or function returned by the service factory function if any.
     */
    (instance.$service = createInjector(instance, providers, instanceCache)).eager();
  }

  $log = instance.$service('$log');
  $exceptionHandler = instance.$service('$exceptionHandler');

  return instance;
}

/**
 * @ngdoc function
 * @name angular.injector
 * @function
 *
 * @description
 * Creates an injector function that can be used for retrieving services as well as for
 * dependency injection (see {@link guide/dev_guide.di dependency injection}).
 *
 * Angular creates an injector automatically for the root scope and it is available as the
 * {@link angular.scope.$service $service} property. Creation of the injector automatically creates
 * all of the `$eager` {@link angular.service services}.
 *
 * @param {Object=} [factoryScope={}] `this` for the service factory function.
 * @param {Object.<string, function()>=} [factories=angular.service] Map of service factory
 *     functions.
 * @param {Object.<string, function()>=} [instanceCache={}] Place where instances of services are
 *     saved for reuse. Can also be used to override services specified by `serviceFactory`
 *     (useful in tests).
 * @returns {function()} Injector function:
 *
 *   * `injector(serviceName)`:
 *     * `serviceName` - `{string=}` - name of the service to retrieve.
 *
 * The injector function also has these properties:
 *
 *   * an `invoke` property which can be used to invoke methods with dependency-injected arguments.
 *    `injector.invoke(self, fn, curryArgs)`
 *     * `self` -  "`this`" to be used when invoking the function.
 *     * `fn` - the function to be invoked. The function may have the `$inject` property which
 *        lists the set of arguments which should be auto injected
 *        (see {@link guide/dev_guide.di dependency injection}).
 *     * `curryArgs(array)` - optional array of arguments to pass to function invocation after the
 *        injection arguments (also known as curry arguments or currying).
 *   * an `eager` property which is used to initialize the eager services.
 *     `injector.eager()`
 */
function createInjector(factoryScope, factories, instanceCache) {
  factories = factories || angularService;
  instanceCache = instanceCache || {};
  factoryScope = factoryScope || {};
  injector.invoke = invoke;

  injector.eager = function(){
    forEach(factories, function(factory, name){
      if (factory.$eager)
        injector(name);

      if (factory.$creation)
        throw new Error("Failed to register service '" + name +
        "': $creation property is unsupported. Use $eager:true or see release notes.");
    });
  };
  return injector;

  function injector(value){
    if (!(value in instanceCache)) {
      var factory = factories[value];
      if (!factory) throw Error("Unknown provider for '"+value+"'.");
      instanceCache[value] = invoke(factoryScope, factory);
    }
    return instanceCache[value];
  }

  function invoke(self, fn, args){
    args = args || [];
    var injectNames = injectionArgs(fn);
    var i = injectNames.length;
    while(i--) {
      args.unshift(injector(injectNames[i]));
    }
    return fn.apply(self, args);
  }
}

/**
 * THIS IS NOT PUBLIC DOC YET!
 *
 * @name angular.annotate
 * @function
 *
 * @description
 * Annotate the function with injection arguments. This is equivalent to setting the `$inject`
 * property as described in {@link guide.di dependency injection}.
 *
 * <pre>
 * var MyController = angular.annotate('$location', function($location){ ... });
 * </pre>
 *
 * is the same as
 *
 * <pre>
 * var MyController = function($location){ ... };
 * MyController.$inject = ['$location'];
 * </pre>
 *
 * @param {String|Array} serviceName... zero or more service names to inject into the
 *     `annotatedFunction`.
 * @param {function} annotatedFunction function to annotate with `$inject`
 *     functions.
 * @returns {function} `annotatedFunction`
 */
function annotate(services, fn) {
  if (services instanceof Array) {
    fn.$inject = services;
    return fn;
  } else {
    var i = 0,
        length = arguments.length - 1, // last one is the destination function
        $inject = arguments[length].$inject = [];
    for (; i < length; i++) {
      $inject.push(arguments[i]);
    }
    return arguments[length]; // return the last one
  }
}

function angularServiceInject(name, fn, inject, eager) {
  angularService(name, fn, {$inject:inject, $eager:eager});
}


/**
 * @returns the $inject property of function. If not found the
 * the $inject is computed by looking at the toString of function and
 * extracting all arguments which and assuming that they are the
 * injection names.
 */
var FN_ARGS = /^function\s*[^\(]*\(([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(.+?)\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function injectionArgs(fn) {
  assertArgFn(fn);
  if (!fn.$inject) {
    var args = fn.$inject = [];
    var fnText = fn.toString().replace(STRIP_COMMENTS, '');
    var argDecl = fnText.match(FN_ARGS);
    forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg){
      arg.replace(FN_ARG, function(all, name){
        args.push(name);
      });
    });
  }
  return fn.$inject;
}

var OPERATORS = {
    'null':function(self){return null;},
    'true':function(self){return true;},
    'false':function(self){return false;},
    $undefined:noop,
    '+':function(self, a,b){return (isDefined(a)?a:0)+(isDefined(b)?b:0);},
    '-':function(self, a,b){return (isDefined(a)?a:0)-(isDefined(b)?b:0);},
    '*':function(self, a,b){return a*b;},
    '/':function(self, a,b){return a/b;},
    '%':function(self, a,b){return a%b;},
    '^':function(self, a,b){return a^b;},
    '=':noop,
    '==':function(self, a,b){return a==b;},
    '!=':function(self, a,b){return a!=b;},
    '<':function(self, a,b){return a<b;},
    '>':function(self, a,b){return a>b;},
    '<=':function(self, a,b){return a<=b;},
    '>=':function(self, a,b){return a>=b;},
    '&&':function(self, a,b){return a&&b;},
    '||':function(self, a,b){return a||b;},
    '&':function(self, a,b){return a&b;},
//    '|':function(self, a,b){return a|b;},
    '|':function(self, a,b){return b(self, a);},
    '!':function(self, a){return !a;}
};
var ESCAPE = {"n":"\n", "f":"\f", "r":"\r", "t":"\t", "v":"\v", "'":"'", '"':'"'};

function lex(text, parseStringsForObjects){
  var dateParseLength = parseStringsForObjects ? DATE_ISOSTRING_LN : -1,
      tokens = [],
      token,
      index = 0,
      json = [],
      ch,
      lastCh = ':'; // can start regexp

  while (index < text.length) {
    ch = text.charAt(index);
    if (is('"\'')) {
      readString(ch);
    } else if (isNumber(ch) || is('.') && isNumber(peek())) {
      readNumber();
    } else if (isIdent(ch)) {
      readIdent();
      // identifiers can only be if the preceding char was a { or ,
      if (was('{,') && json[0]=='{' &&
         (token=tokens[tokens.length-1])) {
        token.json = token.text.indexOf('.') == -1;
      }
    } else if (is('(){}[].,;:')) {
      tokens.push({
        index:index,
        text:ch,
        json:(was(':[,') && is('{[')) || is('}]:,')
      });
      if (is('{[')) json.unshift(ch);
      if (is('}]')) json.shift();
      index++;
    } else if (isWhitespace(ch)) {
      index++;
      continue;
    } else {
      var ch2 = ch + peek(),
          fn = OPERATORS[ch],
          fn2 = OPERATORS[ch2];
      if (fn2) {
        tokens.push({index:index, text:ch2, fn:fn2});
        index += 2;
      } else if (fn) {
        tokens.push({index:index, text:ch, fn:fn, json: was('[,:') && is('+-')});
        index += 1;
      } else {
        throwError("Unexpected next character ", index, index+1);
      }
    }
    lastCh = ch;
  }
  return tokens;

  function is(chars) {
    return chars.indexOf(ch) != -1;
  }

  function was(chars) {
    return chars.indexOf(lastCh) != -1;
  }

  function peek() {
    return index + 1 < text.length ? text.charAt(index + 1) : false;
  }
  function isNumber(ch) {
    return '0' <= ch && ch <= '9';
  }
  function isWhitespace(ch) {
    return ch == ' ' || ch == '\r' || ch == '\t' ||
           ch == '\n' || ch == '\v' || ch == '\u00A0'; // IE treats non-breaking space as \u00A0
  }
  function isIdent(ch) {
    return 'a' <= ch && ch <= 'z' ||
           'A' <= ch && ch <= 'Z' ||
           '_' == ch || ch == '$';
  }
  function isExpOperator(ch) {
    return ch == '-' || ch == '+' || isNumber(ch);
  }

  function throwError(error, start, end) {
    end = end || index;
    throw Error("Lexer Error: " + error + " at column" +
        (isDefined(start)
            ? "s " + start +  "-" + index + " [" + text.substring(start, end) + "]"
            : " " + end) +
        " in expression [" + text + "].");
  }

  function readNumber() {
    var number = "";
    var start = index;
    while (index < text.length) {
      var ch = lowercase(text.charAt(index));
      if (ch == '.' || isNumber(ch)) {
        number += ch;
      } else {
        var peekCh = peek();
        if (ch == 'e' && isExpOperator(peekCh)) {
          number += ch;
        } else if (isExpOperator(ch) &&
            peekCh && isNumber(peekCh) &&
            number.charAt(number.length - 1) == 'e') {
          number += ch;
        } else if (isExpOperator(ch) &&
            (!peekCh || !isNumber(peekCh)) &&
            number.charAt(number.length - 1) == 'e') {
          throwError('Invalid exponent');
        } else {
          break;
        }
      }
      index++;
    }
    number = 1 * number;
    tokens.push({index:start, text:number, json:true,
      fn:function(){return number;}});
  }
  function readIdent() {
    var ident = "";
    var start = index;
    var fn;
    while (index < text.length) {
      var ch = text.charAt(index);
      if (ch == '.' || isIdent(ch) || isNumber(ch)) {
        ident += ch;
      } else {
        break;
      }
      index++;
    }
    fn = OPERATORS[ident];
    tokens.push({
      index:start,
      text:ident,
      json: fn,
      fn:fn||extend(getterFn(ident), {
        assign:function(self, value){
          return setter(self, ident, value);
        }
      })
    });
  }

  function readString(quote) {
    var start = index;
    index++;
    var string = "";
    var rawString = quote;
    var escape = false;
    while (index < text.length) {
      var ch = text.charAt(index);
      rawString += ch;
      if (escape) {
        if (ch == 'u') {
          var hex = text.substring(index + 1, index + 5);
          if (!hex.match(/[\da-f]{4}/i))
            throwError( "Invalid unicode escape [\\u" + hex + "]");
          index += 4;
          string += String.fromCharCode(parseInt(hex, 16));
        } else {
          var rep = ESCAPE[ch];
          if (rep) {
            string += rep;
          } else {
            string += ch;
          }
        }
        escape = false;
      } else if (ch == '\\') {
        escape = true;
      } else if (ch == quote) {
        index++;
        tokens.push({index:start, text:rawString, string:string, json:true,
          fn:function(){
            return (string.length == dateParseLength)
              ? angular['String']['toDate'](string)
              : string;
          }});
        return;
      } else {
        string += ch;
      }
      index++;
    }
    throwError("Unterminated quote", start);
  }
}

/////////////////////////////////////////

function parser(text, json){
  var ZERO = valueFn(0),
      tokens = lex(text, json),
      assignment = _assignment,
      assignable = logicalOR,
      functionCall = _functionCall,
      fieldAccess = _fieldAccess,
      objectIndex = _objectIndex,
      filterChain = _filterChain,
      functionIdent = _functionIdent,
      pipeFunction = _pipeFunction;
  if(json){
    // The extra level of aliasing is here, just in case the lexer misses something, so that
    // we prevent any accidental execution in JSON.
    assignment = logicalOR;
    functionCall =
      fieldAccess =
      objectIndex =
      assignable =
      filterChain =
      functionIdent =
      pipeFunction =
        function (){ throwError("is not valid json", {text:text, index:0}); };
  }
  //TODO: Shouldn't all of the public methods have assertAllConsumed?
  //TODO: I think these should be public as part of the parser api instead of scope.$eval().
  return {
      assignable: assertConsumed(assignable),
      primary: assertConsumed(primary),
      statements: assertConsumed(statements),
      validator: assertConsumed(validator),
      formatter: assertConsumed(formatter),
      filter: assertConsumed(filter)
  };

  function assertConsumed(fn) {
    return function(){
      var value = fn();
      if (tokens.length !== 0) {
        throwError("is an unexpected token", tokens[0]);
      }
      return value;
    };
  }

  ///////////////////////////////////
  function throwError(msg, token) {
    throw Error("Syntax Error: Token '" + token.text +
      "' " + msg + " at column " +
      (token.index + 1) + " of the expression [" +
      text + "] starting at [" + text.substring(token.index) + "].");
  }

  function peekToken() {
    if (tokens.length === 0)
      throw Error("Unexpected end of expression: " + text);
    return tokens[0];
  }

  function peek(e1, e2, e3, e4) {
    if (tokens.length > 0) {
      var token = tokens[0];
      var t = token.text;
      if (t==e1 || t==e2 || t==e3 || t==e4 ||
          (!e1 && !e2 && !e3 && !e4)) {
        return token;
      }
    }
    return false;
  }

  function expect(e1, e2, e3, e4){
    var token = peek(e1, e2, e3, e4);
    if (token) {
      if (json && !token.json) {
        throwError("is not valid json", token);
      }
      tokens.shift();
      return token;
    }
    return false;
  }

  function consume(e1){
    if (!expect(e1)) {
      throwError("is unexpected, expecting [" + e1 + "]", peek());
    }
  }

  function unaryFn(fn, right) {
    return function(self) {
      return fn(self, right(self));
    };
  }

  function binaryFn(left, fn, right) {
    return function(self) {
      return fn(self, left(self), right(self));
    };
  }

  function hasTokens () {
    return tokens.length > 0;
  }

  function statements(){
    var statements = [];
    while(true) {
      if (tokens.length > 0 && !peek('}', ')', ';', ']'))
        statements.push(filterChain());
      if (!expect(';')) {
        // optimize for the common case where there is only one statement.
        // TODO(size): maybe we should not support multiple statements?
        return statements.length == 1
          ? statements[0]
          : function (self){
            var value;
            for ( var i = 0; i < statements.length; i++) {
              var statement = statements[i];
              if (statement)
                value = statement(self);
            }
            return value;
          };
      }
    }
  }

  function _filterChain(){
    var left = expression();
    var token;
    while(true) {
      if ((token = expect('|'))) {
        left = binaryFn(left, token.fn, filter());
      } else {
        return left;
      }
    }
  }

  function filter(){
    return pipeFunction(angularFilter);
  }

  function validator(){
    return pipeFunction(angularValidator);
  }

  function formatter(){
    var token = expect();
    var formatter = angularFormatter[token.text];
    var argFns = [];
    if (!formatter) throwError('is not a valid formatter.', token);
    while(true) {
      if ((token = expect(':'))) {
        argFns.push(expression());
      } else {
        return valueFn({
          format:invokeFn(formatter.format),
          parse:invokeFn(formatter.parse)
        });
      }
    }
    function invokeFn(fn){
      return function(self, input){
        var args = [input];
        for ( var i = 0; i < argFns.length; i++) {
          args.push(argFns[i](self));
        }
        return fn.apply(self, args);
      };
    }
  }

  function _pipeFunction(fnScope){
    var fn = functionIdent(fnScope);
    var argsFn = [];
    var token;
    while(true) {
      if ((token = expect(':'))) {
        argsFn.push(expression());
      } else {
        var fnInvoke = function(self, input){
          var args = [input];
          for ( var i = 0; i < argsFn.length; i++) {
            args.push(argsFn[i](self));
          }
          return fn.apply(self, args);
        };
        return function(){
          return fnInvoke;
        };
      }
    }
  }

  function expression(){
    return assignment();
  }

  function _assignment(){
    var left = logicalOR();
    var right;
    var token;
    if (token = expect('=')) {
      if (!left.assign) {
        throwError("implies assignment but [" +
          text.substring(0, token.index) + "] can not be assigned to", token);
      }
      right = logicalOR();
      return function(self){
        return left.assign(self, right(self));
      };
    } else {
      return left;
    }
  }

  function logicalOR(){
    var left = logicalAND();
    var token;
    while(true) {
      if ((token = expect('||'))) {
        left = binaryFn(left, token.fn, logicalAND());
      } else {
        return left;
      }
    }
  }

  function logicalAND(){
    var left = equality();
    var token;
    if ((token = expect('&&'))) {
      left = binaryFn(left, token.fn, logicalAND());
    }
    return left;
  }

  function equality(){
    var left = relational();
    var token;
    if ((token = expect('==','!='))) {
      left = binaryFn(left, token.fn, equality());
    }
    return left;
  }

  function relational(){
    var left = additive();
    var token;
    if (token = expect('<', '>', '<=', '>=')) {
      left = binaryFn(left, token.fn, relational());
    }
    return left;
  }

  function additive(){
    var left = multiplicative();
    var token;
    while(token = expect('+','-')) {
      left = binaryFn(left, token.fn, multiplicative());
    }
    return left;
  }

  function multiplicative(){
    var left = unary();
    var token;
    while(token = expect('*','/','%')) {
      left = binaryFn(left, token.fn, unary());
    }
    return left;
  }

  function unary(){
    var token;
    if (expect('+')) {
      return primary();
    } else if (token = expect('-')) {
      return binaryFn(ZERO, token.fn, unary());
    } else if (token = expect('!')) {
      return unaryFn(token.fn, unary());
    } else {
      return primary();
    }
  }

  function _functionIdent(fnScope) {
    var token = expect();
    var element = token.text.split('.');
    var instance = fnScope;
    var key;
    for ( var i = 0; i < element.length; i++) {
      key = element[i];
      if (instance)
        instance = instance[key];
    }
    if (typeof instance != $function) {
      throwError("should be a function", token);
    }
    return instance;
  }

  function primary() {
    var primary;
    if (expect('(')) {
      var expression = filterChain();
      consume(')');
      primary = expression;
    } else if (expect('[')) {
      primary = arrayDeclaration();
    } else if (expect('{')) {
      primary = object();
    } else {
      var token = expect();
      primary = token.fn;
      if (!primary) {
        throwError("not a primary expression", token);
      }
    }
    var next;
    while (next = expect('(', '[', '.')) {
      if (next.text === '(') {
        primary = functionCall(primary);
      } else if (next.text === '[') {
        primary = objectIndex(primary);
      } else if (next.text === '.') {
        primary = fieldAccess(primary);
      } else {
        throwError("IMPOSSIBLE");
      }
    }
    return primary;
  }

  function _fieldAccess(object) {
    var field = expect().text;
    var getter = getterFn(field);
    return extend(function (self){
      return getter(object(self));
    }, {
      assign:function(self, value){
        return setter(object(self), field, value);
      }
    });
  }

  function _objectIndex(obj) {
    var indexFn = expression();
    consume(']');
    return extend(
      function (self){
        var o = obj(self);
        var i = indexFn(self);
        return (o) ? o[i] : undefined;
      }, {
        assign:function(self, value){
          return obj(self)[indexFn(self)] = value;
        }
      });
  }

  function _functionCall(fn) {
    var argsFn = [];
    if (peekToken().text != ')') {
      do {
        argsFn.push(expression());
      } while (expect(','));
    }
    consume(')');
    return function (self){
      var args = [];
      for ( var i = 0; i < argsFn.length; i++) {
        args.push(argsFn[i](self));
      }
      var fnPtr = fn(self) || noop;
      // IE stupidity!
      return fnPtr.apply
          ? fnPtr.apply(self, args)
          : fnPtr(args[0], args[1], args[2], args[3], args[4]);
    };
  }

  // This is used with json array declaration
  function arrayDeclaration () {
    var elementFns = [];
    if (peekToken().text != ']') {
      do {
        elementFns.push(expression());
      } while (expect(','));
    }
    consume(']');
    return function (self){
      var array = [];
      for ( var i = 0; i < elementFns.length; i++) {
        array.push(elementFns[i](self));
      }
      return array;
    };
  }

  function object () {
    var keyValues = [];
    if (peekToken().text != '}') {
      do {
        var token = expect(),
        key = token.string || token.text;
        consume(":");
        var value = expression();
        keyValues.push({key:key, value:value});
      } while (expect(','));
    }
    consume('}');
    return function (self){
      var object = {};
      for ( var i = 0; i < keyValues.length; i++) {
        var keyValue = keyValues[i];
        var value = keyValue.value(self);
        object[keyValue.key] = value;
      }
      return object;
    };
  }

  function watchDecl () {
    var anchorName = expect().text;
    consume(":");
    var expressionFn;
    if (peekToken().text == '{') {
      consume("{");
      expressionFn = statements();
      consume("}");
    } else {
      expressionFn = expression();
    }
    return function(self) {
      return {name:anchorName, fn:expressionFn};
    };
  }
}

function Route(template, defaults) {
  this.template = template = template + '#';
  this.defaults = defaults || {};
  var urlParams = this.urlParams = {};
  forEach(template.split(/\W/), function(param){
    if (param && template.match(new RegExp(":" + param + "\\W"))) {
      urlParams[param] = true;
    }
  });
}

Route.prototype = {
  url: function(params) {
    var self = this,
        url = this.template,
        encodedVal;

    params = params || {};
    forEach(this.urlParams, function(_, urlParam){
      encodedVal = encodeUriSegment(params[urlParam] || self.defaults[urlParam] || "");
      url = url.replace(new RegExp(":" + urlParam + "(\\W)"), encodedVal + "$1");
    });
    url = url.replace(/\/?#$/, '');
    var query = [];
    forEachSorted(params, function(value, key){
      if (!self.urlParams[key]) {
        query.push(encodeUriQuery(key) + '=' + encodeUriQuery(value));
      }
    });
    url = url.replace(/\/*$/, '');
    return url + (query.length ? '?' + query.join('&') : '');
  }
};

function ResourceFactory(xhr) {
  this.xhr = xhr;
}

ResourceFactory.DEFAULT_ACTIONS = {
  'get':    {method:'GET'},
  'save':   {method:'POST'},
  'query':  {method:'GET', isArray:true},
  'remove': {method:'DELETE'},
  'delete': {method:'DELETE'}
};

ResourceFactory.prototype = {
  route: function(url, paramDefaults, actions){
    var self = this;
    var route = new Route(url);
    actions = extend({}, ResourceFactory.DEFAULT_ACTIONS, actions);
    function extractParams(data){
      var ids = {};
      forEach(paramDefaults || {}, function(value, key){
        ids[key] = value.charAt && value.charAt(0) == '@' ? getter(data, value.substr(1)) : value;
      });
      return ids;
    }

    function Resource(value){
      copy(value || {}, this);
    }

    forEach(actions, function(action, name){
      var isPostOrPut = action.method == 'POST' || action.method == 'PUT';
      Resource[name] = function (a1, a2, a3, a4) {
        var params = {};
        var data;
        var success = noop;
        var error = null;
        switch(arguments.length) {
        case 4:
          error = a4;
          success = a3;
          //fallthrough
        case 3:
        case 2:
          if (isFunction(a2)) {
            if (isFunction(a1)) {
              success = a1;
              error = a2;
              break;
            }

            success = a2;
            error = a3;
            //fallthrough
          } else {
            params = a1;
            data = a2;
            success = a3;
            break;
          }
        case 1:
          if (isFunction(a1)) success = a1;
          else if (isPostOrPut) data = a1;
          else params = a1;
          break;
        case 0: break;
        default:
          throw "Expected between 0-4 arguments [params, data, success, error], got " +
            arguments.length + " arguments.";
        }

        var value = this instanceof Resource ? this : (action.isArray ? [] : new Resource(data));
        self.xhr(
          action.method,
          route.url(extend({}, action.params || {}, extractParams(data), params)),
          data,
          function(status, response, responseHeaders) {
            if (response) {
              if (action.isArray) {
                value.length = 0;
                forEach(response, function(item) {
                  value.push(new Resource(item));
                });
              } else {
                copy(response, value);
              }
            }
            (success||noop)(value, responseHeaders);
          },
          error || action.verifyCache,
          action.verifyCache);
        return value;
      };

      Resource.bind = function(additionalParamDefaults){
        return self.route(url, extend({}, paramDefaults, additionalParamDefaults), actions);
      };

      Resource.prototype['$' + name] = function(a1, a2, a3) {
        var params = extractParams(this),
            success = noop,
            error;

        switch(arguments.length) {
        case 3: params = a1; success = a2; error = a3; break;
        case 2:
        case 1:
          if (isFunction(a1)) {
            success = a1;
            error = a2;
          } else {
            params = a1;
            success = a2 || noop;
          }
        case 0: break;
        default:
          throw "Expected between 1-3 arguments [params, success, error], got " +
            arguments.length + " arguments.";
        }
        var data = isPostOrPut ? this : undefined;
        Resource[name].call(this, params, data, success, error);
      };
    });
    return Resource;
  }
};

//////////////////////////////
// Browser
//////////////////////////////
var XHR = window.XMLHttpRequest || function () {
  try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) {}
  try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) {}
  try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) {}
  throw new Error("This browser does not support XMLHttpRequest.");
};


/**
 * @ngdoc service
 * @name angular.service.$browser
 * @requires $log
 *
 * @description
 * Constructor for the object exposed as $browser service.
 *
 * This object has two goals:
 *
 * - hide all the global state in the browser caused by the window object
 * - abstract away all the browser specific features and inconsistencies
 *
 * For tests we provide {@link angular.mock.service.$browser mock implementation} of the `$browser`
 * service, which can be used for convenient testing of the application without the interaction with
 * the real browser apis.
 */
/**
 * @param {object} window The global window object.
 * @param {object} document jQuery wrapped document.
 * @param {object} body jQuery wrapped document.body.
 * @param {function()} XHR XMLHttpRequest constructor.
 * @param {object} $log console.log or an object with the same interface.
 */
function Browser(window, document, body, XHR, $log) {
  var self = this,
      rawDocument = document[0],
      location = window.location,
      setTimeout = window.setTimeout,
      clearTimeout = window.clearTimeout,
      pendingDeferIds = {},
      lastLocationUrl;

  self.isMock = false;

  //////////////////////////////////////////////////////////////
  // XHR API
  //////////////////////////////////////////////////////////////
  var idCounter = 0;
  var outstandingRequestCount = 0;
  var outstandingRequestCallbacks = [];


  /**
   * Executes the `fn` function (supports currying) and decrements the `outstandingRequestCallbacks`
   * counter. If the counter reaches 0, all the `outstandingRequestCallbacks` are executed.
   */
  function completeOutstandingRequest(fn) {
    try {
      fn.apply(null, slice.call(arguments, 1));
    } finally {
      outstandingRequestCount--;
      if (outstandingRequestCount === 0) {
        while(outstandingRequestCallbacks.length) {
          try {
            outstandingRequestCallbacks.pop()();
          } catch (e) {
            $log.error(e);
          }
        }
      }
    }
  }

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#xhr
   * @methodOf angular.service.$browser
   *
   * @param {string} method Requested method (get|post|put|delete|head|json)
   * @param {string} url Requested url
   * @param {?string} post Post data to send (null if nothing to post)
   * @param {function(number, string, function([string]))} callback Function that will be called on
   *   response. The third argument is a function that can be called to return a specified response
   *   header or an Object containing all headers (when called with no arguments).
   * @param {object=} header additional HTTP headers to send with XHR.
   *   Standard headers are:
   *   <ul>
   *     <li><tt>Content-Type</tt>: <tt>application/x-www-form-urlencoded</tt></li>
   *     <li><tt>Accept</tt>: <tt>application/json, text/plain, &#42;/&#42;</tt></li>
   *     <li><tt>X-Requested-With</tt>: <tt>XMLHttpRequest</tt></li>
   *   </ul>
   *
   * @description
   * Send ajax request
   */
  self.xhr = function(method, url, post, callback, headers) {
    var parsedHeaders;

    outstandingRequestCount ++;
    if (lowercase(method) == 'json') {
      var callbackId = ("angular_" + Math.random() + '_' + (idCounter++)).replace(/\d\./, '');
      window[callbackId] = function(data) {
        window[callbackId].data = data;
      };

      var script = self.addJs(url.replace('JSON_CALLBACK', callbackId), null, function() {
        if (window[callbackId].data) {
          completeOutstandingRequest(callback, 200, window[callbackId].data);
        } else {
          completeOutstandingRequest(callback);
        }
        delete window[callbackId];
        body[0].removeChild(script);
      });
    } else {
      var xhr = new XHR();
      xhr.open(method, url, true);
      forEach(headers, function(value, key) {
          if (value) xhr.setRequestHeader(key, value);
      });
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          // normalize IE bug (http://bugs.jquery.com/ticket/1450)
          var status = xhr.status == 1223 ? 204 : xhr.status || 200;
          completeOutstandingRequest(callback, status, xhr.responseText, function(header) {
            header = lowercase(header);

            if (header) {
              return parsedHeaders
                ? parsedHeaders[header] || null
                : xhr.getResponseHeader(header);
            } else {
              // Return an object containing each response header
              parsedHeaders = {};

              forEach(xhr.getAllResponseHeaders().split('\n'), function(line) {
                var i = line.indexOf(':'),
                    key = lowercase(trim(line.substr(0, i))),
                    value = trim(line.substr(i + 1));

                if (parsedHeaders[key]) {
                  // Combine repeated headers
                  // http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2
                  parsedHeaders[key] += ', ' + value;
                } else {
                  parsedHeaders[key] = value;
                }
              });

              return parsedHeaders;
            }
          });
        }
      };
      xhr.send(post || '');
    }
  };

  /**
   * @private
   * Note: this method is used only by scenario runner
   * TODO(vojta): prefix this method with $$ ?
   * @param {function()} callback Function that will be called when no outstanding request
   */
  self.notifyWhenNoOutstandingRequests = function(callback) {
    // force browser to execute all pollFns - this is needed so that cookies and other pollers fire
    // at some deterministic time in respect to the test runner's actions. Leaving things up to the
    // regular poller would result in flaky tests.
    forEach(pollFns, function(pollFn){ pollFn(); });

    if (outstandingRequestCount === 0) {
      callback();
    } else {
      outstandingRequestCallbacks.push(callback);
    }
  };

  //////////////////////////////////////////////////////////////
  // Poll Watcher API
  //////////////////////////////////////////////////////////////
  var pollFns = [],
      pollTimeout;

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#addPollFn
   * @methodOf angular.service.$browser
   *
   * @param {function()} fn Poll function to add
   *
   * @description
   * Adds a function to the list of functions that poller periodically executes,
   * and starts polling if not started yet.
   *
   * @returns {function()} the added function
   */
  self.addPollFn = function(fn) {
    if (isUndefined(pollTimeout)) startPoller(100, setTimeout);
    pollFns.push(fn);
    return fn;
  };

  /**
   * @param {number} interval How often should browser call poll functions (ms)
   * @param {function()} setTimeout Reference to a real or fake `setTimeout` function.
   *
   * @description
   * Configures the poller to run in the specified intervals, using the specified
   * setTimeout fn and kicks it off.
   */
  function startPoller(interval, setTimeout) {
    (function check() {
      forEach(pollFns, function(pollFn){ pollFn(); });
      pollTimeout = setTimeout(check, interval);
    })();
  };

  //////////////////////////////////////////////////////////////
  // URL API
  //////////////////////////////////////////////////////////////

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#setUrl
   * @methodOf angular.service.$browser
   *
   * @param {string} url New url
   *
   * @description
   * Sets browser's url
   */
  self.setUrl = function(url) {

    var existingURL = lastLocationUrl;
    if (!existingURL.match(/#/)) existingURL += '#';
    if (!url.match(/#/)) url += '#';
    if (existingURL != url) {
      location.href = url;
    }
   };

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#getUrl
   * @methodOf angular.service.$browser
   *
   * @description
   * Get current browser's url
   *
   * @returns {string} Browser's url
   */
  self.getUrl = function() {
    return lastLocationUrl = location.href;
  };


  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#onHashChange
   * @methodOf angular.service.$browser
   *
   * @description
   * Detects if browser support onhashchange events and register a listener otherwise registers
   * $browser poller. The `listener` will then get called when the hash changes.
   *
   * The listener gets called with either HashChangeEvent object or simple object that also contains
   * `oldURL` and `newURL` properties.
   *
   * Note: this api is intended for use only by the $location service. Please use the
   * {@link angular.service.$location $location service} to monitor hash changes in angular apps.
   *
   * @param {function(event)} listener Listener function to be called when url hash changes.
   * @return {function()} Returns the registered listener fn - handy if the fn is anonymous.
   */
  self.onHashChange = function(listener) {
    // IE8 comp mode returns true, but doesn't support hashchange event
    var dm = window.document.documentMode;
    if ('onhashchange' in window && (isUndefined(dm) || dm >= 8)) {
      jqLite(window).bind('hashchange', listener);
    } else {
      var lastBrowserUrl = self.getUrl();

      self.addPollFn(function() {
        if (lastBrowserUrl != self.getUrl()) {
          listener();
          lastBrowserUrl = self.getUrl();
        }
      });
    }
    return listener;
  };

  //////////////////////////////////////////////////////////////
  // Cookies API
  //////////////////////////////////////////////////////////////
  var lastCookies = {};
  var lastCookieString = '';

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#cookies
   * @methodOf angular.service.$browser
   *
   * @param {string=} name Cookie name
   * @param {string=} value Cokkie value
   *
   * @description
   * The cookies method provides a 'private' low level access to browser cookies.
   * It is not meant to be used directly, use the $cookie service instead.
   *
   * The return values vary depending on the arguments that the method was called with as follows:
   * <ul>
   *   <li>cookies() -> hash of all cookies, this is NOT a copy of the internal state, so do not modify it</li>
   *   <li>cookies(name, value) -> set name to value, if value is undefined delete the cookie</li>
   *   <li>cookies(name) -> the same as (name, undefined) == DELETES (no one calls it right now that way)</li>
   * </ul>
   *
   * @returns {Object} Hash of all cookies (if called without any parameter)
   */
  self.cookies = function (name, value) {
    var cookieLength, cookieArray, cookie, i, keyValue, index;

    if (name) {
      if (value === undefined) {
        rawDocument.cookie = escape(name) + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } else {
        if (isString(value)) {
          rawDocument.cookie = escape(name) + '=' + escape(value);

          cookieLength = name.length + value.length + 1;
          if (cookieLength > 4096) {
            $log.warn("Cookie '"+ name +"' possibly not set or overflowed because it was too large ("+
              cookieLength + " > 4096 bytes)!");
          }
          if (lastCookies.length > 20) {
            $log.warn("Cookie '"+ name +"' possibly not set or overflowed because too many cookies " +
              "were already set (" + lastCookies.length + " > 20 )");
          }
        }
      }
    } else {
      if (rawDocument.cookie !== lastCookieString) {
        lastCookieString = rawDocument.cookie;
        cookieArray = lastCookieString.split("; ");
        lastCookies = {};

        for (i = 0; i < cookieArray.length; i++) {
          cookie = cookieArray[i];
          index = cookie.indexOf('=');
          if (index > 0) { //ignore nameless cookies
            lastCookies[unescape(cookie.substring(0, index))] = unescape(cookie.substring(index + 1));
          }
        }
      }
      return lastCookies;
    }
  };


  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#defer
   * @methodOf angular.service.$browser
   * @param {function()} fn A function, who's execution should be defered.
   * @param {number=} [delay=0] of milliseconds to defer the function execution.
   * @returns {*} DeferId that can be used to cancel the task via `$browser.defer.cancel()`.
   *
   * @description
   * Executes a fn asynchroniously via `setTimeout(fn, delay)`.
   *
   * Unlike when calling `setTimeout` directly, in test this function is mocked and instead of using
   * `setTimeout` in tests, the fns are queued in an array, which can be programmatically flushed
   * via `$browser.defer.flush()`.
   *
   */
  self.defer = function(fn, delay) {
    var timeoutId;
    outstandingRequestCount++;
    timeoutId = setTimeout(function() {
      delete pendingDeferIds[timeoutId];
      completeOutstandingRequest(fn);
    }, delay || 0);
    pendingDeferIds[timeoutId] = true;
    return timeoutId;
  };


  /**
   * THIS DOC IS NOT VISIBLE because ngdocs can't process docs for foo#method.method
   *
   * @name angular.service.$browser#defer.cancel
   * @methodOf angular.service.$browser.defer
   * @returns {boolean} Returns `true` if the task hasn't executed yet and was successfuly canceled.
   *
   * @description
   * Cancels a defered task identified with `deferId`.
   */

  self.defer.cancel = function(deferId) {
    if (pendingDeferIds[deferId]) {
      delete pendingDeferIds[deferId];
      clearTimeout(deferId);
      completeOutstandingRequest(noop);
      return true;
    }
  };


  //////////////////////////////////////////////////////////////
  // Misc API
  //////////////////////////////////////////////////////////////
  var hoverListener = noop;

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#hover
   * @methodOf angular.service.$browser
   *
   * @description
   * Set hover listener.
   *
   * @param {function(Object, boolean)} listener Function that will be called when a hover event
   *    occurs.
   */
  self.hover = function(listener) { hoverListener = listener; };

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#bind
   * @methodOf angular.service.$browser
   *
   * @description
   * Register hover function to real browser
   */
  self.bind = function() {
    document.bind("mouseover", function(event){
      hoverListener(jqLite(msie ? event.srcElement : event.target), true);
      return true;
    });
    document.bind("mouseleave mouseout click dblclick keypress keyup", function(event){
      hoverListener(jqLite(event.target), false);
      return true;
    });
  };


  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#addCss
   * @methodOf angular.service.$browser
   *
   * @param {string} url Url to css file
   * @description
   * Adds a stylesheet tag to the head.
   */
  self.addCss = function(url) {
    var link = jqLite(rawDocument.createElement('link'));
    link.attr('rel', 'stylesheet');
    link.attr('type', 'text/css');
    link.attr('href', url);
    body.append(link);
  };


  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$browser#addJs
   * @methodOf angular.service.$browser
   *
   * @param {string} url Url to js file
   * @param {string=} domId Optional id for the script tag
   *
   * @description
   * Adds a script tag to the head.
   */
  self.addJs = function(url, domId, done) {
    // we can't use jQuery/jqLite here because jQuery does crazy shit with script elements, e.g.:
    // - fetches local scripts via XHR and evals them
    // - adds and immediately removes script elements from the document
    //
    // We need addJs to be able to add angular-ie-compat.js which is very special and must remain
    // part of the DOM so that the embedded images can reference it. jQuery's append implementation
    // (v1.4.2) fubars it.
    var script = rawDocument.createElement('script');

    script.type = 'text/javascript';
    script.src = url;
    if (domId) script.id = domId;

    if (msie) {
      script.onreadystatechange = function() {
        /loaded|complete/.test(script.readyState) && done && done();
      };
    } else {
      if (done) script.onload = script.onerror = done;
    }

    body[0].appendChild(script);

    return script;
  };
}

/*
 * HTML Parser By Misko Hevery (misko@hevery.com)
 * based on:  HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 */

// Regular Expressions for parsing tags and attributes
var START_TAG_REGEXP = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/,
  END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/,
  ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,
  BEGIN_TAG_REGEXP = /^</,
  BEGING_END_TAGE_REGEXP = /^<\s*\//,
  COMMENT_REGEXP = /<!--(.*?)-->/g,
  CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g,
  URI_REGEXP = /^((ftp|https?):\/\/|mailto:|#)/,
  NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g; // Match everything outside of normal chars and " (quote character)

// Empty Elements - HTML 4.01
var emptyElements = makeMap("area,br,col,hr,img");

// Block Elements - HTML 4.01
var blockElements = makeMap("address,blockquote,center,dd,del,dir,div,dl,dt,"+
    "hr,ins,li,map,menu,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

// Inline Elements - HTML 4.01
var inlineElements = makeMap("a,abbr,acronym,b,bdo,big,br,cite,code,del,dfn,em,font,i,img,"+
    "ins,kbd,label,map,q,s,samp,small,span,strike,strong,sub,sup,tt,u,var");
// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelfElements = makeMap("colgroup,dd,dt,li,p,td,tfoot,th,thead,tr");
// Special Elements (can contain anything)
var specialElements = makeMap("script,style");
var validElements = extend({}, emptyElements, blockElements, inlineElements, closeSelfElements);

//Attributes that have href and hence need to be sanitized
var uriAttrs = makeMap("background,href,longdesc,src,usemap");
var validAttrs = extend({}, uriAttrs, makeMap(
    'abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,'+
    'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,'+
    'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,'+
    'scope,scrolling,shape,span,start,summary,target,title,type,'+
    'valign,value,vspace,width'));

/**
 * @example
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * @param {string} html string
 * @param {object} handler
 */
function htmlParser( html, handler ) {
  var index, chars, match, stack = [], last = html;
  stack.last = function(){ return stack[ stack.length - 1 ]; };

  while ( html ) {
    chars = true;

    // Make sure we're not in a script or style element
    if ( !stack.last() || !specialElements[ stack.last() ] ) {

      // Comment
      if ( html.indexOf("<!--") === 0 ) {
        index = html.indexOf("-->");

        if ( index >= 0 ) {
          if (handler.comment) handler.comment( html.substring( 4, index ) );
          html = html.substring( index + 3 );
          chars = false;
        }

      // end tag
      } else if ( BEGING_END_TAGE_REGEXP.test(html) ) {
        match = html.match( END_TAG_REGEXP );

        if ( match ) {
          html = html.substring( match[0].length );
          match[0].replace( END_TAG_REGEXP, parseEndTag );
          chars = false;
        }

      // start tag
      } else if ( BEGIN_TAG_REGEXP.test(html) ) {
        match = html.match( START_TAG_REGEXP );

        if ( match ) {
          html = html.substring( match[0].length );
          match[0].replace( START_TAG_REGEXP, parseStartTag );
          chars = false;
        }
      }

      if ( chars ) {
        index = html.indexOf("<");

        var text = index < 0 ? html : html.substring( 0, index );
        html = index < 0 ? "" : html.substring( index );

        if (handler.chars) handler.chars( decodeEntities(text) );
      }

    } else {
      html = html.replace(new RegExp("(.*)<\\s*\\/\\s*" + stack.last() + "[^>]*>", 'i'), function(all, text){
        text = text.
          replace(COMMENT_REGEXP, "$1").
          replace(CDATA_REGEXP, "$1");

        if (handler.chars) handler.chars( decodeEntities(text) );

        return "";
      });

      parseEndTag( "", stack.last() );
    }

    if ( html == last ) {
      throw "Parse Error: " + html;
    }
    last = html;
  }

  // Clean up any remaining tags
  parseEndTag();

  function parseStartTag( tag, tagName, rest, unary ) {
    tagName = lowercase(tagName);
    if ( blockElements[ tagName ] ) {
      while ( stack.last() && inlineElements[ stack.last() ] ) {
        parseEndTag( "", stack.last() );
      }
    }

    if ( closeSelfElements[ tagName ] && stack.last() == tagName ) {
      parseEndTag( "", tagName );
    }

    unary = emptyElements[ tagName ] || !!unary;

    if ( !unary )
      stack.push( tagName );

    var attrs = {};

    rest.replace(ATTR_REGEXP, function(match, name, doubleQuotedValue, singleQoutedValue, unqoutedValue) {
      var value = doubleQuotedValue
        || singleQoutedValue
        || unqoutedValue
        || '';

      attrs[name] = decodeEntities(value);
    });
    if (handler.start) handler.start( tagName, attrs, unary );
  }

  function parseEndTag( tag, tagName ) {
    var pos = 0, i;
    tagName = lowercase(tagName);
    if ( tagName )
      // Find the closest opened tag of the same type
      for ( pos = stack.length - 1; pos >= 0; pos-- )
        if ( stack[ pos ] == tagName )
          break;

    if ( pos >= 0 ) {
      // Close all the open elements, up the stack
      for ( i = stack.length - 1; i >= pos; i-- )
        if (handler.end) handler.end( stack[ i ] );

      // Remove the open elements from the stack
      stack.length = pos;
    }
  }
}

/**
 * decodes all entities into regular string
 * @param value
 * @returns {string} A string with decoded entities.
 */
var hiddenPre=document.createElement("pre");
function decodeEntities(value) {
  hiddenPre.innerHTML=value.replace(/</g,"&lt;");
  return hiddenPre.innerText || hiddenPre.textContent || '';
}

/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns escaped text
 */
function encodeEntities(value) {
  return value.
    replace(/&/g, '&amp;').
    replace(NON_ALPHANUMERIC_REGEXP, function(value){
      return '&#' + value.charCodeAt(0) + ';';
    }).
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;');
}

/**
 * create an HTML/XML writer which writes to buffer
 * @param {Array} buf use buf.jain('') to get out sanitized html string
 * @returns {object} in the form of {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * }
 */
function htmlSanitizeWriter(buf){
  var ignore = false;
  var out = bind(buf, buf.push);
  return {
    start: function(tag, attrs, unary){
      tag = lowercase(tag);
      if (!ignore && specialElements[tag]) {
        ignore = tag;
      }
      if (!ignore && validElements[tag] == true) {
        out('<');
        out(tag);
        forEach(attrs, function(value, key){
          var lkey=lowercase(key);
          if (validAttrs[lkey]==true && (uriAttrs[lkey]!==true || value.match(URI_REGEXP))) {
            out(' ');
            out(key);
            out('="');
            out(encodeEntities(value));
            out('"');
          }
        });
        out(unary ? '/>' : '>');
      }
    },
    end: function(tag){
        tag = lowercase(tag);
        if (!ignore && validElements[tag] == true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignore) {
          ignore = false;
        }
      },
    chars: function(chars){
        if (!ignore) {
          out(encodeEntities(chars));
        }
      }
  };
}

//////////////////////////////////
//JQLite
//////////////////////////////////

/**
 * @workInProgress
 * @ngdoc function
 * @name angular.element
 * @function
 *
 * @description
 * Wraps a raw DOM element or HTML string as [jQuery](http://jquery.com) element.
 * `angular.element` is either an alias for [jQuery](http://api.jquery.com/jQuery/) function if
 * jQuery is loaded or a function that wraps the element or string in angular's jQuery lite
 * implementation.
 *
 * Real jQuery always takes precedence (as long as it was loaded before `DOMContentEvent`)
 *
 * Angular's jQuery lite implementation is a tiny API-compatible subset of jQuery which allows
 * angular to manipulate DOM. The jQuery lite implements only a subset of jQuery api, with the
 * focus on the most commonly needed functionality and minimal footprint. For this reason only a
 * limited number of jQuery methods, arguments and invocation styles are supported.
 *
 * Note: All element references in angular are always wrapped with jQuery (lite) and are never
 * raw DOM references.
 *
 * ## Angular's jQuery lite implements these functions:
 *
 * - [addClass()](http://api.jquery.com/addClass/)
 * - [after()](http://api.jquery.com/after/)
 * - [append()](http://api.jquery.com/append/)
 * - [attr()](http://api.jquery.com/attr/)
 * - [bind()](http://api.jquery.com/bind/)
 * - [children()](http://api.jquery.com/children/)
 * - [clone()](http://api.jquery.com/clone/)
 * - [css()](http://api.jquery.com/css/)
 * - [data()](http://api.jquery.com/data/)
 * - [hasClass()](http://api.jquery.com/hasClass/)
 * - [parent()](http://api.jquery.com/parent/)
 * - [remove()](http://api.jquery.com/remove/)
 * - [removeAttr()](http://api.jquery.com/removeAttr/)
 * - [removeClass()](http://api.jquery.com/removeClass/)
 * - [removeData()](http://api.jquery.com/removeData/)
 * - [replaceWith()](http://api.jquery.com/replaceWith/)
 * - [text()](http://api.jquery.com/text/)
 * - [trigger()](http://api.jquery.com/trigger/)
 * - [eq()](http://api.jquery.com/eq/)
 *
 * ## Additionally these methods extend the jQuery and  are available in both jQuery and jQuery lite
 * version:
 *
 *- `scope()` - retrieves the current angular scope of the element.
 *
 * @param {string|DOMElement} element HTML string or DOMElement to be wrapped into jQuery.
 * @returns {Object} jQuery object.
 */

var jqCache = {},
    jqName = 'ng-' + new Date().getTime(),
    jqId = 1,
    addEventListenerFn = (window.document.addEventListener
      ? function(element, type, fn) {element.addEventListener(type, fn, false);}
      : function(element, type, fn) {element.attachEvent('on' + type, fn);}),
    removeEventListenerFn = (window.document.removeEventListener
      ? function(element, type, fn) {element.removeEventListener(type, fn, false); }
      : function(element, type, fn) {element.detachEvent('on' + type, fn); });

function jqNextId() { return (jqId++); }


function getStyle(element) {
  var current = {}, style = element[0].style, value, name, i;
  if (typeof style.length == 'number') {
    for(i = 0; i < style.length; i++) {
      name = style[i];
      current[name] = style[name];
    }
  } else {
    for (name in style) {
      value = style[name];
      if (1*name != name && name != 'cssText' && value && typeof value == 'string' && value !='false')
        current[name] = value;
    }
  }
  return current;
}

/////////////////////////////////////////////
function jqLiteWrap(element) {
  if (isString(element) && element.charAt(0) != '<') {
    throw new Error('selectors not implemented');
  }
  return new JQLite(element);
}

function JQLite(element) {
  if (element instanceof JQLite) {
    return element;
  } else if (isString(element)) {
    var div = document.createElement('div');
    // Read about the NoScope elements here:
    // http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx
    div.innerHTML = '<div>&nbsp;</div>' + element; // IE insanity to make NoScope elements work!
    div.removeChild(div.firstChild); // remove the superfluous div
    JQLiteAddNodes(this, div.childNodes);
    this.remove(); // detach the elements from the temporary DOM div.
  } else {
    JQLiteAddNodes(this, element);
  }
}

function JQLiteClone(element) {
  return element.cloneNode(true);
}

function JQLiteDealoc(element){
  JQLiteRemoveData(element);
  for ( var i = 0, children = element.childNodes || []; i < children.length; i++) {
    JQLiteDealoc(children[i]);
  }
}

function JQLiteRemoveData(element) {
  var cacheId = element[jqName],
  cache = jqCache[cacheId];
  if (cache) {
    forEach(cache.bind || {}, function(fn, type){
      removeEventListenerFn(element, type, fn);
    });
    delete jqCache[cacheId];
    element[jqName] = undefined; // ie does not allow deletion of attributes on elements.
  }
}

function JQLiteData(element, key, value) {
  var cacheId = element[jqName],
      cache = jqCache[cacheId || -1];
  if (isDefined(value)) {
    if (!cache) {
      element[jqName] = cacheId = jqNextId();
      cache = jqCache[cacheId] = {};
    }
    cache[key] = value;
  } else {
    return cache ? cache[key] : null;
  }
}

function JQLiteHasClass(element, selector, _) {
  // the argument '_' is important, since it makes the function have 3 arguments, which
  // is needed for delegate function to realize the this is a getter.
  var className = " " + selector + " ";
  return ((" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf( className ) > -1);
}

function JQLiteRemoveClass(element, selector) {
  element.className = trim(
      (" " + element.className + " ")
      .replace(/[\n\t]/g, " ")
      .replace(" " + selector + " ", "")
  );
}

function JQLiteAddClass(element, selector ) {
  if (!JQLiteHasClass(element, selector)) {
    element.className = trim(element.className + ' ' + selector);
  }
}

function JQLiteAddNodes(root, elements) {
  if (elements) {
    elements = (!elements.nodeName && isDefined(elements.length) && !isWindow(elements))
      ? elements
      : [ elements ];
    for(var i=0; i < elements.length; i++) {
      root.push(elements[i]);
    }
  }
}

//////////////////////////////////////////
// Functions which are declared directly.
//////////////////////////////////////////
var JQLitePrototype = JQLite.prototype = {
  ready: function(fn) {
    var fired = false;

    function trigger() {
      if (fired) return;
      fired = true;
      fn();
    }

    this.bind('DOMContentLoaded', trigger); // works for modern browsers and IE9
    // we can not use jqLite since we are not done loading and jQuery could be loaded later.
    jqLiteWrap(window).bind('load', trigger); // fallback to window.onload for others
  },
  toString: function() {
    var value = [];
    forEach(this, function(e){ value.push('' + e);});
    return '[' + value.join(', ') + ']';
  },

  eq: function(index) {
      return (index >= 0) ? jqLite(this[index]) : jqLite(this[this.length + index]);
  },

  length: 0,
  push: push,
  sort: [].sort,
  splice: [].splice
};

//////////////////////////////////////////
// Functions iterating getter/setters.
// these functions return self on setter and
// value on get.
//////////////////////////////////////////
var SPECIAL_ATTR = makeMap("multiple,selected,checked,disabled,readonly");

forEach({
  data: JQLiteData,

  scope: function(element) {
    var scope;
    while (element && !(scope = jqLite(element).data($$scope))) {
      element = element.parentNode;
    }
    return scope;
  },

  removeAttr: function(element,name) {
    element.removeAttribute(name);
  },

  hasClass: JQLiteHasClass,

  css: function(element, name, value) {
    if (isDefined(value)) {
      element.style[name] = value;
    } else {
      return element.style[name];
    }
  },

  attr: function(element, name, value){
    if (SPECIAL_ATTR[name]) {
      if (isDefined(value)) {
        element[name] = !!value;
      } else {
        return element[name];
      }
    } else if (isDefined(value)) {
      element.setAttribute(name, value);
    } else if (element.getAttribute) {
      // the extra argument "2" is to get the right thing for a.href in IE, see jQuery code
      // some elements (e.g. Document) don't have get attribute, so return undefined
      var ret = element.getAttribute(name, 2);
      // normalize non-existing attributes to undefined (as jQuery)
      return ret === null ? undefined : ret;
    }
  },

  text: extend((msie < 9)
      ? function(element, value) {
        // NodeType == 3 is text node
        if (element.nodeType == 3) {
          if (isUndefined(value))
            return element.nodeValue;
          element.nodeValue = value;
        } else {
          if (isUndefined(value))
            return element.innerText;
          element.innerText = value;
        }
      }
      : function(element, value) {
        if (isUndefined(value)) {
          return element.textContent;
        }
        element.textContent = value;
      }, {$dv:''}),

  val: function(element, value) {
    if (isUndefined(value)) {
      return element.value;
    }
    element.value = value;
  },

  html: function(element, value) {
    if (isUndefined(value)) {
      return element.innerHTML;
    }
    for (var i = 0, childNodes = element.childNodes; i < childNodes.length; i++) {
      JQLiteDealoc(childNodes[i]);
    }
    element.innerHTML = value;
  }
}, function(fn, name){
  /**
   * Properties: writes return selection, reads return first value
   */
  JQLite.prototype[name] = function(arg1, arg2) {
    var i, key;

    if ((fn.length == 2 ? arg1 : arg2) === undefined) {
      if (isObject(arg1)) {
        // we are a write, but the object properties are the key/values
        for(i=0; i < this.length; i++) {
          for (key in arg1) {
            fn(this[i], key, arg1[key]);
          }
        }
        // return self for chaining
        return this;
      } else {
        // we are a read, so read the first child.
        if (this.length)
          return fn(this[0], arg1, arg2);
      }
    } else {
      // we are a write, so apply to all children
      for(i=0; i < this.length; i++) {
        fn(this[i], arg1, arg2);
      }
      // return self for chaining
      return this;
    }
    return fn.$dv;
  };
});

//////////////////////////////////////////
// Functions iterating traversal.
// These functions chain results into a single
// selector.
//////////////////////////////////////////
forEach({
  removeData: JQLiteRemoveData,

  dealoc: JQLiteDealoc,

  bind: function(element, type, fn){
    var bind = JQLiteData(element, 'bind');
    if (!bind) JQLiteData(element, 'bind', bind = {});
    forEach(type.split(' '), function(type){
      var eventHandler = bind[type];
      if (!eventHandler) {
        bind[type] = eventHandler = function(event) {
          if (!event.preventDefault) {
            event.preventDefault = function(){
              event.returnValue = false; //ie
            };
          }
          if (!event.stopPropagation) {
            event.stopPropagation = function() {
              event.cancelBubble = true; //ie
            };
          }
          if (!event.target) {
            event.target = event.srcElement || document;
          }
          forEach(eventHandler.fns, function(fn){
            fn.call(element, event);
          });
        };
        eventHandler.fns = [];
        addEventListenerFn(element, type, eventHandler);
      }
      eventHandler.fns.push(fn);
    });
  },

  replaceWith: function(element, replaceNode) {
    var index, parent = element.parentNode;
    JQLiteDealoc(element);
    forEach(new JQLite(replaceNode), function(node){
      if (index) {
        parent.insertBefore(node, index.nextSibling);
      } else {
        parent.replaceChild(node, element);
      }
      index = node;
    });
  },

  children: function(element) {
    var children = [];
    forEach(element.childNodes, function(element){
      if (element.nodeName != '#text')
        children.push(element);
    });
    return children;
  },

  append: function(element, node) {
    forEach(new JQLite(node), function(child){
      if (element.nodeType === 1)
        element.appendChild(child);
    });
  },

  prepend: function(element, node) {
    if (element.nodeType === 1) {
      var index = element.firstChild;
      forEach(new JQLite(node), function(child){
        if (index) {
          element.insertBefore(child, index);
        } else {
          element.appendChild(child);
          index = child;
        }
      });
    }
  },

  remove: function(element) {
    JQLiteDealoc(element);
    var parent = element.parentNode;
    if (parent) parent.removeChild(element);
  },

  after: function(element, newElement) {
    var index = element, parent = element.parentNode;
    forEach(new JQLite(newElement), function(node){
      parent.insertBefore(node, index.nextSibling);
      index = node;
    });
  },

  addClass: JQLiteAddClass,
  removeClass: JQLiteRemoveClass,

  toggleClass: function(element, selector, condition) {
    if (isUndefined(condition)) {
      condition = !JQLiteHasClass(element, selector);
    }
    (condition ? JQLiteAddClass : JQLiteRemoveClass)(element, selector);
  },

  parent: function(element) {
    var parent = element.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  },

  next: function(element) {
    return element.nextSibling;
  },

  find: function(element, selector) {
    return element.getElementsByTagName(selector);
  },

  clone: JQLiteClone
}, function(fn, name){
  /**
   * chaining functions
   */
  JQLite.prototype[name] = function(arg1, arg2) {
    var value;
    for(var i=0; i < this.length; i++) {
      if (value == undefined) {
        value = fn(this[i], arg1, arg2);
        if (value !== undefined) {
          // any function which returns a value needs to be wrapped
          value = jqLite(value);
        }
      } else {
        JQLiteAddNodes(value, fn(this[i], arg1, arg2));
      }
    }
    return value == undefined ? this : value;
  };
});

var angularGlobal = {
  'typeOf':function(obj){
    if (obj === null) return $null;
    var type = typeof obj;
    if (type == $object) {
      if (obj instanceof Array) return $array;
      if (isDate(obj)) return $date;
      if (obj.nodeType == 1) return $element;
    }
    return type;
  }
};


/**
 * @ngdoc overview
 * @name angular.Object
 * @function
 *
 * @description
 * A namespace for utility functions used to work with JavaScript objects. These functions are
 * exposed in two ways:
 *
 * __* Angular expressions:__ Functions are bound to all objects and augment the Object type. The
 * names of these methods are prefixed with the '$' character in order to minimize naming collisions.
 * To call a method, invoke the function without the first argument, e.g, `myObject.$foo(param2)`.
 *
 * __* JavaScript code:__ Functions don't augment the Object type and must be invoked as functions of
 * `angular.Object` as `angular.Object.foo(myObject, param2)`.
 *
 * * {@link angular.Object.copy angular.Object.copy()} - Creates a deep copy of the source parameter
 * * {@link angular.Object.equals angular.Object.equals()} - Determines if two objects or values are
 * equivalent
 * * {@link angular.Object.size angular.Object.size()} - Determines the number of elements in
 * strings, arrays, and objects.
 */
var angularCollection = {
  'copy': copy,
  'size': size,
  'equals': equals
};
var angularObject = {
  'extend': extend
};

/**
 * @ngdoc overview
 * @name angular.Array
 *
 * @description
 * A namespace for utility functions for the manipulation of JavaScript Array objects.
 *
 * These functions are exposed in two ways:
 *
 * * __Angular expressions:__ Functions are bound to the Array objects and augment the Array type as
 * array methods. The names of these methods are prefixed with $ character to minimize naming
 * collisions. To call a method, invoke myArrayObject.$foo(params).
 *
 *     Because Array type is a subtype of the Object type, all angular.Object functions augment
 *     theArray type in angular expressions as well.
 *
 * * __JavaScript code:__ Functions don't augment the Array type and must be invoked as functions of
 * `angular.Array` as `angular.Array.foo(myArrayObject, params)`.
 *
 * The following APIs are built-in to the angular Array object:
 *
 * * {@link angular.Array.add angular.Array.add()} - Optionally adds a new element to an array.
 * * {@link angular.Array.count angular.Array.count()} - Determines the number of elements in an
 * array.
 * * {@link angular.Array.filter angular.Array.filter()} - Returns a subset of items as a new array.
 * * {@link angular.Array.indexOf angular.Array.indexOf()} - Determines the index of an array value.
 * * {@link angular.Array.limitTo angular.Array.limitTo()} - Creates a new array off the front or
 * back of an existing array.
 * * {@link angular.Array.orderBy angular.Array.orderBy()} - Orders array elements
 * * {@link angular.Array.remove angular.Array.remove()} - Removes array elements
 * * {@link angular.Array.sum angular.Array.sum()} - Sums the number elements in an array
 */
var angularArray = {


  /**
   * @ngdoc function
   * @name angular.Array.indexOf
   * @function
   *
   * @description
   * Determines the index of `value` in `array`.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array Array to search.
   * @param {*} value Value to search for.
   * @returns {number} The position of the element in `array`. The position is 0-based. `-1` is returned if the value can't be found.
   *
   * @example
      <doc:example>
        <doc:source>
         <div ng:init="books = ['Moby Dick', 'Great Gatsby', 'Romeo and Juliet']"></div>
         <input name='bookName' value='Romeo and Juliet'> <br>
         Index of '{{bookName}}' in the list {{books}} is <em>{{books.$indexOf(bookName)}}</em>.
        </doc:source>
        <doc:scenario>
         it('should correctly calculate the initial index', function() {
           expect(binding('books.$indexOf(bookName)')).toBe('2');
         });

         it('should recalculate', function() {
           input('bookName').enter('foo');
           expect(binding('books.$indexOf(bookName)')).toBe('-1');

           input('bookName').enter('Moby Dick');
           expect(binding('books.$indexOf(bookName)')).toBe('0');
         });
        </doc:scenario>
      </doc:example>
   */
  'indexOf': indexOf,


  /**
   * @ngdoc function
   * @name angular.Array.sum
   * @function
   *
   * @description
   * This function calculates the sum of all numbers in `array`. If the `expressions` is supplied,
   * it is evaluated once for each element in `array` and then the sum of these values is returned.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array The source array.
   * @param {(string|function())=} expression Angular expression or a function to be evaluated for each
   *     element in `array`. The array element becomes the `this` during the evaluation.
   * @returns {number} Sum of items in the array.
   *
   * @example
      <doc:example>
        <doc:source>
         <table ng:init="invoice= {items:[{qty:10, description:'gadget', cost:9.95}]}">
           <tr><th>Qty</th><th>Description</th><th>Cost</th><th>Total</th><th></th></tr>
           <tr ng:repeat="item in invoice.items">
             <td><input name="item.qty" value="1" size="4" ng:required ng:validate="integer"></td>
            <td><input name="item.description"></td>
              <td><input name="item.cost" value="0.00" ng:required ng:validate="number" size="6"></td>
             <td>{{item.qty * item.cost | currency}}</td>
             <td>[<a href ng:click="invoice.items.$remove(item)">X</a>]</td>
           </tr>
           <tr>
             <td><a href ng:click="invoice.items.$add()">add item</a></td>
             <td></td>
             <td>Total:</td>
             <td>{{invoice.items.$sum('qty*cost') | currency}}</td>
           </tr>
         </table>
        </doc:source>
        <doc:scenario>
         //TODO: these specs are lame because I had to work around issues #164 and #167
         it('should initialize and calculate the totals', function() {
           expect(repeater('.doc-example-live table tr', 'item in invoice.items').count()).toBe(3);
           expect(repeater('.doc-example-live table tr', 'item in invoice.items').row(1)).
             toEqual(['$99.50']);
           expect(binding("invoice.items.$sum('qty*cost')")).toBe('$99.50');
           expect(binding("invoice.items.$sum('qty*cost')")).toBe('$99.50');
         });

         it('should add an entry and recalculate', function() {
           element('.doc-example-live a:contains("add item")').click();
           using('.doc-example-live tr:nth-child(3)').input('item.qty').enter('20');
           using('.doc-example-live tr:nth-child(3)').input('item.cost').enter('100');

           expect(repeater('.doc-example-live table tr', 'item in invoice.items').row(2)).
             toEqual(['$2,000.00']);
           expect(binding("invoice.items.$sum('qty*cost')")).toBe('$2,099.50');
         });
        </doc:scenario>
      </doc:example>
   */
  'sum':function(array, expression) {
    var fn = angular['Function']['compile'](expression);
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
      var value = 1 * fn(array[i]);
      if (!isNaN(value)){
        sum += value;
      }
    }
    return sum;
  },


  /**
   * @ngdoc function
   * @name angular.Array.remove
   * @function
   *
   * @description
   * Modifies `array` by removing an element from it. The element will be looked up using the
   * {@link angular.Array.indexOf indexOf} function on the `array` and only the first instance of
   * the element will be removed.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array Array from which an element should be removed.
   * @param {*} value Element to be removed.
   * @returns {*} The removed element.
   *
   * @example
     <doc:example>
       <doc:source>
         <ul ng:init="tasks=['Learn Angular', 'Read Documentation',
                             'Check out demos', 'Build cool applications']">
           <li ng:repeat="task in tasks">
             {{task}} [<a href="" ng:click="tasks.$remove(task)">X</a>]
           </li>
         </ul>
         <hr/>
         tasks = {{tasks}}
       </doc:source>
       <doc:scenario>
         it('should initialize the task list with for tasks', function() {
           expect(repeater('.doc-example-live ul li', 'task in tasks').count()).toBe(4);
           expect(repeater('.doc-example-live ul li', 'task in tasks').column('task')).
             toEqual(['Learn Angular', 'Read Documentation', 'Check out demos',
                      'Build cool applications']);
         });

         it('should initialize the task list with for tasks', function() {
           element('.doc-example-live ul li a:contains("X"):first').click();
           expect(repeater('.doc-example-live ul li', 'task in tasks').count()).toBe(3);

           element('.doc-example-live ul li a:contains("X"):last').click();
           expect(repeater('.doc-example-live ul li', 'task in tasks').count()).toBe(2);

           expect(repeater('.doc-example-live ul li', 'task in tasks').column('task')).
             toEqual(['Read Documentation', 'Check out demos']);
         });
       </doc:scenario>
     </doc:example>
   */
  'remove':function(array, value) {
    var index = indexOf(array, value);
    if (index >=0)
      array.splice(index, 1);
    return value;
  },


  /**
   * @ngdoc function
   * @name angular.Array.filter
   * @function
   *
   * @description
   * Selects a subset of items from `array` and returns it as a new array.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array The source array.
   * @param {string|Object|function()} expression The predicate to be used for selecting items from
   *   `array`.
   *
   *   Can be one of:
   *
   *   - `string`: Predicate that results in a substring match using the value of `expression`
   *     string. All strings or objects with string properties in `array` that contain this string
   *     will be returned. The predicate can be negated by prefixing the string with `!`.
   *
   *   - `Object`: A pattern object can be used to filter specific properties on objects contained
   *     by `array`. For example `{name:"M", phone:"1"}` predicate will return an array of items
   *     which have property `name` containing "M" and property `phone` containing "1". A special
   *     property name `$` can be used (as in `{$:"text"}`) to accept a match against any
   *     property of the object. That's equivalent to the simple substring match with a `string`
   *     as described above.
   *
   *   - `function`: A predicate function can be used to write arbitrary filters. The function is
   *     called for each element of `array`. The final result is an array of those elements that
   *     the predicate returned true for.
   *
   * @example
     <doc:example>
       <doc:source>
         <div ng:init="friends = [{name:'John', phone:'555-1276'},
                                  {name:'Mary', phone:'800-BIG-MARY'},
                                  {name:'Mike', phone:'555-4321'},
                                  {name:'Adam', phone:'555-5678'},
                                  {name:'Julie', phone:'555-8765'}]"></div>

         Search: <input name="searchText"/>
         <table id="searchTextResults">
           <tr><th>Name</th><th>Phone</th><tr>
           <tr ng:repeat="friend in friends.$filter(searchText)">
             <td>{{friend.name}}</td>
             <td>{{friend.phone}}</td>
           <tr>
         </table>
         <hr>
         Any: <input name="search.$"/> <br>
         Name only <input name="search.name"/><br>
         Phone only <input name="search.phone"/><br>
         <table id="searchObjResults">
           <tr><th>Name</th><th>Phone</th><tr>
           <tr ng:repeat="friend in friends.$filter(search)">
             <td>{{friend.name}}</td>
             <td>{{friend.phone}}</td>
           <tr>
         </table>
       </doc:source>
       <doc:scenario>
         it('should search across all fields when filtering with a string', function() {
           input('searchText').enter('m');
           expect(repeater('#searchTextResults tr', 'friend in friends').column('name')).
             toEqual(['Mary', 'Mike', 'Adam']);

           input('searchText').enter('76');
           expect(repeater('#searchTextResults tr', 'friend in friends').column('name')).
             toEqual(['John', 'Julie']);
         });

         it('should search in specific fields when filtering with a predicate object', function() {
           input('search.$').enter('i');
           expect(repeater('#searchObjResults tr', 'friend in friends').column('name')).
             toEqual(['Mary', 'Mike', 'Julie']);
         });
       </doc:scenario>
     </doc:example>
   */
  'filter':function(array, expression) {
    var predicates = [];
    predicates.check = function(value) {
      for (var j = 0; j < predicates.length; j++) {
        if(!predicates[j](value)) {
          return false;
        }
      }
      return true;
    };
    var search = function(obj, text){
      if (text.charAt(0) === '!') {
        return !search(obj, text.substr(1));
      }
      switch (typeof obj) {
      case "boolean":
      case "number":
      case "string":
        return ('' + obj).toLowerCase().indexOf(text) > -1;
      case "object":
        for ( var objKey in obj) {
          if (objKey.charAt(0) !== '$' && search(obj[objKey], text)) {
            return true;
          }
        }
        return false;
      case "array":
        for ( var i = 0; i < obj.length; i++) {
          if (search(obj[i], text)) {
            return true;
          }
        }
        return false;
      default:
        return false;
      }
    };
    switch (typeof expression) {
      case "boolean":
      case "number":
      case "string":
        expression = {$:expression};
      case "object":
        for (var key in expression) {
          if (key == '$') {
            (function(){
              var text = (''+expression[key]).toLowerCase();
              if (!text) return;
              predicates.push(function(value) {
                return search(value, text);
              });
            })();
          } else {
            (function(){
              var path = key;
              var text = (''+expression[key]).toLowerCase();
              if (!text) return;
              predicates.push(function(value) {
                return search(getter(value, path), text);
              });
            })();
          }
        }
        break;
      case $function:
        predicates.push(expression);
        break;
      default:
        return array;
    }
    var filtered = [];
    for ( var j = 0; j < array.length; j++) {
      var value = array[j];
      if (predicates.check(value)) {
        filtered.push(value);
      }
    }
    return filtered;
  },


  /**
   * @workInProgress
   * @ngdoc function
   * @name angular.Array.add
   * @function
   *
   * @description
   * `add` is a function similar to JavaScript's `Array#push` method, in that it appends a new
   * element to an array. The difference is that the value being added is optional and defaults to
   * an empty object.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array The array expand.
   * @param {*=} [value={}] The value to be added.
   * @returns {Array} The expanded array.
   *
   * @TODO simplify the example.
   *
   * @example
   * This example shows how an initially empty array can be filled with objects created from user
   * input via the `$add` method.
     <doc:example>
       <doc:source>
         [<a href="" ng:click="people.$add()">add empty</a>]
         [<a href="" ng:click="people.$add({name:'John', sex:'male'})">add 'John'</a>]
         [<a href="" ng:click="people.$add({name:'Mary', sex:'female'})">add 'Mary'</a>]

         <ul ng:init="people=[]">
           <li ng:repeat="person in people">
             <input name="person.name">
             <select name="person.sex">
               <option value="">--chose one--</option>
               <option>male</option>
               <option>female</option>
             </select>
             [<a href="" ng:click="people.$remove(person)">X</a>]
           </li>
         </ul>
         <pre>people = {{people}}</pre>
       </doc:source>
       <doc:scenario>
         beforeEach(function() {
            expect(binding('people')).toBe('people = []');
         });

         it('should create an empty record when "add empty" is clicked', function() {
           element('.doc-example-live a:contains("add empty")').click();
           expect(binding('people')).toBe('people = [{\n  "name":"",\n  "sex":null}]');
         });

         it('should create a "John" record when "add \'John\'" is clicked', function() {
           element('.doc-example-live a:contains("add \'John\'")').click();
           expect(binding('people')).toBe('people = [{\n  "name":"John",\n  "sex":"male"}]');
         });

         it('should create a "Mary" record when "add \'Mary\'" is clicked', function() {
           element('.doc-example-live a:contains("add \'Mary\'")').click();
           expect(binding('people')).toBe('people = [{\n  "name":"Mary",\n  "sex":"female"}]');
         });

         it('should delete a record when "X" is clicked', function() {
            element('.doc-example-live a:contains("add empty")').click();
            element('.doc-example-live li a:contains("X"):first').click();
            expect(binding('people')).toBe('people = []');
         });
       </doc:scenario>
     </doc:example>
   */
  'add':function(array, value) {
    array.push(isUndefined(value)? {} : value);
    return array;
  },


  /**
   * @ngdoc function
   * @name angular.Array.count
   * @function
   *
   * @description
   * Determines the number of elements in an array. Optionally it will count only those elements
   * for which the `condition` evaluates to `true`.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array The array to count elements in.
   * @param {(function()|string)=} condition A function to be evaluated or angular expression to be
   *     compiled and evaluated. The element that is currently being iterated over, is exposed to
   *     the `condition` as `this`.
   * @returns {number} Number of elements in the array (for which the condition evaluates to true).
   *
   * @example
     <doc:example>
       <doc:source>
         <pre ng:init="items = [{name:'knife', points:1},
                                {name:'fork', points:3},
                                {name:'spoon', points:1}]"></pre>
         <ul>
           <li ng:repeat="item in items">
              {{item.name}}: points=
              <input type="text" name="item.points"/> <!-- id="item{{$index}} -->
           </li>
         </ul>
         <p>Number of items which have one point: <em>{{ items.$count('points==1') }}</em></p>
         <p>Number of items which have more than one point: <em>{{items.$count('points&gt;1')}}</em></p>
       </doc:source>
       <doc:scenario>
         it('should calculate counts', function() {
           expect(binding('items.$count(\'points==1\')')).toEqual(2);
           expect(binding('items.$count(\'points>1\')')).toEqual(1);
         });

         it('should recalculate when updated', function() {
           using('.doc-example-live li:first-child').input('item.points').enter('23');
           expect(binding('items.$count(\'points==1\')')).toEqual(1);
           expect(binding('items.$count(\'points>1\')')).toEqual(2);
         });
       </doc:scenario>
     </doc:example>
   */
  'count':function(array, condition) {
    if (!condition) return array.length;
    var fn = angular['Function']['compile'](condition), count = 0;
    forEach(array, function(value){
      if (fn(value)) {
        count ++;
      }
    });
    return count;
  },


  /**
   * @ngdoc function
   * @name angular.Array.orderBy
   * @function
   *
   * @description
   * Orders `array` by the `expression` predicate.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array The array to sort.
   * @param {function(*)|string|Array.<(function(*)|string)>} expression A predicate to be
   *    used by the comparator to determine the order of elements.
   *
   *    Can be one of:
   *
   *    - `function`: getter function. The result of this function will be sorted using the
   *      `<`, `=`, `>` operator
   *    - `string`: angular expression which evaluates to an object to order by, such as 'name' to
   *      sort by a property called 'name'. Optionally prefixed with `+` or `-` to control ascending
   *      or descending sort order (e.g. +name or -name).
   *    - `Array`: array of function or string predicates, such that a first predicate in the array
   *      is used for sorting, but when the items are equivalent next predicate is used.
   *
   * @param {boolean=} reverse Reverse the order the array.
   * @returns {Array} Sorted copy of the source array.
   *
   * @example
     <doc:example>
       <doc:source>
         <div ng:init="friends = [{name:'John', phone:'555-1212', age:10},
                                  {name:'Mary', phone:'555-9876', age:19},
                                  {name:'Mike', phone:'555-4321', age:21},
                                  {name:'Adam', phone:'555-5678', age:35},
                                  {name:'Julie', phone:'555-8765', age:29}]"></div>

         <pre>Sorting predicate = {{predicate}}; reverse = {{reverse}}</pre>
         <hr/>
         [ <a href="" ng:click="predicate=''">unsorted</a> ]
         <table ng:init="predicate='-age'">
           <tr>
             <th><a href="" ng:click="predicate = 'name'; reverse=false">Name</a>
                 (<a href ng:click="predicate = '-name'; reverse=false">^</a>)</th>
             <th><a href="" ng:click="predicate = 'phone'; reverse=!reverse">Phone Number</a></th>
             <th><a href="" ng:click="predicate = 'age'; reverse=!reverse">Age</a></th>
           <tr>
           <tr ng:repeat="friend in friends.$orderBy(predicate, reverse)">
             <td>{{friend.name}}</td>
             <td>{{friend.phone}}</td>
             <td>{{friend.age}}</td>
           <tr>
         </table>
       </doc:source>
       <doc:scenario>
         it('should be reverse ordered by aged', function() {
           expect(binding('predicate')).toBe('Sorting predicate = -age; reverse = ');
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.age')).
             toEqual(['35', '29', '21', '19', '10']);
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.name')).
             toEqual(['Adam', 'Julie', 'Mike', 'Mary', 'John']);
         });

         it('should reorder the table when user selects different predicate', function() {
           element('.doc-example-live a:contains("Name")').click();
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.name')).
             toEqual(['Adam', 'John', 'Julie', 'Mary', 'Mike']);
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.age')).
             toEqual(['35', '10', '29', '19', '21']);

           element('.doc-example-live a:contains("Phone")').click();
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.phone')).
             toEqual(['555-9876', '555-8765', '555-5678', '555-4321', '555-1212']);
           expect(repeater('.doc-example-live table', 'friend in friends').column('friend.name')).
             toEqual(['Mary', 'Julie', 'Adam', 'Mike', 'John']);
         });
       </doc:scenario>
     </doc:example>
   */
  'orderBy':function(array, sortPredicate, reverseOrder) {
    if (!sortPredicate) return array;
    sortPredicate = isArray(sortPredicate) ? sortPredicate: [sortPredicate];
    sortPredicate = map(sortPredicate, function(predicate){
      var descending = false, get = predicate || identity;
      if (isString(predicate)) {
        if ((predicate.charAt(0) == '+' || predicate.charAt(0) == '-')) {
          descending = predicate.charAt(0) == '-';
          predicate = predicate.substring(1);
        }
        get = expressionCompile(predicate).fnSelf;
      }
      return reverseComparator(function(a,b){
        return compare(get(a),get(b));
      }, descending);
    });
    var arrayCopy = [];
    for ( var i = 0; i < array.length; i++) { arrayCopy.push(array[i]); }
    return arrayCopy.sort(reverseComparator(comparator, reverseOrder));

    function comparator(o1, o2){
      for ( var i = 0; i < sortPredicate.length; i++) {
        var comp = sortPredicate[i](o1, o2);
        if (comp !== 0) return comp;
      }
      return 0;
    }
    function reverseComparator(comp, descending) {
      return toBoolean(descending)
          ? function(a,b){return comp(b,a);}
          : comp;
    }
    function compare(v1, v2){
      var t1 = typeof v1;
      var t2 = typeof v2;
      if (t1 == t2) {
        if (t1 == "string") v1 = v1.toLowerCase();
        if (t1 == "string") v2 = v2.toLowerCase();
        if (v1 === v2) return 0;
        return v1 < v2 ? -1 : 1;
      } else {
        return t1 < t2 ? -1 : 1;
      }
    }
  },


  /**
   * @ngdoc function
   * @name angular.Array.limitTo
   * @function
   *
   * @description
   * Creates a new array containing only the first, or last `limit` number of elements of the
   * source `array`.
   *
   * Note: this function is used to augment the `Array` type in angular expressions. See
   * {@link angular.Array} for more info.
   *
   * @param {Array} array Source array to be limited.
   * @param {string|Number} limit The length of the returned array. If the number is positive, the
   *     first `limit` items from the source array will be copied, if the number is negative, the
   *     last `limit` items will be copied.
   * @returns {Array} A new sub-array of length `limit`.
   *
   * @example
     <doc:example>
       <doc:source>
         <div ng:init="numbers = [1,2,3,4,5,6,7,8,9]">
           Limit [1,2,3,4,5,6,7,8,9] to: <input name="limit" value="3"/>
           <p>Output: {{ numbers.$limitTo(limit) | json }}</p>
         </div>
       </doc:source>
       <doc:scenario>
         it('should limit the numer array to first three items', function() {
           expect(element('.doc-example-live input[name=limit]').val()).toBe('3');
           expect(binding('numbers.$limitTo(limit) | json')).toEqual('[1,2,3]');
         });

         it('should update the output when -3 is entered', function() {
           input('limit').enter(-3);
           expect(binding('numbers.$limitTo(limit) | json')).toEqual('[7,8,9]');
         });
       </doc:scenario>
     </doc:example>
   */
  limitTo: function(array, limit) {
    limit = parseInt(limit, 10);
    var out = [],
        i, n;

    if (limit > 0) {
      i = 0;
      n = limit;
    } else {
      i = array.length + limit;
      n = array.length;
    }

    for (; i<n; i++) {
      out.push(array[i]);
    }

    return out;
  }
};

var R_ISO8061_STR = /^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d)(?:\:(\d\d)(?:\:(\d\d)(?:\.(\d{3}))?)?)?Z)?$/;

var angularString = {
  'quote':function(string) {
    return '"' + string.replace(/\\/g, '\\\\').
                        replace(/"/g, '\\"').
                        replace(/\n/g, '\\n').
                        replace(/\f/g, '\\f').
                        replace(/\r/g, '\\r').
                        replace(/\t/g, '\\t').
                        replace(/\v/g, '\\v') +
             '"';
  },
  'quoteUnicode':function(string) {
    var str = angular['String']['quote'](string);
    var chars = [];
    for ( var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      if (ch < 128) {
        chars.push(str.charAt(i));
      } else {
        var encode = "000" + ch.toString(16);
        chars.push("\\u" + encode.substring(encode.length - 4));
      }
    }
    return chars.join('');
  },

  /**
   * Tries to convert input to date and if successful returns the date, otherwise returns the input.
   * @param {string} string
   * @return {(Date|string)}
   */
  'toDate':function(string){
    var match;
    if (isString(string) && (match = string.match(R_ISO8061_STR))){
      var date = new Date(0);
      date.setUTCFullYear(match[1], match[2] - 1, match[3]);
      date.setUTCHours(match[4]||0, match[5]||0, match[6]||0, match[7]||0);
      return date;
    }
    return string;
  }
};

var angularDate = {
    'toString':function(date){
       if (!date) return date;

       var isoString = date.toISOString ? date.toISOString() : '';

       return (isoString.length==24) ?
                isoString :
                padNumber(date.getUTCFullYear(), 4) + '-' +
                  padNumber(date.getUTCMonth() + 1, 2) + '-' +
                  padNumber(date.getUTCDate(), 2) + 'T' +
                  padNumber(date.getUTCHours(), 2) + ':' +
                  padNumber(date.getUTCMinutes(), 2) + ':' +
                  padNumber(date.getUTCSeconds(), 2) + '.' +
                  padNumber(date.getUTCMilliseconds(), 3) + 'Z';
    }
  };

var angularFunction = {
  'compile':function(expression) {
    if (isFunction(expression)){
      return expression;
    } else if (expression){
      return expressionCompile(expression).fnSelf;
    } else {
      return identity;
    }
  }
};

/**
 * Computes a hash of an 'obj'.
 * Hash of a:
 *  string is string
 *  number is number as string
 *  object is either call $hashKey function on object or assign unique hashKey id.
 *
 * @param obj
 * @returns {String} hash string such that the same input will have the same hash string
 */
function hashKey(obj) {
  var objType = typeof obj;
  var key = obj;
  if (objType == 'object') {
    if (typeof (key = obj.$hashKey) == 'function') {
      // must invoke on object to keep the right this
      key = obj.$hashKey();
    } else if (key === undefined) {
      key = obj.$hashKey = nextUid();
    }
  };
  return objType + ':' + key;
}

/**
 * HashMap which can use objects as keys
 */
function HashMap(){}
HashMap.prototype = {
  /**
   * Store key value pair
   * @param key key to store can be any type
   * @param value value to store can be any type
   * @returns old value if any
   */
  put: function(key, value) {
    var _key = hashKey(key);
    var oldValue = this[_key];
    this[_key] = value;
    return oldValue;
  },

  /**
   * @param key
   * @returns the value for the key
   */
  get: function(key) {
    return this[hashKey(key)];
  },

  /**
   * Remove the key/value pair
   * @param key
   * @returns value associated with key before it was removed
   */
  remove: function(key) {
    var _key = hashKey(key);
    var value = this[_key];
    delete this[_key];
    return value;
  }
};

function defineApi(dst, chain){
  angular[dst] = angular[dst] || {};
  forEach(chain, function(parent){
    extend(angular[dst], parent);
  });
}
defineApi('Global', [angularGlobal]);
defineApi('Collection', [angularGlobal, angularCollection]);
defineApi('Array', [angularGlobal, angularCollection, angularArray]);
defineApi('Object', [angularGlobal, angularCollection, angularObject]);
defineApi('String', [angularGlobal, angularString]);
defineApi('Date', [angularGlobal, angularDate]);
//IE bug
angular.Date.toString = angularDate.toString;
defineApi('Function', [angularGlobal, angularCollection, angularFunction]);

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.filter
 * @description
 *
 * Filters are used for formatting data displayed to the user.
 *
 * The general syntax in templates is as follows:
 *
 *         {{ expression | [ filter_name ] }}
 *
 * Following is the list of built-in angular filters:
 *
 * * {@link angular.filter.currency currency}
 * * {@link angular.filter.date date}
 * * {@link angular.filter.html html}
 * * {@link angular.filter.json json}
 * * {@link angular.filter.linky linky}
 * * {@link angular.filter.lowercase lowercase}
 * * {@link angular.filter.number number}
 * * {@link angular.filter.uppercase uppercase}
 *
 * For more information about how angular filters work, and how to create your own filters, see
 * {@link guide/dev_guide.templates.filters Understanding Angular Filters} in the angular Developer
 * Guide.
 */

/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.currency
 * @function
 *
 * @description
 * Formats a number as a currency (ie $1,234.56). When no currency symbol is provided, default
 * symbol for current locale is used.
 *
 * @param {number} amount Input to filter.
 * @param {string=} symbol Currency symbol or identifier to be displayed.
 * @returns {string} Formatted number.
 *
 * @css ng-format-negative
 *   When the value is negative, this css class is applied to the binding making it (by default) red.
 *
 * @example
   <doc:example>
     <doc:source>
       <input type="text" name="amount" value="1234.56"/> <br/>
       default currency symbol ($): {{amount | currency}}<br/>
       custom currency identifier (USD$): {{amount | currency:"USD$"}}
     </doc:source>
     <doc:scenario>
       it('should init with 1234.56', function(){
         expect(binding('amount | currency')).toBe('$1,234.56');
         expect(binding('amount | currency:"USD$"')).toBe('USD$1,234.56');
       });
       it('should update', function(){
         input('amount').enter('-1234');
         expect(binding('amount | currency')).toBe('($1,234.00)');
         expect(binding('amount | currency:"USD$"')).toBe('(USD$1,234.00)');
         expect(element('.doc-example-live .ng-binding').attr('className')).
           toMatch(/ng-format-negative/);
       });
     </doc:scenario>
   </doc:example>
 */
angularFilter.currency = function(amount, currencySymbol){
  this.$element.toggleClass('ng-format-negative', amount < 0);
  if (isUndefined(currencySymbol)) currencySymbol = NUMBER_FORMATS.CURRENCY_SYM;
  return formatNumber(amount, 2, 1).replace(/\u00A4/g, currencySymbol);
};

/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.number
 * @function
 *
 * @description
 * Formats a number as text.
 *
 * If the input is not a number an empty string is returned.
 *
 * @param {number|string} number Number to format.
 * @param {(number|string)=} [fractionSize=2] Number of decimal places to round the number to.
 * @returns {string} Number rounded to decimalPlaces and places a “,” after each third digit.
 *
 * @example
   <doc:example>
     <doc:source>
       Enter number: <input name='val' value='1234.56789' /><br/>
       Default formatting: {{val | number}}<br/>
       No fractions: {{val | number:0}}<br/>
       Negative number: {{-val | number:4}}
     </doc:source>
     <doc:scenario>
       it('should format numbers', function(){
         expect(binding('val | number')).toBe('1,234.568');
         expect(binding('val | number:0')).toBe('1,235');
         expect(binding('-val | number:4')).toBe('-1,234.5679');
       });

       it('should update', function(){
         input('val').enter('3374.333');
         expect(binding('val | number')).toBe('3,374.333');
         expect(binding('val | number:0')).toBe('3,374');
         expect(binding('-val | number:4')).toBe('-3,374.3330');
       });
     </doc:scenario>
   </doc:example>
 */

// PATTERNS[0] is an array for Decimal Pattern, PATTERNS[1] is an array Currency Pattern
// Following is the order in each pattern array:
// 0: minInteger,
// 1: minFraction,
// 2: maxFraction,
// 3: positivePrefix,
// 4: positiveSuffix,
// 5: negativePrefix,
// 6: negativeSuffix,
// 7: groupSize,
// 8: lastGroupSize
var NUMBER_FORMATS = {
      DECIMAL_SEP: '.',
      GROUP_SEP: ',',
      PATTERNS: [[1, 0, 3, '', '', '-', '', 3, 3],[1, 2, 2, '\u00A4', '', '(\u00A4', ')', 3, 3]],
      CURRENCY_SYM: '$'
};
var DECIMAL_SEP = '.';

angularFilter.number = function(number, fractionSize) {
  if (isNaN(number) || !isFinite(number)) return '';
  return formatNumber(number, fractionSize, 0);
};

function formatNumber(number, fractionSize, type) {
  var isNegative = number < 0,
      type = type || 0, // 0 is decimal pattern, 1 is currency pattern
      pattern = NUMBER_FORMATS.PATTERNS[type];

  number = Math.abs(number);
  var numStr =  number + '',
      formatedText = '',
      parts = [];

  if (numStr.indexOf('e') !== -1) {
    var formatedText = numStr;
  } else {
    var fractionLen = (numStr.split(DECIMAL_SEP)[1] || '').length;

    //determine fractionSize if it is not specified
    if (isUndefined(fractionSize)) {
      fractionSize = Math.min(Math.max(pattern[1], fractionLen), pattern[2]);
    }

    var pow = Math.pow(10, fractionSize);
    number = Math.round(number * pow) / pow;
    var fraction = ('' + number).split(DECIMAL_SEP);
    var whole = fraction[0];
    fraction = fraction[1] || '';

    var pos = 0,
        lgroup = pattern[8],
        group = pattern[7];

    if (whole.length >= (lgroup + group)) {
      pos = whole.length - lgroup;
      for (var i = 0; i < pos; i++) {
        if ((pos - i)%group === 0 && i !== 0) {
          formatedText += NUMBER_FORMATS.GROUP_SEP;
        }
        formatedText += whole.charAt(i);
      }
    }

    for (i = pos; i < whole.length; i++) {
      if ((whole.length - i)%lgroup === 0 && i !== 0) {
        formatedText += NUMBER_FORMATS.GROUP_SEP;
      }
      formatedText += whole.charAt(i);
    }

    // format fraction part.
    while(fraction.length < fractionSize) {
      fraction += '0';
    }
    if (fractionSize) formatedText += NUMBER_FORMATS.DECIMAL_SEP + fraction.substr(0, fractionSize);
  }

  parts.push(isNegative ? pattern[5] : pattern[3]);
  parts.push(formatedText);
  parts.push(isNegative ? pattern[6] : pattern[4]);
  return parts.join('');
}

function padNumber(num, digits, trim) {
  var neg = '';
  if (num < 0) {
    neg =  '-';
    num = -num;
  }
  num = '' + num;
  while(num.length < digits) num = '0' + num;
  if (trim)
    num = num.substr(num.length - digits);
  return neg + num;
}


function dateGetter(name, size, offset, trim) {
  return function(date) {
    var value = date['get' + name]();
    if (offset > 0 || value > -offset)
      value += offset;
    if (value === 0 && offset == -12 ) value = 12;
    return padNumber(value, size, trim);
  };
}

function dateStrGetter(name, shortForm) {
  return function(date) {
    var value = date['get' + name]();

    if(name == 'Month') {
      value = MONTH[value];
    } else {
      value = DAY[value];
    }

    return shortForm ? value.substr(0,3) : value;
  };
}

function timeZoneGetter(numFormat) {
  return function(date) {
    var timeZone;
    if (numFormat || !(timeZone = GET_TIME_ZONE.exec(date.toString()))) {
      var offset = date.getTimezoneOffset();
      return padNumber(offset / 60, 2) + padNumber(Math.abs(offset % 60), 2);
    }
    return timeZone[0];
  };
}

var DAY = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(',');

var MONTH = 'January,February,March,April,May,June,July,August,September,October,November,December'.
             split(',');

var DATE_FORMATS = {
  yyyy: dateGetter('FullYear', 4),
    yy: dateGetter('FullYear', 2, 0, true),
     y: dateGetter('FullYear', 1),
  MMMM: dateStrGetter('Month'),
   MMM: dateStrGetter('Month', true),
    MM: dateGetter('Month', 2, 1),
     M: dateGetter('Month', 1, 1),
    dd: dateGetter('Date', 2),
     d: dateGetter('Date', 1),
    HH: dateGetter('Hours', 2),
     H: dateGetter('Hours', 1),
    hh: dateGetter('Hours', 2, -12),
     h: dateGetter('Hours', 1, -12),
    mm: dateGetter('Minutes', 2),
     m: dateGetter('Minutes', 1),
    ss: dateGetter('Seconds', 2),
     s: dateGetter('Seconds', 1),
  EEEE: dateStrGetter('Day'),
   EEE: dateStrGetter('Day', true),
     a: function(date){return date.getHours() < 12 ? 'am' : 'pm';},
     z: timeZoneGetter(false),
     Z: timeZoneGetter(true)
};

var DEFAULT_DATETIME_FORMATS = {
         long: 'MMMM d, y h:mm:ss a z',
       medium: 'MMM d, y h:mm:ss a',
        short: 'M/d/yy h:mm a',
    fullDate: 'EEEE, MMMM d, y',
    longDate: 'MMMM d, y',
  mediumDate: 'MMM d, y',
   shortDate: 'M/d/yy',
    longTime: 'h:mm:ss a z',
  mediumTime: 'h:mm:ss a',
   shortTime: 'h:mm a'
};

var GET_TIME_ZONE = /[A-Z]{3}(?![+\-])/;
var DATE_FORMATS_SPLIT = /([^yMdHhmsazZE]*)(E+|y+|M+|d+|H+|h+|m+|s+|a|Z|z)(.*)/;
var OPERA_TOSTRING_PATTERN = /^[\d].*Z$/;
var NUMBER_STRING = /^\d+$/;


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.date
 * @function
 *
 * @description
 *   Formats `date` to a string based on the requested `format`.
 *
 *   `format` string can be composed of the following elements:
 *
 *   * `'yyyy'`: 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
 *   * `'yy'`: 2 digit representation of year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
 *   * `'y'`: 1 digit representation of year, e.g. (AD 1 => 1, AD 199 => 199)
 *   * `'MMMM'`: Month in year (January-December)
 *   * `'MMM'`: Month in year (Jan-Dec)
 *   * `'MM'`: Month in year, padded (01-12)
 *   * `'M'`: Month in year (1-12)
 *   * `'dd'`: Day in month, padded (01-31)
 *   * `'d'`: Day in month (1-31)
 *   * `'EEEE'`: Day in Week,(Sunday-Saturday)
 *   * `'EEE'`: Day in Week, (Sun-Sat)
 *   * `'HH'`: Hour in day, padded (00-23)
 *   * `'H'`: Hour in day (0-23)
 *   * `'hh'`: Hour in am/pm, padded (01-12)
 *   * `'h'`: Hour in am/pm, (1-12)
 *   * `'mm'`: Minute in hour, padded (00-59)
 *   * `'m'`: Minute in hour (0-59)
 *   * `'ss'`: Second in minute, padded (00-59)
 *   * `'s'`: Second in minute (0-59)
 *   * `'a'`: am/pm marker
 *   * `'Z'`: 4 digit (+sign) representation of the timezone offset (-1200-1200)
 *   * `'z'`: short form of current timezone name (e.g. PDT)
 *
 *   `format` string can also be the following default formats for `en_US` locale (support for other
 *    locales will be added in the future versions):
 *
 *   * `'long'`: equivalent to `'MMMM d, y h:mm:ss a z'` for en_US  locale
 *     (e.g. September 3, 2010 12:05:08 pm PDT)
 *   * `'medium'`: equivalent to `'MMM d, y h:mm:ss a'` for en_US locale
 *     (e.g. Sep 3, 2010 12:05:08 pm)
 *   * `'short'`: equivalent to `'M/d/yy h:mm a'` for en_US  locale (e.g. 9/3/10 12:05 pm)
 *   * `'fullDate'`: equivalent to `'EEEE, MMMM d,y'` for en_US  locale
 *     (e.g. Friday, September 3, 2010)
 *   * `'longDate'`: equivalent to `'MMMM d, y'` for en_US  locale (e.g. September 3, 2010
 *   * `'mediumDate'`: equivalent to `'MMM d, y'` for en_US  locale (e.g. Sep 3, 2010)
 *   * `'shortDate'`: equivalent to `'M/d/yy'` for en_US locale (e.g. 9/3/10)
 *   * `'longTime'`: equivalent to `'h:mm:ss a z'` for en_US locale (e.g. 12:05:08 pm PDT)
 *   * `'mediumTime'`: equivalent to `'h:mm:ss a'` for en_US locale (e.g. 12:05:08 pm)
 *   * `'shortTime'`: equivalent to `'h:mm a'` for en_US locale (e.g. 12:05 pm)
 *
 * @param {(Date|number|string)} date Date to format either as Date object, milliseconds (string or
 *    number) or ISO 8601 extended datetime string (yyyy-MM-ddTHH:mm:ss.SSSZ).
 * @param {string=} format Formatting rules (see Description). If not specified,
 *    Date#toLocaleDateString is used.
 * @returns {string} Formatted string or the input if input is not recognized as date/millis.
 *
 * @example
   <doc:example>
     <doc:source>
       <span ng:non-bindable>{{1288323623006 | date:'medium'}}</span>:
           {{1288323623006 | date:'medium'}}<br/>
       <span ng:non-bindable>{{1288323623006 | date:'yyyy-MM-dd HH:mm:ss Z'}}</span>:
          {{1288323623006 | date:'yyyy-MM-dd HH:mm:ss Z'}}<br/>
       <span ng:non-bindable>{{1288323623006 | date:'MM/dd/yyyy @ h:mma'}}</span>:
          {{'1288323623006' | date:'MM/dd/yyyy @ h:mma'}}<br/>
     </doc:source>
     <doc:scenario>
       it('should format date', function(){
         expect(binding("1288323623006 | date:'medium'")).
            toMatch(/Oct 2\d, 2010 \d{1,2}:\d{2}:\d{2} (am|pm)/);
         expect(binding("1288323623006 | date:'yyyy-MM-dd HH:mm:ss Z'")).
            toMatch(/2010\-10\-2\d \d{2}:\d{2}:\d{2} \-?\d{4}/);
         expect(binding("'1288323623006' | date:'MM/dd/yyyy @ h:mma'")).
            toMatch(/10\/2\d\/2010 @ \d{1,2}:\d{2}(am|pm)/);
       });
     </doc:scenario>
   </doc:example>
 */
angularFilter.date = function(date, format) {
  format = DEFAULT_DATETIME_FORMATS[format] || format;
  if (isString(date)) {
    if (NUMBER_STRING.test(date)) {
      date = parseInt(date, 10);
    } else {
      date = angularString.toDate(date);
    }
  }

  if (isNumber(date)) {
    date = new Date(date);
  }

  if (!isDate(date)) {
    return date;
  }

  var text = date.toLocaleDateString(), fn;
  if (format && isString(format)) {
    text = '';
    var parts = [], match;
    while(format) {
      match = DATE_FORMATS_SPLIT.exec(format);
      if (match) {
        parts = concat(parts, match, 1);
        format = parts.pop();
      } else {
        parts.push(format);
        format = null;
      }
    }
    forEach(parts, function(value){
      fn = DATE_FORMATS[value];
      text += fn ? fn(date) : value;
    });
  }
  return text;
};


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.json
 * @function
 *
 * @description
 *   Allows you to convert a JavaScript object into JSON string.
 *
 *   This filter is mostly useful for debugging. When using the double curly {{value}} notation
 *   the binding is automatically converted to JSON.
 *
 * @param {*} object Any JavaScript object (including arrays and primitive types) to filter.
 * @returns {string} JSON string.
 *
 * @css ng-monospace Always applied to the encapsulating element.
 *
 * @example:
   <doc:example>
     <doc:source>
       <input type="text" name="objTxt" value="{a:1, b:[]}"
              ng:eval="obj = $eval(objTxt)"/>
       <pre>{{ obj | json }}</pre>
     </doc:source>
     <doc:scenario>
       it('should jsonify filtered objects', function() {
         expect(binding('obj | json')).toBe('{\n  "a":1,\n  "b":[]}');
       });

       it('should update', function() {
         input('objTxt').enter('[1, 2, 3]');
         expect(binding('obj | json')).toBe('[1,2,3]');
       });
     </doc:scenario>
   </doc:example>
 *
 */
angularFilter.json = function(object) {
  this.$element.addClass("ng-monospace");
  return toJson(object, true);
};


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.lowercase
 * @function
 *
 * @see angular.lowercase
 */
angularFilter.lowercase = lowercase;


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.uppercase
 * @function
 *
 * @see angular.uppercase
 */
angularFilter.uppercase = uppercase;


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.html
 * @function
 *
 * @description
 *   Prevents the input from getting escaped by angular. By default the input is sanitized and
 *   inserted into the DOM as is.
 *
 *   The input is sanitized by parsing the html into tokens. All safe tokens (from a whitelist) are
 *   then serialized back to properly escaped html string. This means that no unsafe input can make
 *   it into the returned string, however, since our parser is more strict than a typical browser
 *   parser, it's possible that some obscure input, which would be recognized as valid HTML by a
 *   browser, won't make it through the sanitizer.
 *
 *   If you hate your users, you may call the filter with optional 'unsafe' argument, which bypasses
 *   the html sanitizer, but makes your application vulnerable to XSS and other attacks. Using this
 *   option is strongly discouraged and should be used only if you absolutely trust the input being
 *   filtered and you can't get the content through the sanitizer.
 *
 * @param {string} html Html input.
 * @param {string=} option If 'unsafe' then do not sanitize the HTML input.
 * @returns {string} Sanitized or raw html.
 *
 * @example
   <doc:example>
     <doc:source>
      Snippet: <textarea name="snippet" cols="60" rows="3">
     &lt;p style="color:blue"&gt;an html
     &lt;em onmouseover="this.textContent='PWN3D!'"&gt;click here&lt;/em&gt;
     snippet&lt;/p&gt;</textarea>
       <table>
         <tr>
           <td>Filter</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="html-filter">
           <td>html filter</td>
           <td>
             <pre>&lt;div ng:bind="snippet | html"&gt;<br/>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng:bind="snippet | html"></div>
           </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng:bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng:bind="snippet"></div></td>
         </tr>
         <tr id="html-unsafe-filter">
           <td>unsafe html filter</td>
           <td><pre>&lt;div ng:bind="snippet | html:'unsafe'"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng:bind="snippet | html:'unsafe'"></div></td>
         </tr>
       </table>
     </doc:source>
     <doc:scenario>
       it('should sanitize the html snippet ', function(){
         expect(using('#html-filter').binding('snippet | html')).
           toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
       });

       it('should escape snippet without any filter', function() {
         expect(using('#escaped-html').binding('snippet')).
           toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
                "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
                "snippet&lt;/p&gt;");
       });

       it('should inline raw snippet if filtered as unsafe', function() {
         expect(using('#html-unsafe-filter').binding("snippet | html:'unsafe'")).
           toBe("<p style=\"color:blue\">an html\n" +
                "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
                "snippet</p>");
       });

       it('should update', function(){
         input('snippet').enter('new <b>text</b>');
         expect(using('#html-filter').binding('snippet | html')).toBe('new <b>text</b>');
         expect(using('#escaped-html').binding('snippet')).toBe("new &lt;b&gt;text&lt;/b&gt;");
         expect(using('#html-unsafe-filter').binding("snippet | html:'unsafe'")).toBe('new <b>text</b>');
       });
     </doc:scenario>
   </doc:example>
 */
angularFilter.html =  function(html, option){
  return new HTML(html, option);
};


/**
 * @workInProgress
 * @ngdoc filter
 * @name angular.filter.linky
 * @function
 *
 * @description
 *   Finds links in text input and turns them into html links. Supports http/https/ftp/mailto and
 *   plain email address links.
 *
 * @param {string} text Input text.
 * @returns {string} Html-linkified text.
 *
 * @example
   <doc:example>
     <doc:source>
       Snippet: <textarea name="snippet" cols="60" rows="3">
  Pretty text with some links:
  http://angularjs.org/,
  mailto:us@somewhere.org,
  another@somewhere.org,
  and one more: ftp://127.0.0.1/.</textarea>
       <table>
         <tr>
           <td>Filter</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="linky-filter">
           <td>linky filter</td>
           <td>
             <pre>&lt;div ng:bind="snippet | linky"&gt;<br/>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng:bind="snippet | linky"></div>
           </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng:bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng:bind="snippet"></div></td>
         </tr>
       </table>
     </doc:source>
     <doc:scenario>
       it('should linkify the snippet with urls', function(){
         expect(using('#linky-filter').binding('snippet | linky')).
           toBe('Pretty text with some links:\n' +
                '<a href="http://angularjs.org/">http://angularjs.org/</a>,\n' +
                '<a href="mailto:us@somewhere.org">us@somewhere.org</a>,\n' +
                '<a href="mailto:another@somewhere.org">another@somewhere.org</a>,\n' +
                'and one more: <a href="ftp://127.0.0.1/">ftp://127.0.0.1/</a>.');
       });

       it ('should not linkify snippet without the linky filter', function() {
         expect(using('#escaped-html').binding('snippet')).
           toBe("Pretty text with some links:\n" +
                "http://angularjs.org/,\n" +
                "mailto:us@somewhere.org,\n" +
                "another@somewhere.org,\n" +
                "and one more: ftp://127.0.0.1/.");
       });

       it('should update', function(){
         input('snippet').enter('new http://link.');
         expect(using('#linky-filter').binding('snippet | linky')).
           toBe('new <a href="http://link">http://link</a>.');
         expect(using('#escaped-html').binding('snippet')).toBe('new http://link.');
       });
     </doc:scenario>
   </doc:example>
 */
//TODO: externalize all regexps
angularFilter.linky = function(text){
  if (!text) return text;
  var URL = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s\.\;\,\(\)\{\}\<\>]/;
  var match;
  var raw = text;
  var html = [];
  var writer = htmlSanitizeWriter(html);
  var url;
  var i;
  while (match=raw.match(URL)) {
    // We can not end in these as they are sometimes found at the end of the sentence
    url = match[0];
    // if we did not match ftp/http/mailto then assume mailto
    if (match[2]==match[3]) url = 'mailto:' + url;
    i = match.index;
    writer.chars(raw.substr(0, i));
    writer.start('a', {href:url});
    writer.chars(match[0].replace(/^mailto:/, ''));
    writer.end('a');
    raw = raw.substring(i + match[0].length);
  }
  writer.chars(raw);
  return new HTML(html.join(''));
};

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.formatter
 * @description
 *
 * Formatters are used for translating data formats between those used for display and those used
 * for storage.
 *
 * Following is the list of built-in angular formatters:
 *
 * * {@link angular.formatter.boolean boolean} - Formats user input in boolean format
 * * {@link angular.formatter.json json} - Formats user input in JSON format
 * * {@link angular.formatter.list list} - Formats user input string as an array
 * * {@link angular.formatter.number number} - Formats user input strings as a number
 * * {@link angular.formatter.trim trim} - Trims extras spaces from end of user input
 *
 * For more information about how angular formatters work, and how to create your own formatters,
 * see {@link guide/dev_guide.templates.formatters Understanding Angular Formatters} in the angular
 * Developer Guide.
 */

function formatter(format, parse) {return {'format':format, 'parse':parse || format};}
function toString(obj) {
  return (isDefined(obj) && obj !== null) ? "" + obj : obj;
}

var NUMBER = /^\s*[-+]?\d*(\.\d*)?\s*$/;

angularFormatter.noop = formatter(identity, identity);

/**
 * @workInProgress
 * @ngdoc formatter
 * @name angular.formatter.json
 *
 * @description
 *   Formats the user input as JSON text.
 *
 * @returns {?string} A JSON string representation of the model.
 *
 * @example
   <doc:example>
     <doc:source>
      <div ng:init="data={name:'misko', project:'angular'}">
        <input type="text" size='50' name="data" ng:format="json"/>
        <pre>data={{data}}</pre>
      </div>
     </doc:source>
     <doc:scenario>
      it('should format json', function(){
        expect(binding('data')).toEqual('data={\n  \"name\":\"misko\",\n  \"project\":\"angular\"}');
        input('data').enter('{}');
        expect(binding('data')).toEqual('data={\n  }');
      });
     </doc:scenario>
   </doc:example>
 */
angularFormatter.json = formatter(toJson, function(value){
  return fromJson(value || 'null');
});

/**
 * @workInProgress
 * @ngdoc formatter
 * @name angular.formatter.boolean
 *
 * @description
 *   Use boolean formatter if you wish to store the data as boolean.
 *
 * @returns {boolean} Converts to `true` unless user enters (blank), `f`, `false`, `0`, `no`, `[]`.
 *
 * @example
   <doc:example>
     <doc:source>
        Enter truthy text:
        <input type="text" name="value" ng:format="boolean" value="no"/>
        <input type="checkbox" name="value"/>
        <pre>value={{value}}</pre>
     </doc:source>
     <doc:scenario>
        it('should format boolean', function(){
          expect(binding('value')).toEqual('value=false');
          input('value').enter('truthy');
          expect(binding('value')).toEqual('value=true');
        });
     </doc:scenario>
   </doc:example>
 */
angularFormatter['boolean'] = formatter(toString, toBoolean);

/**
 * @workInProgress
 * @ngdoc formatter
 * @name angular.formatter.number
 *
 * @description
 * Use number formatter if you wish to convert the user entered string to a number.
 *
 * @returns {number} Number from the parsed string.
 *
 * @example
   <doc:example>
     <doc:source>
      Enter valid number:
      <input type="text" name="value" ng:format="number" value="1234"/>
      <pre>value={{value}}</pre>
     </doc:source>
     <doc:scenario>
      it('should format numbers', function(){
        expect(binding('value')).toEqual('value=1234');
        input('value').enter('5678');
        expect(binding('value')).toEqual('value=5678');
      });
     </doc:scenario>
   </doc:example>
 */
angularFormatter.number = formatter(toString, function(obj){
  if (obj == null || NUMBER.exec(obj)) {
    return obj===null || obj === '' ? null : 1*obj;
  } else {
    throw "Not a number";
  }
});

/**
 * @workInProgress
 * @ngdoc formatter
 * @name angular.formatter.list
 *
 * @description
 * Use list formatter if you wish to convert the user entered string to an array.
 *
 * @returns {Array} Array parsed from the entered string.
 *
 * @example
   <doc:example>
     <doc:source>
        Enter a list of items:
        <input type="text" name="value" ng:format="list" value=" chair ,, table"/>
        <input type="text" name="value" ng:format="list"/>
        <pre>value={{value}}</pre>
     </doc:source>
     <doc:scenario>
      it('should format lists', function(){
        expect(binding('value')).toEqual('value=["chair","table"]');
        this.addFutureAction('change to XYZ', function($window, $document, done){
          $document.elements('.doc-example-live :input:last').val(',,a,b,').trigger('change');
          done();
        });
        expect(binding('value')).toEqual('value=["a","b"]');
      });
     </doc:scenario>
   </doc:example>
 */
angularFormatter.list = formatter(
  function(obj) { return obj ? obj.join(", ") : obj; },
  function(value) {
    var list = [];
    forEach((value || '').split(','), function(item){
      item = trim(item);
      if (item) list.push(item);
    });
    return list;
  }
);

/**
 * @workInProgress
 * @ngdoc formatter
 * @name angular.formatter.trim
 *
 * @description
 * Use trim formatter if you wish to trim extra spaces in user text.
 *
 * @returns {String} Trim excess leading and trailing space.
 *
 * @example
   <doc:example>
     <doc:source>
        Enter text with leading/trailing spaces:
        <input type="text" name="value" ng:format="trim" value="  book  "/>
        <input type="text" name="value" ng:format="trim"/>
        <pre>value={{value|json}}</pre>
     </doc:source>
     <doc:scenario>
        it('should format trim', function(){
          expect(binding('value')).toEqual('value="book"');
          this.addFutureAction('change to XYZ', function($window, $document, done){
            $document.elements('.doc-example-live :input:last').val('  text  ').trigger('change');
            done();
          });
          expect(binding('value')).toEqual('value="text"');
        });
     </doc:scenario>
   </doc:example>
 */
angularFormatter.trim = formatter(
  function(obj) { return obj ? trim("" + obj) : ""; }
);

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.validator
 * @description
 *
 * Most of the built-in angular validators are used to check user input against defined types or
 * patterns.  You can easily create your own custom validators as well.
 *
 * Following is the list of built-in angular validators:
 *
 * * {@link angular.validator.asynchronous asynchronous()} - Provides asynchronous validation via a
 * callback function.
 * * {@link angular.validator.date date()} - Checks user input against default date format:
 * "MM/DD/YYYY"
 * * {@link angular.validator.email email()} - Validates that user input is a well-formed email
 * address.
 * * {@link angular.validator.integer integer()} - Validates that user input is an integer
 * * {@link angular.validator.json json()} - Validates that user input is valid JSON
 * * {@link angular.validator.number number()} - Validates that user input is a number
 * * {@link angular.validator.phone phone()} - Validates that user input matches the pattern
 * "1(123)123-1234"
 * * {@link angular.validator.regexp regexp()} - Restricts valid input to a specified regular
 * expression pattern
 * * {@link angular.validator.url url()} - Validates that user input is a well-formed URL.
 *
 * For more information about how angular validators work, and how to create your own validators,
 * see {@link guide/dev_guide.templates.validators Understanding Angular Validators} in the angular
 * Developer Guide.
 */

extend(angularValidator, {
  'noop': function() { return null; },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.regexp
   * @description
   * Use regexp validator to restrict the input to any Regular Expression.
   *
   * @param {string} value value to validate
   * @param {string|regexp} expression regular expression.
   * @param {string=} msg error message to display.
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        <script> function Cntl(){
         this.ssnRegExp = /^\d\d\d-\d\d-\d\d\d\d$/;
        }
        </script>
        Enter valid SSN:
        <div ng:controller="Cntl">
        <input name="ssn" value="123-45-6789" ng:validate="regexp:ssnRegExp" >
        </div>
      </doc:source>
      <doc:scenario>
        it('should invalidate non ssn', function(){
         var textBox = element('.doc-example-live :input');
         expect(textBox.attr('className')).not().toMatch(/ng-validation-error/);
         expect(textBox.val()).toEqual('123-45-6789');
         input('ssn').enter('123-45-67890');
         expect(textBox.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'regexp': function(value, regexp, msg) {
    if (!value.match(regexp)) {
      return msg ||
        "Value does not match expected format " + regexp + ".";
    } else {
      return null;
    }
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.number
   * @description
   * Use number validator to restrict the input to numbers with an
   * optional range. (See integer for whole numbers validator).
   *
   * @param {string} value value to validate
   * @param {int=} [min=MIN_INT] minimum value.
   * @param {int=} [max=MAX_INT] maximum value.
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter number: <input name="n1" ng:validate="number" > <br>
        Enter number greater than 10: <input name="n2" ng:validate="number:10" > <br>
        Enter number between 100 and 200: <input name="n3" ng:validate="number:100:200" > <br>
      </doc:source>
      <doc:scenario>
        it('should invalidate number', function(){
         var n1 = element('.doc-example-live :input[name=n1]');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('n1').enter('1.x');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
         var n2 = element('.doc-example-live :input[name=n2]');
         expect(n2.attr('className')).not().toMatch(/ng-validation-error/);
         input('n2').enter('9');
         expect(n2.attr('className')).toMatch(/ng-validation-error/);
         var n3 = element('.doc-example-live :input[name=n3]');
         expect(n3.attr('className')).not().toMatch(/ng-validation-error/);
         input('n3').enter('201');
         expect(n3.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'number': function(value, min, max) {
    var num = 1 * value;
    if (num == value) {
      if (typeof min != $undefined && num < min) {
        return "Value can not be less than " + min + ".";
      }
      if (typeof min != $undefined && num > max) {
        return "Value can not be greater than " + max + ".";
      }
      return null;
    } else {
      return "Not a number";
    }
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.integer
   * @description
   * Use number validator to restrict the input to integers with an
   * optional range. (See integer for whole numbers validator).
   *
   * @param {string} value value to validate
   * @param {int=} [min=MIN_INT] minimum value.
   * @param {int=} [max=MAX_INT] maximum value.
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter integer: <input name="n1" ng:validate="integer" > <br>
        Enter integer equal or greater than 10: <input name="n2" ng:validate="integer:10" > <br>
        Enter integer between 100 and 200 (inclusive): <input name="n3" ng:validate="integer:100:200" > <br>
      </doc:source>
      <doc:scenario>
        it('should invalidate integer', function(){
         var n1 = element('.doc-example-live :input[name=n1]');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('n1').enter('1.1');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
         var n2 = element('.doc-example-live :input[name=n2]');
         expect(n2.attr('className')).not().toMatch(/ng-validation-error/);
         input('n2').enter('10.1');
         expect(n2.attr('className')).toMatch(/ng-validation-error/);
         var n3 = element('.doc-example-live :input[name=n3]');
         expect(n3.attr('className')).not().toMatch(/ng-validation-error/);
         input('n3').enter('100.1');
         expect(n3.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   */
  'integer': function(value, min, max) {
    var numberError = angularValidator['number'](value, min, max);
    if (numberError) return numberError;
    if (!("" + value).match(/^\s*[\d+]*\s*$/) || value != Math.round(value)) {
      return "Not a whole number";
    }
    return null;
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.date
   * @description
   * Use date validator to restrict the user input to a valid date
   * in format in format MM/DD/YYYY.
   *
   * @param {string} value value to validate
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter valid date:
        <input name="text" value="1/1/2009" ng:validate="date" >
      </doc:source>
      <doc:scenario>
        it('should invalidate date', function(){
         var n1 = element('.doc-example-live :input');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('text').enter('123/123/123');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'date': function(value) {
    var fields = /^(\d\d?)\/(\d\d?)\/(\d\d\d\d)$/.exec(value);
    var date = fields ? new Date(fields[3], fields[1]-1, fields[2]) : 0;
    return (date &&
            date.getFullYear() == fields[3] &&
            date.getMonth() == fields[1]-1 &&
            date.getDate() == fields[2])
              ? null
              : "Value is not a date. (Expecting format: 12/31/2009).";
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.email
   * @description
   * Use email validator if you wist to restrict the user input to a valid email.
   *
   * @param {string} value value to validate
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter valid email:
        <input name="text" ng:validate="email" value="me@example.com">
      </doc:source>
      <doc:scenario>
        it('should invalidate email', function(){
         var n1 = element('.doc-example-live :input');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('text').enter('a@b.c');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'email': function(value) {
    if (value.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/)) {
      return null;
    }
    return "Email needs to be in username@host.com format.";
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.phone
   * @description
   * Use phone validator to restrict the input phone numbers.
   *
   * @param {string} value value to validate
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter valid phone number:
        <input name="text" value="1(234)567-8901" ng:validate="phone" >
      </doc:source>
      <doc:scenario>
        it('should invalidate phone', function(){
         var n1 = element('.doc-example-live :input');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('text').enter('+12345678');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'phone': function(value) {
    if (value.match(/^1\(\d\d\d\)\d\d\d-\d\d\d\d$/)) {
      return null;
    }
    if (value.match(/^\+\d{2,3} (\(\d{1,5}\))?[\d ]+\d$/)) {
      return null;
    }
    return "Phone number needs to be in 1(987)654-3210 format in North America " +
           "or +999 (123) 45678 906 internationally.";
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.url
   * @description
   * Use phone validator to restrict the input URLs.
   *
   * @param {string} value value to validate
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        Enter valid URL:
        <input name="text" value="http://example.com/abc.html" size="40" ng:validate="url" >
      </doc:source>
      <doc:scenario>
        it('should invalidate url', function(){
         var n1 = element('.doc-example-live :input');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('text').enter('abc://server/path');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'url': function(value) {
    if (value.match(/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/)) {
      return null;
    }
    return "URL needs to be in http://server[:port]/path format.";
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.json
   * @description
   * Use json validator if you wish to restrict the user input to a valid JSON.
   *
   * @param {string} value value to validate
   * @css ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        <textarea name="json" cols="60" rows="5" ng:validate="json">
        {name:'abc'}
        </textarea>
      </doc:source>
      <doc:scenario>
        it('should invalidate json', function(){
         var n1 = element('.doc-example-live :input');
         expect(n1.attr('className')).not().toMatch(/ng-validation-error/);
         input('json').enter('{name}');
         expect(n1.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  'json': function(value) {
    try {
      fromJson(value);
      return null;
    } catch (e) {
      return e.toString();
    }
  },

  /**
   * @workInProgress
   * @ngdoc validator
   * @name angular.validator.asynchronous
   * @description
   * Use asynchronous validator if the validation can not be computed
   * immediately, but is provided through a callback. The widget
   * automatically shows a spinning indicator while the validity of
   * the widget is computed. This validator caches the result.
   *
   * @param {string} value value to validate
   * @param {function(inputToValidate,validationDone)} validate function to call to validate the state
   *         of the input.
   * @param {function(data)=} [update=noop] function to call when state of the
   *    validator changes
   *
   * @paramDescription
   * The `validate` function (specified by you) is called as
   * `validate(inputToValidate, validationDone)`:
   *
   *    * `inputToValidate`: value of the input box.
   *    * `validationDone`: `function(error, data){...}`
   *       * `error`: error text to display if validation fails
   *       * `data`: data object to pass to update function
   *
   * The `update` function is optionally specified by you and is
   * called by <angular/> on input change. Since the
   * asynchronous validator caches the results, the update
   * function can be called without a call to `validate`
   * function. The function is called as `update(data)`:
   *
   *    * `data`: data object as passed from validate function
   *
   * @css ng-input-indicator-wait, ng-validation-error
   *
   * @example
    <doc:example>
      <doc:source>
        <script>
        function MyCntl(){
         this.myValidator = function (inputToValidate, validationDone) {
           setTimeout(function(){
             validationDone(inputToValidate.length % 2);
           }, 500);
         }
        }
        </script>
        This input is validated asynchronously:
        <div ng:controller="MyCntl">
          <input name="text" ng:validate="asynchronous:myValidator">
        </div>
      </doc:source>
      <doc:scenario>
        it('should change color in delayed way', function(){
         var textBox = element('.doc-example-live :input');
         expect(textBox.attr('className')).not().toMatch(/ng-input-indicator-wait/);
         expect(textBox.attr('className')).not().toMatch(/ng-validation-error/);
         input('text').enter('X');
         expect(textBox.attr('className')).toMatch(/ng-input-indicator-wait/);
         sleep(.6);
         expect(textBox.attr('className')).not().toMatch(/ng-input-indicator-wait/);
         expect(textBox.attr('className')).toMatch(/ng-validation-error/);
        });
      </doc:scenario>
    </doc:example>
   *
   */
  /*
   * cache is attached to the element
   * cache: {
   *   inputs : {
   *     'user input': {
   *        response: server response,
   *        error: validation error
   *     },
   *     current: 'current input'
   *   }
   * }
   *
   */
  'asynchronous': function(input, asynchronousFn, updateFn) {
    if (!input) return;
    var scope = this;
    var element = scope.$element;
    var cache = element.data('$asyncValidator');
    if (!cache) {
      element.data('$asyncValidator', cache = {inputs:{}});
    }

    cache.current = input;

    var inputState = cache.inputs[input],
        $invalidWidgets = scope.$service('$invalidWidgets');

    if (!inputState) {
      cache.inputs[input] = inputState = { inFlight: true };
      $invalidWidgets.markInvalid(scope.$element);
      element.addClass('ng-input-indicator-wait');
      asynchronousFn(input, function(error, data) {
        inputState.response = data;
        inputState.error = error;
        inputState.inFlight = false;
        if (cache.current == input) {
          element.removeClass('ng-input-indicator-wait');
          $invalidWidgets.markValid(element);
        }
        element.data($$validate)();
        scope.$service('$updateView')();
      });
    } else if (inputState.inFlight) {
      // request in flight, mark widget invalid, but don't show it to user
      $invalidWidgets.markInvalid(scope.$element);
    } else {
      (updateFn||noop)(inputState.response);
    }
    return inputState.error;
  }

});

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$cookieStore
 * @requires $cookies
 *
 * @description
 * Provides a key-value (string-object) storage, that is backed by session cookies.
 * Objects put or retrieved from this storage are automatically serialized or
 * deserialized by angular's toJson/fromJson.
 * @example
 */
angularServiceInject('$cookieStore', function($store) {

  return {
    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$cookieStore#get
     * @methodOf angular.service.$cookieStore
     *
     * @description
     * Returns the value of given cookie key
     *
     * @param {string} key Id to use for lookup.
     * @returns {Object} Deserialized cookie value.
     */
    get: function(key) {
      return fromJson($store[key]);
    },

    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$cookieStore#put
     * @methodOf angular.service.$cookieStore
     *
     * @description
     * Sets a value for given cookie key
     *
     * @param {string} key Id for the `value`.
     * @param {Object} value Value to be stored.
     */
    put: function(key, value) {
      $store[key] = toJson(value);
    },

    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$cookieStore#remove
     * @methodOf angular.service.$cookieStore
     *
     * @description
     * Remove given cookie
     *
     * @param {string} key Id of the key-value pair to delete.
     */
    remove: function(key) {
      delete $store[key];
    }
  };

}, ['$cookies']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$cookies
 * @requires $browser
 *
 * @description
 * Provides read/write access to browser's cookies.
 *
 * Only a simple Object is exposed and by adding or removing properties to/from
 * this object, new cookies are created/deleted at the end of current $eval.
 *
 * @example
 */
angularServiceInject('$cookies', function($browser) {
  var rootScope = this,
      cookies = {},
      lastCookies = {},
      lastBrowserCookies,
      runEval = false;

  //creates a poller fn that copies all cookies from the $browser to service & inits the service
  $browser.addPollFn(function() {
    var currentCookies = $browser.cookies();
    if (lastBrowserCookies != currentCookies) { //relies on browser.cookies() impl
      lastBrowserCookies = currentCookies;
      copy(currentCookies, lastCookies);
      copy(currentCookies, cookies);
      if (runEval) rootScope.$eval();
    }
  })();

  runEval = true;

  //at the end of each eval, push cookies
  //TODO: this should happen before the "delayed" watches fire, because if some cookies are not
  //      strings or browser refuses to store some cookies, we update the model in the push fn.
  this.$onEval(PRIORITY_LAST, push);

  return cookies;


  /**
   * Pushes all the cookies from the service to the browser and verifies if all cookies were stored.
   */
  function push(){
    var name,
        value,
        browserCookies,
        updated;

    //delete any cookies deleted in $cookies
    for (name in lastCookies) {
      if (isUndefined(cookies[name])) {
        $browser.cookies(name, undefined);
      }
    }

    //update all cookies updated in $cookies
    for(name in cookies) {
      value = cookies[name];
      if (!isString(value)) {
        if (isDefined(lastCookies[name])) {
          cookies[name] = lastCookies[name];
        } else {
          delete cookies[name];
        }
      } else if (value !== lastCookies[name]) {
        $browser.cookies(name, value);
        updated = true;
      }
    }

    //verify what was actually stored
    if (updated){
      updated = false;
      browserCookies = $browser.cookies();

      for (name in cookies) {
        if (cookies[name] !== browserCookies[name]) {
          //delete or reset all cookies that the browser dropped from $cookies
          if (isUndefined(browserCookies[name])) {
            delete cookies[name];
          } else {
            cookies[name] = browserCookies[name];
          }
          updated = true;
        }
      }
    }
  }
}, ['$browser']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$defer
 * @requires $browser
 * @requires $exceptionHandler
 * @requires $updateView
 *
 * @description
 * Delegates to {@link angular.service.$browser $browser.defer}, but wraps the `fn` function
 * into a try/catch block and delegates any exceptions to
 * {@link angular.service.$exceptionHandler $exceptionHandler} service.
 *
 * In tests you can use `$browser.defer.flush()` to flush the queue of deferred functions.
 *
 * @param {function()} fn A function, who's execution should be deferred.
 * @param {number=} [delay=0] of milliseconds to defer the function execution.
 */
angularServiceInject('$defer', function($browser, $exceptionHandler, $updateView) {
  return function(fn, delay) {
    $browser.defer(function() {
      try {
        fn();
      } catch(e) {
        $exceptionHandler(e);
      } finally {
        $updateView();
      }
    }, delay);
  };
}, ['$browser', '$exceptionHandler', '$updateView']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$document
 * @requires $window
 *
 * @description
 * A {@link angular.element jQuery (lite)}-wrapped reference to the browser's `window.document`
 * element.
 */
angularServiceInject("$document", function(window){
  return jqLite(window.document);
}, ['$window']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$exceptionHandler
 * @requires $log
 *
 * @description
 * Any uncaught exception in angular expressions is delegated to this service.
 * The default implementation simply delegates to `$log.error` which logs it into
 * the browser console.
 *
 * In unit tests, if `angular-mocks.js` is loaded, this service is overriden by
 * {@link angular.mock.service.$exceptionHandler mock $exceptionHandler}
 *
 * @example
 */
var $exceptionHandlerFactory; //reference to be used only in tests
angularServiceInject('$exceptionHandler', $exceptionHandlerFactory = function($log){
  return function(e) {
    $log.error(e);
  };
}, ['$log']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$hover
 * @requires $browser
 * @requires $document
 *
 * @description
 *
 * @example
 */
angularServiceInject("$hover", function(browser, document) {
  var tooltip, self = this, error, width = 300, arrowWidth = 10, body = jqLite(document[0].body);
  browser.hover(function(element, show){
    if (show && (error = element.attr(NG_EXCEPTION) || element.attr(NG_VALIDATION_ERROR))) {
      if (!tooltip) {
        tooltip = {
            callout: jqLite('<div id="ng-callout"></div>'),
            arrow: jqLite('<div></div>'),
            title: jqLite('<div class="ng-title"></div>'),
            content: jqLite('<div class="ng-content"></div>')
        };
        tooltip.callout.append(tooltip.arrow);
        tooltip.callout.append(tooltip.title);
        tooltip.callout.append(tooltip.content);
        body.append(tooltip.callout);
      }
      var docRect = body[0].getBoundingClientRect(),
          elementRect = element[0].getBoundingClientRect(),
          leftSpace = docRect.right - elementRect.right - arrowWidth;
      tooltip.title.text(element.hasClass("ng-exception") ? "EXCEPTION:" : "Validation error...");
      tooltip.content.text(error);
      if (leftSpace < width) {
        tooltip.arrow.addClass('ng-arrow-right');
        tooltip.arrow.css({left: (width + 1)+'px'});
        tooltip.callout.css({
          position: 'fixed',
          left: (elementRect.left - arrowWidth - width - 4) + "px",
          top: (elementRect.top - 3) + "px",
          width: width + "px"
        });
      } else {
        tooltip.arrow.addClass('ng-arrow-left');
        tooltip.callout.css({
          position: 'fixed',
          left: (elementRect.right + arrowWidth) + "px",
          top: (elementRect.top - 3) + "px",
          width: width + "px"
        });
      }
    } else if (tooltip) {
      tooltip.callout.remove();
      tooltip = null;
    }
  });
}, ['$browser', '$document'], true);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$invalidWidgets
 *
 * @description
 * Keeps references to all invalid widgets found during validation.
 * Can be queried to find whether there are any invalid widgets currently displayed.
 *
 * @example
 */
angularServiceInject("$invalidWidgets", function(){
  var invalidWidgets = [];


  /** Remove an element from the array of invalid widgets */
  invalidWidgets.markValid = function(element){
    var index = indexOf(invalidWidgets, element);
    if (index != -1)
      invalidWidgets.splice(index, 1);
  };


  /** Add an element to the array of invalid widgets */
  invalidWidgets.markInvalid = function(element){
    var index = indexOf(invalidWidgets, element);
    if (index === -1)
      invalidWidgets.push(element);
  };


  /** Return count of all invalid widgets that are currently visible */
  invalidWidgets.visible = function() {
    var count = 0;
    forEach(invalidWidgets, function(widget){
      count = count + (isVisible(widget) ? 1 : 0);
    });
    return count;
  };


  /* At the end of each eval removes all invalid widgets that are not part of the current DOM. */
  this.$onEval(PRIORITY_LAST, function() {
    for(var i = 0; i < invalidWidgets.length;) {
      var widget = invalidWidgets[i];
      if (isOrphan(widget[0])) {
        invalidWidgets.splice(i, 1);
        if (widget.dealoc) widget.dealoc();
      } else {
        i++;
      }
    }
  });


  /**
   * Traverses DOM element's (widget's) parents and considers the element to be an orphant if one of
   * it's parents isn't the current window.document.
   */
  function isOrphan(widget) {
    if (widget == window.document) return false;
    var parent = widget.parentNode;
    return !parent || isOrphan(parent);
  }

  return invalidWidgets;
});

var URL_MATCH = /^(file|ftp|http|https):\/\/(\w+:{0,1}\w*@)?([\w\.-]*)(:([0-9]+))?(\/[^\?#]*)?(\?([^#]*))?(#(.*))?$/,
    HASH_MATCH = /^([^\?]*)?(\?([^\?]*))?$/,
    DEFAULT_PORTS = {'http': 80, 'https': 443, 'ftp':21};

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$location
 * @requires $browser
 *
 * @property {string} href The full URL of the current location.
 * @property {string} protocol The protocol part of the URL (e.g. http or https).
 * @property {string} host The host name, ip address or FQDN of the current location.
 * @property {number} port The port number of the current location (e.g. 80, 443, 8080).
 * @property {string} path The path of the current location (e.g. /myapp/inbox).
 * @property {Object.<string|boolean>} search Map of query parameters (e.g. {user:"foo", page:23}).
 * @property {string} hash The fragment part of the URL of the current location (e.g. #foo).
 * @property {string} hashPath Similar to `path`, but located in the `hash` fragment
 *     (e.g. ../foo#/some/path  => /some/path).
 * @property {Object.<string|boolean>} hashSearch Similar to `search` but located in `hash`
 *     fragment (e.g. .../foo#/some/path?hashQuery=param  =>  {hashQuery: "param"}).
 *
 * @description
 * Parses the browser location url and makes it available to your application.
 * Any changes to the url are reflected into `$location` service and changes to
 * `$location` are reflected in the browser location url.
 *
 * Notice that using browser's forward/back buttons changes the $location.
 *
 * @example
   <doc:example>
     <doc:source>
       <div ng:init="$location = $service('$location')">
         <a id="ex-test" href="#myPath?name=misko">test hash</a>|
         <a id="ex-reset" href="#!/api/angular.service.$location">reset hash</a><br/>
         <input type='text' name="$location.hash" size="30">
         <pre>$location = {{$location}}</pre>
       </div>
     </doc:source>
     <doc:scenario>
       it('should initialize the input field', function() {
         expect(using('.doc-example-live').input('$location.hash').val()).
           toBe('!/api/angular.service.$location');
       });


       it('should bind $location.hash to the input field', function() {
         using('.doc-example-live').input('$location.hash').enter('foo');
         expect(browser().location().hash()).toBe('foo');
       });


       it('should set the hash to a test string with test link is presed', function() {
         using('.doc-example-live').element('#ex-test').click();
         expect(using('.doc-example-live').input('$location.hash').val()).
           toBe('myPath?name=misko');
       });

       it('should reset $location when reset link is pressed', function() {
         using('.doc-example-live').input('$location.hash').enter('foo');
         using('.doc-example-live').element('#ex-reset').click();
         expect(using('.doc-example-live').input('$location.hash').val()).
           toBe('!/api/angular.service.$location');
       });

     </doc:scenario>
    </doc:example>
 */
angularServiceInject("$location", function($browser) {
  var scope = this,
      location = {update:update, updateHash: updateHash},
      lastLocation = {};

  $browser.onHashChange(function() { //register
    update($browser.getUrl());
    copy(location, lastLocation);
    scope.$eval();
  })(); //initialize

  this.$onEval(PRIORITY_FIRST, sync);
  this.$onEval(PRIORITY_LAST, updateBrowser);

  return location;

  // PUBLIC METHODS

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$location#update
   * @methodOf angular.service.$location
   *
   * @description
   * Updates the location object.
   *
   * Does not immediately update the browser. Instead the browser is updated at the end of $eval()
   * cycle.
   *
   * <pre>
       $location.update('http://www.angularjs.org/path#hash?search=x');
       $location.update({host: 'www.google.com', protocol: 'https'});
       $location.update({hashPath: '/path', hashSearch: {a: 'b', x: true}});
     </pre>
   *
   * @param {string|Object} href Full href as a string or object with properties
   */
  function update(href) {
    if (isString(href)) {
      extend(location, parseHref(href));
    } else {
      if (isDefined(href.hash)) {
        extend(href, isString(href.hash) ? parseHash(href.hash) : href.hash);
      }

      extend(location, href);

      if (isDefined(href.hashPath || href.hashSearch)) {
        location.hash = composeHash(location);
      }

      location.href = composeHref(location);
    }
  }

  /**
   * @workInProgress
   * @ngdoc method
   * @name angular.service.$location#updateHash
   * @methodOf angular.service.$location
   *
   * @description
   * Updates the hash fragment part of the url.
   *
   * @see update()
   *
   * <pre>
       scope.$location.updateHash('/hp')
         ==> update({hashPath: '/hp'})
       scope.$location.updateHash({a: true, b: 'val'})
         ==> update({hashSearch: {a: true, b: 'val'}})
       scope.$location.updateHash('/hp', {a: true})
         ==> update({hashPath: '/hp', hashSearch: {a: true}})
     </pre>
   *
   * @param {string|Object} path A hashPath or hashSearch object
   * @param {Object=} search A hashSearch object
   */
  function updateHash(path, search) {
    var hash = {};

    if (isString(path)) {
      hash.hashPath = path;
      hash.hashSearch = search || {};
    } else
      hash.hashSearch = path;

    hash.hash = composeHash(hash);

    update({hash: hash});
  }


  // INNER METHODS

  /**
   * Synchronizes all location object properties.
   *
   * User is allowed to change properties, so after property change,
   * location object is not in consistent state.
   *
   * Properties are synced with the following precedence order:
   *
   * - `$location.href`
   * - `$location.hash`
   * - everything else
   *
   * Keep in mind that if the following code is executed:
   *
   * scope.$location.href = 'http://www.angularjs.org/path#a/b'
   *
   * immediately afterwards all other properties are still the old ones...
   *
   * This method checks the changes and update location to the consistent state
   */
  function sync() {
    if (!equals(location, lastLocation)) {
      if (location.href != lastLocation.href) {
        update(location.href);
        return;
      }
      if (location.hash != lastLocation.hash) {
        var hash = parseHash(location.hash);
        updateHash(hash.hashPath, hash.hashSearch);
      } else {
        location.hash = composeHash(location);
        location.href = composeHref(location);
      }
      update(location.href);
    }
  }


  /**
   * If location has changed, update the browser
   * This method is called at the end of $eval() phase
   */
  function updateBrowser() {
    sync();

    if ($browser.getUrl() != location.href) {
      $browser.setUrl(location.href);
      copy(location, lastLocation);
    }
  }

  /**
   * Compose href string from a location object
   *
   * @param {Object} loc The location object with all properties
   * @return {string} Composed href
   */
  function composeHref(loc) {
    var url = toKeyValue(loc.search);
    var port = (loc.port == DEFAULT_PORTS[loc.protocol] ? null : loc.port);

    return loc.protocol  + '://' + loc.host +
          (port ? ':' + port : '') + loc.path +
          (url ? '?' + url : '') + (loc.hash ? '#' + loc.hash : '');
  }

  /**
   * Compose hash string from location object
   *
   * @param {Object} loc Object with hashPath and hashSearch properties
   * @return {string} Hash string
   */
  function composeHash(loc) {
    var hashSearch = toKeyValue(loc.hashSearch);
    //TODO: temporary fix for issue #158
    return escape(loc.hashPath).replace(/%21/gi, '!').replace(/%3A/gi, ':').replace(/%24/gi, '$') +
          (hashSearch ? '?' + hashSearch : '');
  }

  /**
   * Parse href string into location object
   *
   * @param {string} href
   * @return {Object} The location object
   */
  function parseHref(href) {
    var loc = {};
    var match = URL_MATCH.exec(href);

    if (match) {
      loc.href = href.replace(/#$/, '');
      loc.protocol = match[1];
      loc.host = match[3] || '';
      loc.port = match[5] || DEFAULT_PORTS[loc.protocol] || null;
      loc.path = match[6] || '';
      loc.search = parseKeyValue(match[8]);
      loc.hash = match[10] || '';

      extend(loc, parseHash(loc.hash));
    }

    return loc;
  }

  /**
   * Parse hash string into object
   *
   * @param {string} hash
   */
  function parseHash(hash) {
    var h = {};
    var match = HASH_MATCH.exec(hash);

    if (match) {
      h.hash = hash;
      h.hashPath = unescape(match[1] || '');
      h.hashSearch = parseKeyValue(match[3]);
    }

    return h;
  }
}, ['$browser']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$log
 * @requires $window
 *
 * @description
 * Simple service for logging. Default implementation writes the message
 * into the browser's console (if present).
 *
 * The main purpose of this service is to simplify debugging and troubleshooting.
 *
 * @example
    <doc:example>
      <doc:source>
         <p>Reload this page with open console, enter text and hit the log button...</p>
         Message:
         <input type="text" name="message" value="Hello World!"/>
         <button ng:click="$log.log(message)">log</button>
         <button ng:click="$log.warn(message)">warn</button>
         <button ng:click="$log.info(message)">info</button>
         <button ng:click="$log.error(message)">error</button>
      </doc:source>
      <doc:scenario>
      </doc:scenario>
    </doc:example>
 */
var $logFactory; //reference to be used only in tests
angularServiceInject("$log", $logFactory = function($window){
  return {
    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$log#log
     * @methodOf angular.service.$log
     *
     * @description
     * Write a log message
     */
    log: consoleLog('log'),

    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$log#warn
     * @methodOf angular.service.$log
     *
     * @description
     * Write a warning message
     */
    warn: consoleLog('warn'),

    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$log#info
     * @methodOf angular.service.$log
     *
     * @description
     * Write an information message
     */
    info: consoleLog('info'),

    /**
     * @workInProgress
     * @ngdoc method
     * @name angular.service.$log#error
     * @methodOf angular.service.$log
     *
     * @description
     * Write an error message
     */
    error: consoleLog('error')
  };

  function consoleLog(type) {
    var console = $window.console || {};
    var logFn = console[type] || console.log || noop;
    if (logFn.apply) {
      return function(){
        var args = [];
        forEach(arguments, function(arg){
          args.push(formatError(arg));
        });
        return logFn.apply(console, args);
      };
    } else {
      // we are IE, in which case there is nothing we can do
      return logFn;
    }
  }
}, ['$window']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$resource
 * @requires $xhr.cache
 *
 * @description
 * A factory which creates a resource object that lets you interact with
 * [RESTful](http://en.wikipedia.org/wiki/Representational_State_Transfer) server-side data sources.
 *
 * The returned resource object has action methods which provide high-level behaviors without
 * the need to interact with the low level {@link angular.service.$xhr $xhr} service or
 * raw XMLHttpRequest.
 *
 * @param {string} url A parameterized URL template with parameters prefixed by `:` as in
 *   `/user/:username`.
 *
 * @param {Object=} paramDefaults Default values for `url` parameters. These can be overridden in
 *   `actions` methods.
 *
 *   Each key value in the parameter object is first bound to url template if present and then any
 *   excess keys are appended to the url search query after the `?`.
 *
 *   Given a template `/path/:verb` and parameter `{verb:'greet', salutation:'Hello'}` results in
 *   URL `/path/greet?salutation=Hello`.
 *
 *   If the parameter value is prefixed with `@` then the value of that parameter is extracted from
 *   the data object (useful for non-GET operations).
 *
 * @param {Object.<Object>=} actions Hash with declaration of custom action that should extend the
 *   default set of resource actions. The declaration should be created in the following format:
 *
 *       {action1: {method:?, params:?, isArray:?, verifyCache:?},
 *        action2: {method:?, params:?, isArray:?, verifyCache:?},
 *        ...}
 *
 *   Where:
 *
 *   - `action` – {string} – The name of action. This name becomes the name of the method on your
 *     resource object.
 *   - `method` – {string} – HTTP request method. Valid methods are: `GET`, `POST`, `PUT`, `DELETE`,
 *     and `JSON` (also known as JSONP).
 *   - `params` – {object=} – Optional set of pre-bound parameters for this action.
 *   - isArray – {boolean=} – If true then the returned object for this action is an array, see
 *     `returns` section.
 *   - verifyCache – {boolean=} – If true then whenever cache hit occurs, the object is returned and
 *     an async request will be made to the server and the resources as well as the cache will be
 *     updated when the response is received.
 *
 * @returns {Object} A resource "class" object with methods for the default set of resource actions
 *   optionally extended with custom `actions`. The default set contains these actions:
 *
 *       { 'get':    {method:'GET'},
 *         'save':   {method:'POST'},
 *         'query':  {method:'GET', isArray:true},
 *         'remove': {method:'DELETE'},
 *         'delete': {method:'DELETE'} };
 *
 *   Calling these methods invoke an {@link angular.service.$xhr} with the specified http method,
 *   destination and parameters. When the data is returned from the server then the object is an
 *   instance of the resource class `save`, `remove` and `delete` actions are available on it as
 *   methods with the `$` prefix. This allows you to easily perform CRUD operations (create, read,
 *   update, delete) on server-side data like this:
 *   <pre>
        var User = $resource('/user/:userId', {userId:'@id'});
        var user = User.get({userId:123}, function(){
          user.abc = true;
          user.$save();
        });
     </pre>
 *
 *   It is important to realize that invoking a $resource object method immediately returns an
 *   empty reference (object or array depending on `isArray`). Once the data is returned from the
 *   server the existing reference is populated with the actual data. This is a useful trick since
 *   usually the resource is assigned to a model which is then rendered by the view. Having an empty
 *   object results in no rendering, once the data arrives from the server then the object is
 *   populated with the data and the view automatically re-renders itself showing the new data. This
 *   means that in most case one never has to write a callback function for the action methods.
 *
 *   The action methods on the class object or instance object can be invoked with the following
 *   parameters:
 *
 *   - HTTP GET "class" actions: `Resource.action([parameters], [success], [error])`
 *   - non-GET "class" actions: `Resource.action(postData, [parameters], [success], [error])`
 *   - non-GET instance actions:  `instance.$action([parameters], [success], [error])`
 *
 *
 * @example
 *
 * # Credit card resource
 *
 * <pre>
     // Define CreditCard class
     var CreditCard = $resource('/user/:userId/card/:cardId',
      {userId:123, cardId:'@id'}, {
       charge: {method:'POST', params:{charge:true}}
      });

     // We can retrieve a collection from the server
     var cards = CreditCard.query();
     // GET: /user/123/card
     // server returns: [ {id:456, number:'1234', name:'Smith'} ];

     var card = cards[0];
     // each item is an instance of CreditCard
     expect(card instanceof CreditCard).toEqual(true);
     card.name = "J. Smith";
     // non GET methods are mapped onto the instances
     card.$save();
     // POST: /user/123/card/456 {id:456, number:'1234', name:'J. Smith'}
     // server returns: {id:456, number:'1234', name: 'J. Smith'};

     // our custom method is mapped as well.
     card.$charge({amount:9.99});
     // POST: /user/123/card/456?amount=9.99&charge=true {id:456, number:'1234', name:'J. Smith'}
     // server returns: {id:456, number:'1234', name: 'J. Smith'};

     // we can create an instance as well
     var newCard = new CreditCard({number:'0123'});
     newCard.name = "Mike Smith";
     newCard.$save();
     // POST: /user/123/card {number:'0123', name:'Mike Smith'}
     // server returns: {id:789, number:'01234', name: 'Mike Smith'};
     expect(newCard.id).toEqual(789);
 * </pre>
 *
 * The object returned from this function execution is a resource "class" which has "static" method
 * for each action in the definition.
 *
 * Calling these methods invoke `$xhr` on the `url` template with the given `method` and `params`.
 * When the data is returned from the server then the object is an instance of the resource type and
 * all of the non-GET methods are available with `$` prefix. This allows you to easily support CRUD
 * operations (create, read, update, delete) on server-side data.

   <pre>
     var User = $resource('/user/:userId', {userId:'@id'});
     var user = User.get({userId:123}, function(){
       user.abc = true;
       user.$save();
     });
   </pre>
 *
 *     It's worth noting that the success callback for `get`, `query` and other method gets passed
 *     in the response that came from the server, so one could rewrite the above example as:
 *
   <pre>
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(u, responseHeaders){
       u.abc = true;
       u.$save(function(u, responseHeaders) {
         // Get an Object containing all response headers
         var allHeaders = responseHeaders();

         // Get a specific response header
         u.newId = responseHeaders('Location');
       });
     });
   </pre>

 * # Buzz client

   Let's look at what a buzz client created with the `$resource` service looks like:
    <doc:example>
      <doc:source jsfiddle="false">
       <script>
         function BuzzController($resource) {
           this.Activity = $resource(
             'https://www.googleapis.com/buzz/v1/activities/:userId/:visibility/:activityId/:comments',
             {alt:'json', callback:'JSON_CALLBACK'},
             {get:{method:'JSON', params:{visibility:'@self'}}, replies: {method:'JSON', params:{visibility:'@self', comments:'@comments'}}}
           );
         }

         BuzzController.prototype = {
           fetch: function() {
             this.activities = this.Activity.get({userId:this.userId});
           },
           expandReplies: function(activity) {
             activity.replies = this.Activity.replies({userId:this.userId, activityId:activity.id});
           }
         };
         BuzzController.$inject = ['$resource'];
       </script>

       <div ng:controller="BuzzController">
         <input name="userId" value="googlebuzz"/>
         <button ng:click="fetch()">fetch</button>
         <hr/>
         <div ng:repeat="item in activities.data.items">
           <h1 style="font-size: 15px;">
             <img src="{{item.actor.thumbnailUrl}}" style="max-height:30px;max-width:30px;"/>
             <a href="{{item.actor.profileUrl}}">{{item.actor.name}}</a>
             <a href ng:click="expandReplies(item)" style="float: right;">Expand replies: {{item.links.replies[0].count}}</a>
           </h1>
           {{item.object.content | html}}
           <div ng:repeat="reply in item.replies.data.items" style="margin-left: 20px;">
             <img src="{{reply.actor.thumbnailUrl}}" style="max-height:30px;max-width:30px;"/>
             <a href="{{reply.actor.profileUrl}}">{{reply.actor.name}}</a>: {{reply.content | html}}
           </div>
         </div>
       </div>
      </doc:source>
      <doc:scenario>
      </doc:scenario>
    </doc:example>
 */
angularServiceInject('$resource', function($xhr){
  var resource = new ResourceFactory($xhr);
  return bind(resource, resource.route);
}, ['$xhr.cache']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$route
 * @requires $location
 *
 * @property {Object} current Reference to the current route definition.
 * @property {Array.<Object>} routes Array of all configured routes.
 *
 * @description
 * Watches `$location.hashPath` and tries to map the hash to an existing route
 * definition. It is used for deep-linking URLs to controllers and views (HTML partials).
 *
 * The `$route` service is typically used in conjunction with {@link angular.widget.ng:view ng:view}
 * widget.
 *
 * @example
   This example shows how changing the URL hash causes the <tt>$route</tt>
   to match a route against the URL, and the <tt>[[ng:include]]</tt> pulls in the partial.
   Try changing the URL in the input box to see changes.

    <doc:example>
      <doc:source jsfiddle="false">
        <script>
          function MainCntl($route, $location) {
            this.$route = $route;
            this.$location = $location;

            $route.when('/Book/:bookId', {template: 'examples/book.html', controller: BookCntl});
            $route.when('/Book/:bookId/ch/:chapterId', {template: 'examples/chapter.html', controller: ChapterCntl});
            $route.onChange(function() {
              $route.current.scope.params = $route.current.params;
            });
          }

          function BookCntl() {
            this.name = "BookCntl";
          }

          function ChapterCntl() {
            this.name = "ChapterCntl";
          }
        </script>

        <div ng:controller="MainCntl">
          Choose:
          <a href="#/Book/Moby">Moby</a> |
          <a href="#/Book/Moby/ch/1">Moby: Ch1</a> |
          <a href="#/Book/Gatsby">Gatsby</a> |
          <a href="#/Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a><br/>
          $location.hashPath: <input type="text" name="$location.hashPath" size="80" />
          <pre>$route.current.template = {{$route.current.template}}</pre>
          <pre>$route.current.params = {{$route.current.params}}</pre>
          <pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>
          <hr />
          <ng:view></ng:view>
        </div>
      </doc:source>
      <doc:scenario>
      </doc:scenario>
    </doc:example>
 */
angularServiceInject('$route', function(location, $updateView) {
  var routes = {},
      onChange = [],
      matcher = switchRouteMatcher,
      parentScope = this,
      dirty = 0,
      lastHashPath,
      lastRouteParams,
      $route = {
        routes: routes,

        /**
         * @workInProgress
         * @ngdoc method
         * @name angular.service.$route#onChange
         * @methodOf angular.service.$route
         *
         * @param {function()} fn Function that will be called when `$route.current` changes.
         * @returns {function()} The registered function.
         *
         * @description
         * Register a handler function that will be called when route changes
         */
        onChangeListener: function(fn) {
          onChange.push(fn);
          return fn;
        },

        /**
         * @workInProgress
         * @ngdoc method
         * @name angular.service.$route#parent
         * @methodOf angular.service.$route
         *
         * @param {Scope} [scope=rootScope] Scope to be used as parent for newly created
         *    `$route.current.scope` scopes.
         *
         * @description
         * Sets a scope to be used as the parent scope for scopes created on route change. If not
         * set, defaults to the root scope.
         */
        parent: function(scope) {
          if (scope) parentScope = scope;
        },

        /**
         * @workInProgress
         * @ngdoc method
         * @name angular.service.$route#when
         * @methodOf angular.service.$route
         *
         * @param {string} path Route path (matched against `$location.hash`)
         * @param {Object} params Mapping information to be assigned to `$route.current` on route
         *    match.
         *
         *    Object properties:
         *
         *    - `controller` – `{function()=}` – Controller fn that should be associated with newly
         *      created scope.
         *    - `template` – `{string=}` – path to an html template that should be used by
         *      {@link angular.widget.ng:view ng:view} or
         *      {@link angular.widget.ng:include ng:include} widgets.
         *    - `redirectTo` – {(string|function())=} – value to update
         *      {@link angular.service.$location $location} hash with and trigger route redirection.
         *
         *      If `redirectTo` is a function, it will be called with the following parameters:
         *
         *      - `{Object.<string>}` - route parameters extracted from the current
         *        `$location.hashPath` by applying the current route template.
         *      - `{string}` - current `$location.hash`
         *      - `{string}` - current `$location.hashPath`
         *      - `{string}` - current `$location.hashSearch`
         *
         *      The custom `redirectTo` function is expected to return a string which will be used
         *      to update `$location.hash`.
         *
         *    - `[reloadOnSearch=true]` - {boolean=} - reload route when $location.hashSearch
         *      changes. If this option is disabled, you should set up a $watch to be notified of
         *      param (hashSearch) changes as follows:
         *
         *            function MyCtrl($route) {
         *              this.$watch(function() {
         *                return $route.current.params.myHashSearchParam;
         *              }, function(params) {
         *                //do stuff with params
         *              });
         *            }
         *
         * @returns {Object} route object
         *
         * @description
         * Adds a new route definition to the `$route` service.
         */
        when:function (path, params) {
          if (isUndefined(path)) return routes; //TODO(im): remove - not needed!
          var route = routes[path];
          if (!route) route = routes[path] = {reloadOnSearch: true};
          if (params) extend(route, params); //TODO(im): what the heck? merge two route definitions?
          dirty++;
          return route;
        },

        /**
         * @workInProgress
         * @ngdoc method
         * @name angular.service.$route#otherwise
         * @methodOf angular.service.$route
         *
         * @description
         * Sets route definition that will be used on route change when no other route definition
         * is matched.
         *
         * @param {Object} params Mapping information to be assigned to `$route.current`.
         */
        otherwise: function(params) {
          $route.when(null, params);
        },

        /**
         * @workInProgress
         * @ngdoc method
         * @name angular.service.$route#reload
         * @methodOf angular.service.$route
         *
         * @description
         * Causes `$route` service to reload (and recreate the `$route.current` scope) upon the next
         * eval even if {@link angular.service.$location $location} hasn't changed.
         */
        reload: function() {
          dirty++;
        }
      };


  function switchRouteMatcher(on, when, dstName) {
    var regex = '^' + when.replace(/[\.\\\(\)\^\$]/g, "\$1") + '$',
        params = [],
        dst = {};
    forEach(when.split(/\W/), function(param){
      if (param) {
        var paramRegExp = new RegExp(":" + param + "([\\W])");
        if (regex.match(paramRegExp)) {
          regex = regex.replace(paramRegExp, "([^\/]*)$1");
          params.push(param);
        }
      }
    });
    var match = on.match(new RegExp(regex));
    if (match) {
      forEach(params, function(name, index){
        dst[name] = match[index + 1];
      });
      if (dstName) this.$set(dstName, dst);
    }
    return match ? dst : null;
  }


  function updateRoute(){
    var childScope, routeParams, pathParams, segmentMatch, key, redir;

    if ($route.current) {
      if (!$route.current.reloadOnSearch && (lastHashPath == location.hashPath)) {
        $route.current.params = extend({}, location.hashSearch, lastRouteParams);
        return;
      }
    }

    lastHashPath = location.hashPath;
    $route.current = null;
    forEach(routes, function(rParams, rPath) {
      if (!pathParams) {
        if (pathParams = matcher(location.hashPath, rPath)) {
          routeParams = rParams;
        }
      }
    });

    // "otherwise" fallback
    routeParams = routeParams || routes[null];

    if(routeParams) {
      if (routeParams.redirectTo) {
        if (isString(routeParams.redirectTo)) {
          // interpolate the redirectTo string
          redir = {hashPath: '',
                   hashSearch: extend({}, location.hashSearch, pathParams)};

          forEach(routeParams.redirectTo.split(':'), function(segment, i) {
            if (i==0) {
              redir.hashPath += segment;
            } else {
              segmentMatch = segment.match(/(\w+)(.*)/);
              key = segmentMatch[1];
              redir.hashPath += pathParams[key] || location.hashSearch[key];
              redir.hashPath += segmentMatch[2] || '';
              delete redir.hashSearch[key];
            }
          });
        } else {
          // call custom redirectTo function
          redir = {hash: routeParams.redirectTo(pathParams, location.hash, location.hashPath,
                                                location.hashSearch)};
        }

        location.update(redir);
        $updateView(); //TODO this is to work around the $location<=>$browser issues
        return;
      }

      childScope = createScope(parentScope);
      $route.current = extend({}, routeParams, {
        scope: childScope,
        params: extend({}, location.hashSearch, pathParams)
      });
      lastRouteParams = pathParams;
    }

    //fire onChange callbacks
    forEach(onChange, parentScope.$tryEval);

    if (childScope) {
      childScope.$become($route.current.controller);
    }
  }


  this.$watch(function(){ return dirty + location.hash; }, updateRoute);

  return $route;
}, ['$location', '$updateView']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$updateView
 * @requires $browser
 *
 * @description
 * Calling `$updateView` enqueues the eventual update of the view. (Update the DOM to reflect the
 * model). The update is eventual, since there are often multiple updates to the model which may
 * be deferred. The default update delayed is 25 ms. This means that the view lags the model by
 * that time. (25ms is small enough that it is perceived as instantaneous by the user). The delay
 * can be adjusted by setting the delay property of the service.
 *
 * <pre>angular.service('$updateView').delay = 10</pre>
 *
 * The delay is there so that multiple updates to the model which occur sufficiently close
 * together can be merged into a single update.
 *
 * You don't usually call '$updateView' directly since angular does it for you in most cases,
 * but there are some cases when you need to call it.
 *
 *  - `$updateView()` called automatically by angular:
 *    - Your Application Controllers: Your controller code is called by angular and hence
 *      angular is aware that you may have changed the model.
 *    - Your Services: Your service is usually called by your controller code, hence same rules
 *      apply.
 *  - May need to call `$updateView()` manually:
 *    - Widgets / Directives: If you listen to any DOM events or events on any third party
 *      libraries, then angular is not aware that you may have changed state state of the
 *      model, and hence you need to call '$updateView()' manually.
 *    - 'setTimeout'/'XHR':  If you call 'setTimeout' (instead of {@link angular.service.$defer})
 *      or 'XHR' (instead of {@link angular.service.$xhr}) then you may be changing the model
 *      without angular knowledge and you may need to call '$updateView()' directly.
 *
 * Note: if you wish to update the view immediately (without delay), you can do so by calling
 * {@link angular.scope.$eval} at any time from your code:
 * <pre>scope.$root.$eval()</pre>
 *
 * In unit-test mode the update is instantaneous and synchronous to simplify writing tests.
 *
 */

function serviceUpdateViewFactory($browser){
  var rootScope = this;
  var scheduled;
  function update(){
    scheduled = false;
    rootScope.$eval();
  }
  return $browser.isMock ? update : function(){
    if (!scheduled) {
      scheduled = true;
      $browser.defer(update, serviceUpdateViewFactory.delay);
    }
  };
}
serviceUpdateViewFactory.delay = 25;

angularServiceInject('$updateView', serviceUpdateViewFactory, ['$browser']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$window
 *
 * @description
 * A reference to the browser's `window` object. While `window`
 * is globally available in JavaScript, it causes testability problems, because
 * it is a global variable. In angular we always refer to it through the
 * `$window` service, so it may be overriden, removed or mocked for testing.
 *
 * All expressions are evaluated with respect to current scope so they don't
 * suffer from window globality.
 *
 * @example
   <doc:example>
     <doc:source>
       <input ng:init="$window = $service('$window'); greeting='Hello World!'" type="text" name="greeting" />
       <button ng:click="$window.alert(greeting)">ALERT</button>
     </doc:source>
     <doc:scenario>
     </doc:scenario>
   </doc:example>
 */
angularServiceInject("$window", bind(window, identity, window));

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$xhr.bulk
 * @requires $xhr
 * @requires $xhr.error
 * @requires $log
 *
 * @description
 *
 * @example
 */
angularServiceInject('$xhr.bulk', function($xhr, $error, $log){
  var requests = [],
      scope = this;
  function bulkXHR(method, url, post, success, error) {
    if (isFunction(post)) {
      error = success;
      success = post;
      post = null;
    }
    var currentQueue;
    forEach(bulkXHR.urls, function(queue){
      if (isFunction(queue.match) ? queue.match(url) : queue.match.exec(url)) {
        currentQueue = queue;
      }
    });
    if (currentQueue) {
      if (!currentQueue.requests) currentQueue.requests = [];
      var request = {
          method: method,
          url: url,
          data: post,
          success: success};
      if (error) request.error = error;
      currentQueue.requests.push(request);
    } else {
      $xhr(method, url, post, success, error);
    }
  }
  bulkXHR.urls = {};
  bulkXHR.flush = function(success, error) {
    forEach(bulkXHR.urls, function(queue, url) {
      var currentRequests = queue.requests;
      if (currentRequests && currentRequests.length) {
        queue.requests = [];
        queue.callbacks = [];
        $xhr('POST', url, {requests: currentRequests},
          function(code, response, responseHeaders) {
            forEach(response, function(response, i) {
              try {
                if (response.status == 200) {
                  (currentRequests[i].success || noop)
                      (response.status, response.response, responseHeaders);
                } else if (isFunction(currentRequests[i].error)) {
                    currentRequests[i].error(response.status, response.response, responseHeaders);
                } else {
                  $error(currentRequests[i], response);
                }
              } catch(e) {
                $log.error(e);
              }
            });
            (success || noop)();
          },
          function(code, response, responseHeaders) {
            forEach(currentRequests, function(request, i) {
              try {
                if (isFunction(request.error)) {
                  request.error(code, response, responseHeaders);
                } else {
                  $error(request, response);
                }
              } catch(e) {
                $log.error(e);
              }
            });
            (error || noop)();
          });
        scope.$eval();
      }
    });
  };
  this.$onEval(PRIORITY_LAST, bulkXHR.flush);
  return bulkXHR;
}, ['$xhr', '$xhr.error', '$log']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$xhr.cache
 * @function
 *
 * @requires $xhr.bulk
 * @requires $defer
 * @requires $xhr.error
 * @requires $log
 *
 * @description
 * Acts just like the {@link angular.service.$xhr $xhr} service but caches responses for `GET`
 * requests. All cache misses are delegated to the $xhr service.
 *
 * @property {function()} delegate Function to delegate all the cache misses to. Defaults to
 *   the {@link angular.service.$xhr $xhr} service.
 * @property {object} data The hashmap where all cached entries are stored.
 *
 * @param {string} method HTTP method.
 * @param {string} url Destination URL.
 * @param {(string|Object)=} post Request body.
 * @param {function(number, (string|Object), Function)} success Response success callback.
 * @param {function(number, (string|Object), Function)} error Response error callback.
 * @param {boolean=} [verifyCache=false] If `true` then a result is immediately returned from cache
 *   (if present) while a request is sent to the server for a fresh response that will update the
 *   cached entry. The `success` function will be called when the response is received.
 * @param {boolean=} [sync=false] in case of cache hit execute `success` synchronously.
 */
angularServiceInject('$xhr.cache', function($xhr, $defer, $error, $log) {
  var inflight = {}, self = this;
  function cache(method, url, post, success, error, verifyCache, sync) {
    if (isFunction(post)) {
      if (!isFunction(success)) {
        verifyCache = success;
        sync = error;
        error = null;
      } else {
        sync = verifyCache;
        verifyCache = error;
        error = success;
      }
      success = post;
      post = null;
    } else if (!isFunction(error)) {
      sync = verifyCache;
      verifyCache = error;
      error = null;
    }

    if (method == 'GET') {
      var data, dataCached;
      if (dataCached = cache.data[url]) {

        if (sync) {
          success(200, copy(dataCached.value), copy(dataCached.headers));
        } else {
          $defer(function() { success(200, copy(dataCached.value), copy(dataCached.headers)); });
        }

        if (!verifyCache)
          return;
      }

      if (data = inflight[url]) {
        data.successes.push(success);
        data.errors.push(error);
      } else {
        inflight[url] = {successes: [success], errors: [error]};
        cache.delegate(method, url, post,
          function(status, response, responseHeaders) {
            if (status == 200)
              cache.data[url] = {value: response, headers: responseHeaders};
            var successes = inflight[url].successes;
            delete inflight[url];
            forEach(successes, function(success) {
              try {
                (success||noop)(status, copy(response), responseHeaders);
              } catch(e) {
                $log.error(e);
              }
            });
          },
          function(status, response, responseHeaders) {
            var errors = inflight[url].errors,
                successes = inflight[url].successes;
            delete inflight[url];

            forEach(errors, function(error, i) {
              try {
                if (isFunction(error)) {
                  error(status, copy(response), copy(responseHeaders));
                } else {
                  $error(
                    {method: method, url: url, data: post, success: successes[i]},
                    {status: status, body: response});
                }
              } catch(e) {
                $log.error(e);
              }
            });
          });
      }

    } else {
      cache.data = {};
      cache.delegate(method, url, post, success, error);
    }
  }
  cache.data = {};
  cache.delegate = $xhr;
  return cache;
}, ['$xhr.bulk', '$defer', '$xhr.error', '$log']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$xhr.error
 * @function
 * @requires $log
 *
 * @description
 * Error handler for {@link angular.service.$xhr $xhr service}. An application can replaces this
 * service with one specific for the application. The default implementation logs the error to
 * {@link angular.service.$log $log.error}.
 *
 * @param {Object} request Request object.
 *
 *   The object has the following properties
 *
 *   - `method` – `{string}` – The http request method.
 *   - `url` – `{string}` – The request destination.
 *   - `data` – `{(string|Object)=} – An optional request body.
 *   - `success` – `{function()}` – The success callback function
 *
 * @param {Object} response Response object.
 *
 *   The response object has the following properties:
 *
 *   - status – {number} – Http status code.
 *   - body – {string|Object} – Body of the response.
 *
 * @example
    <doc:example>
      <doc:source>
        fetch a non-existent file and log an error in the console:
        <button ng:click="$service('$xhr')('GET', '/DOESNT_EXIST')">fetch</button>
      </doc:source>
    </doc:example>
 */
angularServiceInject('$xhr.error', function($log){
  return function(request, response){
    $log.error('ERROR: XHR: ' + request.url, request, response);
  };
}, ['$log']);

/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$xhr
 * @function
 * @requires $browser $xhr delegates all XHR requests to the `$browser.xhr()`. A mock version
 *                    of the $browser exists which allows setting expectations on XHR requests
 *                    in your tests
 * @requires $xhr.error $xhr delegates all non `2xx` response code to this service.
 * @requires $log $xhr delegates all exceptions to `$log.error()`.
 * @requires $updateView After a server response the view needs to be updated for data-binding to
 *           take effect.
 *
 * @description
 * Generates an XHR request. The $xhr service delegates all requests to
 * {@link angular.service.$browser $browser.xhr()} and adds error handling and security features.
 * While $xhr service provides nicer api than raw XmlHttpRequest, it is still considered a lower
 * level api in angular. For a higher level abstraction that utilizes `$xhr`, please check out the
 * {@link angular.service.$resource $resource} service.
 *
 * # Error handling
 * If no `error callback` is specified, XHR response with response code other then `2xx` will be
 * delegated to {@link angular.service.$xhr.error $xhr.error}. The `$xhr.error` can intercept the
 * request and process it in application specific way, or resume normal execution by calling the
 * request `success` method.
 *
 * # HTTP Headers
 * The $xhr service will automatically add certain http headers to all requests. These defaults can
 * be fully configured by accessing the `$xhr.defaults.headers` configuration object, which
 * currently contains this default configuration:
 *
 * - `$xhr.defaults.headers.common` (headers that are common for all requests):
 *   - `Accept: application/json, text/plain, *\/*`
 *   - `X-Requested-With: XMLHttpRequest`
 * - `$xhr.defaults.headers.post` (header defaults for HTTP POST requests):
 *   - `Content-Type: application/x-www-form-urlencoded`
 *
 * To add or overwrite these defaults, simple add or remove a property from this configuration
 * object. To add headers for an HTTP method other than POST, simple create a new object with name
 * equal to the lowercased http method name, e.g. `$xhr.defaults.headers.get['My-Header']='value'`.
 *
 *
 * # Security Considerations
 * When designing web applications your design needs to consider security threats from
 * {@link http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx
 * JSON Vulnerability} and {@link http://en.wikipedia.org/wiki/Cross-site_request_forgery XSRF}.
 * Both server and the client must cooperate in order to eliminate these threats. Angular comes
 * pre-configured with strategies that address these issues, but for this to work backend server
 * cooperation is required.
 *
 * ## JSON Vulnerability Protection
 * A {@link http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx
 * JSON Vulnerability} allows third party web-site to turn your JSON resource URL into
 * {@link http://en.wikipedia.org/wiki/JSON#JSONP JSONP} request under some conditions. To
 * counter this your server can prefix all JSON requests with following string `")]}',\n"`.
 * Angular will automatically strip the prefix before processing it as JSON.
 *
 * For example if your server needs to return:
 * <pre>
 * ['one','two']
 * </pre>
 *
 * which is vulnerable to attack, your server can return:
 * <pre>
 * )]}',
 * ['one','two']
 * </pre>
 *
 * angular will strip the prefix, before processing the JSON.
 *
 *
 * ## Cross Site Request Forgery (XSRF) Protection
 * {@link http://en.wikipedia.org/wiki/Cross-site_request_forgery XSRF} is a technique by which an
 * unauthorized site can gain your user's private data. Angular provides following mechanism to
 * counter XSRF. When performing XHR requests, the $xhr service reads a token from a cookie
 * called `XSRF-TOKEN` and sets it as the HTTP header `X-XSRF-TOKEN`. Since only JavaScript that
 * runs on your domain could read the cookie, your server can be assured that the XHR came from
 * JavaScript running on your domain.
 *
 * To take advantage of this, your server needs to set a token in a JavaScript readable session
 * cookie called `XSRF-TOKEN` on first HTTP GET request. On subsequent non-GET requests the server
 * can verify that the cookie matches `X-XSRF-TOKEN` HTTP header, and therefore be sure that only
 * JavaScript running on your domain could have read the token. The token must be unique for each
 * user and must be verifiable by the server (to prevent the JavaScript making up its own tokens).
 * We recommend that the token is a digest of your site's authentication cookie with
 * {@link http://en.wikipedia.org/wiki/Rainbow_table salt for added security}.
 *
 * @param {string} method HTTP method to use. Valid values are: `GET`, `POST`, `PUT`, `DELETE`, and
 *   `JSON`. `JSON` is a special case which causes a
 *   [JSONP](http://en.wikipedia.org/wiki/JSON#JSONP) cross domain request using script tag
 *   insertion.
 * @param {string} url Relative or absolute URL specifying the destination of the request.  For
 *   `JSON` requests, `url` should include `JSON_CALLBACK` string to be replaced with a name of an
 *   angular generated callback function.
 * @param {(string|Object)=} post Request content as either a string or an object to be stringified
 *   as JSON before sent to the server.
 * @param {function(number, (string|Object), Function)} success A function to be called when the response is
 *   received. The success function will be called with:
 *
 *   - {number} code [HTTP status code](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes) of
 *     the response. This will currently always be 200, since all non-200 responses are routed to
 *     {@link angular.service.$xhr.error} service (or custom error callback).
 *   - {string|Object} response Response object as string or an Object if the response was in JSON
 *     format.
 *   - {function(string=)} responseHeaders A function that when called with a {string} header name,
 *     returns the value of that header or null if it does not exist; when called without
 *     arguments, returns an object containing every response header
 * @param {function(number, (string|Object))} error A function to be called if the response code is
 *   not 2xx.. Accepts the same arguments as success, above.
 *
 * @example
   <doc:example>
     <doc:source jsfiddle="false">
       <script>
         function FetchCntl($xhr) {
           var self = this;

           this.fetch = function() {
             self.code = null;
             self.response = null;

             $xhr(self.method, self.url, function(code, response) {
               self.code = code;
               self.response = response;
             }, function(code, response) {
               self.code = code;
               self.response = response || "Request failed";
             });
           };

           this.updateModel = function(method, url) {
             self.method = method;
             self.url = url;
           };
         }
         FetchCntl.$inject = ['$xhr'];
       </script>
       <div ng:controller="FetchCntl">
         <select name="method">
           <option>GET</option>
           <option>JSON</option>
         </select>
         <input type="text" name="url" value="index.html" size="80"/>
         <button ng:click="fetch()">fetch</button><br>
         <button ng:click="updateModel('GET', 'index.html')">Sample GET</button>
         <button ng:click="updateModel('JSON', 'https://www.googleapis.com/buzz/v1/activities/googlebuzz/@self?alt=json&callback=JSON_CALLBACK')">Sample JSONP (Buzz API)</button>
         <button ng:click="updateModel('JSON', 'https://www.invalid_JSONP_request.com&callback=JSON_CALLBACK')">Invalid JSONP</button>
         <pre>code={{code}}</pre>
         <pre>response={{response}}</pre>
       </div>
     </doc:source>
     <doc:scenario>
       it('should make xhr GET request', function() {
         element(':button:contains("Sample GET")').click();
         element(':button:contains("fetch")').click();
         expect(binding('code')).toBe('code=200');
         expect(binding('response')).toMatch(/angularjs.org/);
       });

       it('should make JSONP request to the Buzz API', function() {
         element(':button:contains("Buzz API")').click();
         element(':button:contains("fetch")').click();
         expect(binding('code')).toBe('code=200');
         expect(binding('response')).toMatch(/buzz-feed/);
       });

       it('should make JSONP request to invalid URL and invoke the error handler',
           function() {
         element(':button:contains("Invalid JSONP")').click();
         element(':button:contains("fetch")').click();
         expect(binding('code')).toBe('code=');
         expect(binding('response')).toBe('response=Request failed');
       });
     </doc:scenario>
   </doc:example>
 */
angularServiceInject('$xhr', function($browser, $error, $log, $updateView){

  var xhrHeaderDefaults = {
    common: {
      "Accept": "application/json, text/plain, */*",
      "X-Requested-With": "XMLHttpRequest"
    },
    post: {'Content-Type': 'application/x-www-form-urlencoded'},
    get: {},      // all these empty properties are needed so that client apps can just do:
    head: {},     // $xhr.defaults.headers.head.foo="bar" without having to create head object
    put: {},      // it also means that if we add a header for these methods in the future, it
    'delete': {}, // won't be easily silently lost due to an object assignment.
    patch: {}
  };

  function xhr(method, url, post, success, error) {
    if (isFunction(post)) {
      error = success;
      success = post;
      post = null;
    }
    if (post && isObject(post)) {
      post = toJson(post);
    }

    $browser.xhr(method, url, post, function(code, response, responseHeaders){
      try {
        if (isString(response)) {
          if (response.match(/^\)\]\}',\n/)) response=response.substr(6);
          if (/^\s*[\[\{]/.exec(response) && /[\}\]]\s*$/.exec(response)) {
            response = fromJson(response, true);
          }
        }
        if (200 <= code && code < 300) {
          success(code, response, responseHeaders);
        } else if (isFunction(error)) {
          error(code, response, responseHeaders);
        } else {
          $error(
            {method: method, url: url, data: post, success: success},
            {status: code, body: response});
        }
      } catch (e) {
        $log.error(e);
      } finally {
        $updateView();
      }
    }, extend({'X-XSRF-TOKEN': $browser.cookies()['XSRF-TOKEN']},
              xhrHeaderDefaults.common,
              xhrHeaderDefaults[lowercase(method)]));
  };

  xhr.defaults = {headers: xhrHeaderDefaults};

  return xhr;
}, ['$browser', '$xhr.error', '$log', '$updateView']);

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.directive
 * @description
 *
 * Custom attributes for DOM elements.  Directives modify the behavior of the element they are
 * specified in, but are not intended to add elements to the DOM as are
 * {@link angular.widget widgets}.
 *
 * Following is the list of built-in angular directives:
 *
 * * {@link angular.directive.ng:bind ng:bind} - Creates a data-binding between HTML text value and
 * data model.
 * * {@link angular.directive.ng:bind-attr ng:bind-attr} - Creates a data-binding as in `ng:bind`,
 * but uses JSON key / value pairs.
 * * {@link angular.directive.ng:bind-template ng:bind-template} - Replaces text value of an element
 * with a specified template.
 * * {@link angular.directive.ng:change ng:change} - Executes an expression when the value of an
 * input widget changes.
 * * {@link angular.directive.ng:class ng:class} - Conditionally set CSS class on an element.
 * * {@link angular.directive.ng:class-even ng:class-even} - Like `ng:class`, but works in
 * conjunction with {@link angular.widget.@ng:repeat} to affect even rows in a collection.
 * * {@link angular.directive.ng:class-odd ng:class-odd} - Like `ng:class`, but works with {@link
 * angular.widget.@ng:repeat}  to affect odd rows.
 * * {@link angular.directive.ng:click ng:click} - Executes custom behavior when element is clicked.
 * * {@link angular.directive.ng:controller ng:controller} - Creates a scope object linked to the
 * DOM element and assigns behavior to the scope.
 * * {@link angular.directive.ng:eval ng:eval} - Executes a binding but blocks output.
 * * {@link angular.directive.ng:eval-order ng:eval-order} - Change evaluation order when updating
 * the view.
 * * {@link angular.directive.ng:hide ng:hide} - Conditionally hides a portion of HTML.
 * * {@link angular.directive.ng:href ng:href} - Places an href in the angular namespace.
 * * {@link angular.directive.ng:init} - Initialization tasks run before a template is executed.
 * * {@link angular.directive.ng:show ng:show} - Conditionally displays a portion of HTML.
 * * {@link angular.directive.ng:src ng:src} - Places a `src` attribute into the angular namespace.
 * * {@link angular.directive.ng:style ng:style} - Conditionally set CSS styles on an element.
 * * {@link angular.directive.ng:submit} - Binds angular expressions to `onSubmit` events.
 *
 * For more information about how angular directives work, and how to create your own directives,
 * see {@link guide/dev_guide.compiler.directives Understanding Angular Directives} in the angular
 * Developer Guide.
 */

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:init
 *
 * @description
 * The `ng:init` attribute specifies initialization tasks to be executed
 *  before the template enters execution mode during bootstrap.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval.
 *
 * @example
   <doc:example>
     <doc:source>
    <div ng:init="greeting='Hello'; person='World'">
      {{greeting}} {{person}}!
    </div>
     </doc:source>
     <doc:scenario>
       it('should check greeting', function(){
         expect(binding('greeting')).toBe('Hello');
         expect(binding('person')).toBe('World');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:init", function(expression){
  return function(element){
    this.$tryEval(expression, element);
  };
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:controller
 *
 * @description
 * The `ng:controller` directive assigns behavior to a scope. This is a key aspect of how angular
 * supports the principles behind the Model-View-Controller design pattern.
 *
 * MVC components in angular:
 *
 * * Model — The Model is data in scope properties; scopes are attached to the DOM.
 * * View — The template (HTML with data bindings) is rendered into the View.
 * * Controller — The `ng:controller` directive specifies a Controller class; the class has
 *   methods that typically express the business logic behind the application.
 *
 * Note that an alternative way to define controllers is via the `{@link angular.service.$route}`
 * service.
 *
 * @element ANY
 * @param {expression} expression Name of a globally accessible constructor function or an
 *     {@link guide/dev_guide.expressions expression} that on the current scope evaluates to a
 *     constructor function.
 *
 * @example
 * Here is a simple form for editing user contact information. Adding, removing, clearing, and
 * greeting are methods declared on the controller (see source tab). These methods can
 * easily be called from the angular markup. Notice that the scope becomes the `this` for the
 * controller's instance. This allows for easy access to the view data from the controller. Also
 * notice that any changes to the data are automatically reflected in the View without the need
 * for a manual update.
   <doc:example>
     <doc:source>
      <script type="text/javascript">
        function SettingsController() {
          this.name = "John Smith";
          this.contacts = [
            {type:'phone', value:'408 555 1212'},
            {type:'email', value:'john.smith@example.org'} ];
        }
        SettingsController.prototype = {
         greet: function(){
           alert(this.name);
         },
         addContact: function(){
           this.contacts.push({type:'email', value:'yourname@example.org'});
         },
         removeContact: function(contactToRemove) {
           angular.Array.remove(this.contacts, contactToRemove);
         },
         clearContact: function(contact) {
           contact.type = 'phone';
           contact.value = '';
         }
        };
      </script>
      <div ng:controller="SettingsController">
        Name: <input type="text" name="name"/>
        [ <a href="" ng:click="greet()">greet</a> ]<br/>
        Contact:
        <ul>
          <li ng:repeat="contact in contacts">
            <select name="contact.type">
               <option>phone</option>
               <option>email</option>
            </select>
            <input type="text" name="contact.value"/>
            [ <a href="" ng:click="clearContact(contact)">clear</a>
            | <a href="" ng:click="removeContact(contact)">X</a> ]
          </li>
          <li>[ <a href="" ng:click="addContact()">add</a> ]</li>
       </ul>
      </div>
     </doc:source>
     <doc:scenario>
       it('should check controller', function(){
         expect(element('.doc-example-live div>:input').val()).toBe('John Smith');
         expect(element('.doc-example-live li[ng\\:repeat-index="0"] input').val()).toBe('408 555 1212');
         expect(element('.doc-example-live li[ng\\:repeat-index="1"] input').val()).toBe('john.smith@example.org');
         element('.doc-example-live li:first a:contains("clear")').click();
         expect(element('.doc-example-live li:first input').val()).toBe('');
         element('.doc-example-live li:last a:contains("add")').click();
         expect(element('.doc-example-live li[ng\\:repeat-index="2"] input').val()).toBe('yourname@example.org');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:controller", function(expression){
  this.scope(true);
  return function(element){
    var controller = getter(window, expression, true) || getter(this, expression, true);
    if (!controller)
      throw "Can not find '"+expression+"' controller.";
    if (!isFunction(controller))
      throw "Reference '"+expression+"' is not a class.";
    this.$become(controller);
  };
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:eval
 *
 * @description
 * The `ng:eval` allows you to execute a binding which has side effects
 * without displaying the result to the user.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval.
 *
 * @example
 * Notice that `{{` `obj.multiplied = obj.a * obj.b` `}}` has a side effect of assigning
 * a value to `obj.multiplied` and displaying the result to the user. Sometimes,
 * however, it is desirable to execute a side effect without showing the value to
 * the user. In such a case `ng:eval` allows you to execute code without updating
 * the display.
   <doc:example>
     <doc:source>
       <input name="obj.a" value="6" >
         * <input name="obj.b" value="2">
         = {{obj.multiplied = obj.a * obj.b}} <br>
       <span ng:eval="obj.divide = obj.a / obj.b"></span>
       <span ng:eval="obj.updateCount = 1 + (obj.updateCount||0)">
       </span>
       <tt>obj.divide = {{obj.divide}}</tt><br>
       <tt>obj.updateCount = {{obj.updateCount}}</tt>
     </doc:source>
     <doc:scenario>
       it('should check eval', function(){
         expect(binding('obj.divide')).toBe('3');
         expect(binding('obj.updateCount')).toBe('2');
         input('obj.a').enter('12');
         expect(binding('obj.divide')).toBe('6');
         expect(binding('obj.updateCount')).toBe('3');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:eval", function(expression){
  return function(element){
    this.$onEval(expression, element);
  };
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:bind
 *
 * @description
 * The `ng:bind` attribute asks angular to replace the text content of this
 * HTML element with the value of the given expression, and to keep the text
 * content up to date when the expression's value changes. Usually you would
 * just write `{{ expression }}` and let angular compile it into
 * `<span ng:bind="expression"></span>` at bootstrap time.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval.
 *
 * @example
 * You can try it right here: enter text in the text box and watch the greeting change.
   <doc:example>
     <doc:source>
       Enter name: <input type="text" name="name" value="Whirled"> <br>
       Hello <span ng:bind="name" />!
     </doc:source>
     <doc:scenario>
       it('should check ng:bind', function(){
         expect(using('.doc-example-live').binding('name')).toBe('Whirled');
         using('.doc-example-live').input('name').enter('world');
         expect(using('.doc-example-live').binding('name')).toBe('world');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:bind", function(expression, element){
  element.addClass('ng-binding');
  return function(element) {
    var lastValue = noop, lastError = noop;
    this.$onEval(function() {
      var error, value, html, isHtml, isDomElement,
          oldElement = this.hasOwnProperty($$element) ? this.$element : undefined;
      this.$element = element;
      value = this.$tryEval(expression, function(e){
        error = formatError(e);
      });
      this.$element = oldElement;
      // If we are HTML then save the raw HTML data so that we don't
      // recompute sanitization since it is expensive.
      // TODO: turn this into a more generic way to compute this
      if (isHtml = (value instanceof HTML))
        value = (html = value).html;
      if (lastValue === value && lastError == error) return;
      isDomElement = isElement(value);
      if (!isHtml && !isDomElement && isObject(value)) {
        value = toJson(value, true);
      }
      if (value != lastValue || error != lastError) {
        lastValue = value;
        lastError = error;
        elementError(element, NG_EXCEPTION, error);
        if (error) value = error;
        if (isHtml) {
          element.html(html.get());
        } else if (isDomElement) {
          element.html('');
          element.append(value);
        } else {
          element.text(value == undefined ? '' : value);
        }
      }
    }, element);
  };
});

var bindTemplateCache = {};
function compileBindTemplate(template){
  var fn = bindTemplateCache[template];
  if (!fn) {
    var bindings = [];
    forEach(parseBindings(template), function(text){
      var exp = binding(text);
      bindings.push(exp
        ? function(element){
            var error, value = this.$tryEval(exp, function(e){
              error = toJson(e);
            });
            elementError(element, NG_EXCEPTION, error);
            return error ? error : value;
          }
        : function() {
            return text;
          });
    });
    bindTemplateCache[template] = fn = function(element, prettyPrintJson){
      var parts = [], self = this,
         oldElement = this.hasOwnProperty($$element) ? self.$element : undefined;
      self.$element = element;
      for ( var i = 0; i < bindings.length; i++) {
        var value = bindings[i].call(self, element);
        if (isElement(value))
          value = '';
        else if (isObject(value))
          value = toJson(value, prettyPrintJson);
        parts.push(value);
      }
      self.$element = oldElement;
      return parts.join('');
    };
  }
  return fn;
}

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:bind-template
 *
 * @description
 * The `ng:bind-template` attribute specifies that the element
 * text should be replaced with the template in ng:bind-template.
 * Unlike ng:bind the ng:bind-template can contain multiple `{{` `}}`
 * expressions. (This is required since some HTML elements
 * can not have SPAN elements such as TITLE, or OPTION to name a few.)
 *
 * @element ANY
 * @param {string} template of form
 *   <tt>{{</tt> <tt>expression</tt> <tt>}}</tt> to eval.
 *
 * @example
 * Try it here: enter text in text box and watch the greeting change.
   <doc:example>
     <doc:source>
      Salutation: <input type="text" name="salutation" value="Hello"><br/>
      Name: <input type="text" name="name" value="World"><br/>
      <pre ng:bind-template="{{salutation}} {{name}}!"></pre>
     </doc:source>
     <doc:scenario>
       it('should check ng:bind', function(){
         expect(using('.doc-example-live').binding('{{salutation}} {{name}}')).
           toBe('Hello World!');
         using('.doc-example-live').input('salutation').enter('Greetings');
         using('.doc-example-live').input('name').enter('user');
         expect(using('.doc-example-live').binding('{{salutation}} {{name}}')).
           toBe('Greetings user!');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:bind-template", function(expression, element){
  element.addClass('ng-binding');
  var templateFn = compileBindTemplate(expression);
  return function(element) {
    var lastValue;
    this.$onEval(function() {
      var value = templateFn.call(this, element, true);
      if (value != lastValue) {
        element.text(value);
        lastValue = value;
      }
    }, element);
  };
});

var REMOVE_ATTRIBUTES = {
  'disabled':'disabled',
  'readonly':'readOnly',
  'checked':'checked',
  'selected':'selected',
  'multiple':'multiple'
};
/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:bind-attr
 *
 * @description
 * The `ng:bind-attr` attribute specifies that
 * {@link guide/dev_guide.templates.databinding databindings}  should be created between element
 * attributes and given expressions. Unlike `ng:bind` the `ng:bind-attr` contains a JSON key value
 * pairs representing which attributes need to be mapped to which
 * {@link guide/dev_guide.expressions expressions}.
 *
 * You don't usually write the `ng:bind-attr` in the HTML since embedding
 * <tt ng:non-bindable>{{expression}}</tt> into the attribute directly as the attribute value is
 * preferred. The attributes get translated into `<span ng:bind-attr="{attr:expression}"/>` at
 * compile time.
 *
 * This HTML snippet is preferred way of working with `ng:bind-attr`
 * <pre>
 *   <a href="http://www.google.com/search?q={{query}}">Google</a>
 * </pre>
 *
 * The above gets translated to bellow during bootstrap time.
 * <pre>
 *   <a ng:bind-attr='{"href":"http://www.google.com/search?q={{query}}"}'>Google</a>
 * </pre>
 *
 * @element ANY
 * @param {string} attribute_json a JSON key-value pairs representing
 *    the attributes to replace. Each key matches the attribute
 *    which needs to be replaced. Each value is a text template of
 *    the attribute with embedded
 *    <tt ng:non-bindable>{{expression}}</tt>s. Any number of
 *    key-value pairs can be specified.
 *
 * @example
 * Try it here: enter text in text box and click Google.
   <doc:example>
     <doc:source>
      Google for:
      <input type="text" name="query" value="AngularJS"/>
      <a href="http://www.google.com/search?q={{query}}">Google</a>
     </doc:source>
     <doc:scenario>
       it('should check ng:bind-attr', function(){
         expect(using('.doc-example-live').element('a').attr('href')).
           toBe('http://www.google.com/search?q=AngularJS');
         using('.doc-example-live').input('query').enter('google');
         expect(using('.doc-example-live').element('a').attr('href')).
           toBe('http://www.google.com/search?q=google');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:bind-attr", function(expression){
  return function(element){
    var lastValue = {};
    this.$onEval(function(){
      var values = this.$eval(expression);
      for(var key in values) {
        var value = compileBindTemplate(values[key]).call(this, element),
            specialName = REMOVE_ATTRIBUTES[lowercase(key)];
        if (lastValue[key] !== value) {
          lastValue[key] = value;
          if (specialName) {
            if (toBoolean(value)) {
              element.attr(specialName, specialName);
              element.attr('ng-' + specialName, value);
            } else {
              element.removeAttr(specialName);
              element.removeAttr('ng-' + specialName);
            }
            (element.data($$validate)||noop)();
          } else {
            element.attr(key, value);
          }
        }
      }
    }, element);
  };
});


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:click
 *
 * @description
 * The ng:click allows you to specify custom behavior when
 * element is clicked.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval upon click.
 *
 * @example
   <doc:example>
     <doc:source>
      <button ng:click="count = count + 1" ng:init="count=0">
        Increment
      </button>
      count: {{count}}
     </doc:source>
     <doc:scenario>
       it('should check ng:click', function(){
         expect(binding('count')).toBe('0');
         element('.doc-example-live :button').click();
         expect(binding('count')).toBe('1');
       });
     </doc:scenario>
   </doc:example>
 */
/*
 * A directive that allows creation of custom onclick handlers that are defined as angular
 * expressions and are compiled and executed within the current scope.
 *
 * Events that are handled via these handler are always configured not to propagate further.
 *
 * TODO: maybe we should consider allowing users to control event propagation in the future.
 */
angularDirective("ng:click", function(expression, element){
  return annotate('$updateView', function($updateView, element){
    var self = this;
    element.bind('click', function(event){
      self.$tryEval(expression, element);
      $updateView();
      event.stopPropagation();
    });
  });
});


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:submit
 *
 * @description
 * Enables binding angular expressions to onsubmit events.
 *
 * Additionally it prevents the default action (which for form means sending the request to the
 * server and reloading the current page).
 *
 * @element form
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval.
 *
 * @example
   <doc:example>
     <doc:source>
      <form ng:submit="list.push(text);text='';" ng:init="list=[]">
        Enter text and hit enter:
        <input type="text" name="text" value="hello"/>
        <input type="submit" id="submit" value="Submit" />
      </form>
      <pre>list={{list}}</pre>
     </doc:source>
     <doc:scenario>
       it('should check ng:submit', function(){
         expect(binding('list')).toBe('list=[]');
         element('.doc-example-live #submit').click();
         expect(binding('list')).toBe('list=["hello"]');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:submit", function(expression, element) {
  return annotate('$updateView', function($updateView, element) {
    var self = this;
    element.bind('submit', function(event) {
      self.$tryEval(expression, element);
      $updateView();
      event.preventDefault();
    });
  });
});


function ngClass(selector) {
  return function(expression, element){
    var existing = element[0].className + ' ';
    return function(element){
      this.$onEval(function(){
        var scope = this;

        if (selector(scope.$index)) {
          var ngClassVal = scope.$eval(element.attr('ng:class') || '');
          if (isArray(ngClassVal)) ngClassVal = ngClassVal.join(' ');
          var value = scope.$eval(expression);
          if (isArray(value)) value = value.join(' ');
          if (ngClassVal && ngClassVal !== value) value = value + ' ' + ngClassVal;
          element[0].className = trim(existing + value);
        }
      }, element);
    };
  };
}

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:class
 *
 * @description
 * The `ng:class` allows you to set CSS class on HTML element
 * conditionally.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval.
 *
 * @example
   <doc:example>
     <doc:source>
      <input type="button" value="set" ng:click="myVar='ng-input-indicator-wait'">
      <input type="button" value="clear" ng:click="myVar=''">
      <br>
      <span ng:class="myVar">Sample Text &nbsp;&nbsp;&nbsp;&nbsp;</span>
     </doc:source>
     <doc:scenario>
       it('should check ng:class', function(){
         expect(element('.doc-example-live span').attr('className')).not().
           toMatch(/ng-input-indicator-wait/);

         using('.doc-example-live').element(':button:first').click();

         expect(element('.doc-example-live span').attr('className')).
           toMatch(/ng-input-indicator-wait/);

         using('.doc-example-live').element(':button:last').click();

         expect(element('.doc-example-live span').attr('className')).not().
           toMatch(/ng-input-indicator-wait/);
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:class", ngClass(function(){return true;}));

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:class-odd
 *
 * @description
 * The `ng:class-odd` and `ng:class-even` works exactly as
 * `ng:class`, except it works in conjunction with `ng:repeat`
 * and takes affect only on odd (even) rows.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval. Must be
 *  inside `ng:repeat`.
 *
 * @example
   <doc:example>
     <doc:source>
        <ol ng:init="names=['John', 'Mary', 'Cate', 'Suz']">
          <li ng:repeat="name in names">
           <span ng:class-odd="'ng-format-negative'"
                 ng:class-even="'ng-input-indicator-wait'">
             {{name}} &nbsp; &nbsp; &nbsp;
           </span>
          </li>
        </ol>
     </doc:source>
     <doc:scenario>
       it('should check ng:class-odd and ng:class-even', function(){
         expect(element('.doc-example-live li:first span').attr('className')).
           toMatch(/ng-format-negative/);
         expect(element('.doc-example-live li:last span').attr('className')).
           toMatch(/ng-input-indicator-wait/);
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:class-odd", ngClass(function(i){return i % 2 === 0;}));

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:class-even
 *
 * @description
 * The `ng:class-odd` and `ng:class-even` works exactly as
 * `ng:class`, except it works in conjunction with `ng:repeat`
 * and takes affect only on odd (even) rows.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} to eval. Must be
 *  inside `ng:repeat`.
 *
 * @example
   <doc:example>
     <doc:source>
        <ol ng:init="names=['John', 'Mary', 'Cate', 'Suz']">
          <li ng:repeat="name in names">
           <span ng:class-odd="'ng-format-negative'"
                 ng:class-even="'ng-input-indicator-wait'">
             {{name}} &nbsp; &nbsp; &nbsp;
           </span>
          </li>
        </ol>
     </doc:source>
     <doc:scenario>
       it('should check ng:class-odd and ng:class-even', function(){
         expect(element('.doc-example-live li:first span').attr('className')).
           toMatch(/ng-format-negative/);
         expect(element('.doc-example-live li:last span').attr('className')).
           toMatch(/ng-input-indicator-wait/);
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:class-even", ngClass(function(i){return i % 2 === 1;}));

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:show
 *
 * @description
 * The `ng:show` and `ng:hide` directives show or hide a portion of the DOM tree (HTML)
 * conditionally.
 *
 * @element ANY
 * @param {expression} expression If the {@link guide/dev_guide.expressions expression} is truthy
 *     then the element is shown or hidden respectively.
 *
 * @example
   <doc:example>
     <doc:source>
        Click me: <input type="checkbox" name="checked"><br/>
        Show: <span ng:show="checked">I show up when your checkbox is checked.</span> <br/>
        Hide: <span ng:hide="checked">I hide when your checkbox is checked.</span>
     </doc:source>
     <doc:scenario>
       it('should check ng:show / ng:hide', function(){
         expect(element('.doc-example-live span:first:hidden').count()).toEqual(1);
         expect(element('.doc-example-live span:last:visible').count()).toEqual(1);

         input('checked').check();

         expect(element('.doc-example-live span:first:visible').count()).toEqual(1);
         expect(element('.doc-example-live span:last:hidden').count()).toEqual(1);
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:show", function(expression, element){
  return function(element){
    this.$onEval(function(){
      element.css('display', toBoolean(this.$eval(expression)) ? '' : 'none');
    }, element);
  };
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:hide
 *
 * @description
 * The `ng:hide` and `ng:show` directives hide or show a portion
 * of the HTML conditionally.
 *
 * @element ANY
 * @param {expression} expression If the {@link guide/dev_guide.expressions expression} truthy then
 *     the element is shown or hidden respectively.
 *
 * @example
   <doc:example>
     <doc:source>
        Click me: <input type="checkbox" name="checked"><br/>
        Show: <span ng:show="checked">I show up when you checkbox is checked?</span> <br/>
        Hide: <span ng:hide="checked">I hide when you checkbox is checked?</span>
     </doc:source>
     <doc:scenario>
       it('should check ng:show / ng:hide', function(){
         expect(element('.doc-example-live span:first:hidden').count()).toEqual(1);
         expect(element('.doc-example-live span:last:visible').count()).toEqual(1);

         input('checked').check();

         expect(element('.doc-example-live span:first:visible').count()).toEqual(1);
         expect(element('.doc-example-live span:last:hidden').count()).toEqual(1);
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:hide", function(expression, element){
  return function(element){
    this.$onEval(function(){
      element.css('display', toBoolean(this.$eval(expression)) ? 'none' : '');
    }, element);
  };
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:style
 *
 * @description
 * The ng:style allows you to set CSS style on an HTML element conditionally.
 *
 * @element ANY
 * @param {expression} expression {@link guide/dev_guide.expressions Expression} which evals to an
 *      object whose keys are CSS style names and values are corresponding values for those CSS
 *      keys.
 *
 * @example
   <doc:example>
     <doc:source>
        <input type="button" value="set" ng:click="myStyle={color:'red'}">
        <input type="button" value="clear" ng:click="myStyle={}">
        <br/>
        <span ng:style="myStyle">Sample Text</span>
        <pre>myStyle={{myStyle}}</pre>
     </doc:source>
     <doc:scenario>
       it('should check ng:style', function(){
         expect(element('.doc-example-live span').css('color')).toBe('rgb(0, 0, 0)');
         element('.doc-example-live :button[value=set]').click();
         expect(element('.doc-example-live span').css('color')).toBe('red');
         element('.doc-example-live :button[value=clear]').click();
         expect(element('.doc-example-live span').css('color')).toBe('rgb(0, 0, 0)');
       });
     </doc:scenario>
   </doc:example>
 */
angularDirective("ng:style", function(expression, element){
  return function(element){
    var resetStyle = getStyle(element);
    this.$onEval(function(){
      var style = this.$eval(expression) || {}, key, mergedStyle = {};
      for(key in style) {
        if (resetStyle[key] === undefined) resetStyle[key] = '';
        mergedStyle[key] = style[key];
      }
      for(key in resetStyle) {
        mergedStyle[key] = mergedStyle[key] || resetStyle[key];
      }
      element.css(mergedStyle);
    }, element);
  };
});

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.markup
 * @description
 *
 * Angular markup transforms content of DOM elements or portions of this content into other text or
 * DOM elements for further compilation.
 *
 * Markup extensions do not themselves produce linking functions. Think of markup as a way to
 * produce shorthand for a {@link angular.widget widget} or a {@link angular.directive directive}.
 *
 * The most prominent example of a markup in angular is the built-in double curly markup
 * `{{expression}}`, which is shorthand for `<span ng:bind="expression"></span>`.
 *
 * Create custom markup like this:
 *
 * <pre>
 *   angular.markup('newMarkup', function(text, textNode, parentElement){
 *     //tranformation code
 *   });
 * </pre>
 *
 * For more information about angular markup, see {@link guide/dev_guide.compiler.markup
 * Understanding Angular Markup} in the angular Developer Guide.
 */

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.attrMarkup
 * @description
 *
 * Attribute markup extends the angular compiler in a very similar way as {@link angular.markup}
 * except that it allows you to modify the state of the attribute text rather than the content of a
 * node.
 *
 * Create custom attribute markup like this:
 *
 * <pre>
 *   angular.attrMarkup('newAttrMarkup', function(attrValue, attrName, element){
 *     //tranformation code
 *   });
 * </pre>
 *
 * For more information about angular attribute markup, see {@link guide/dev_guide.compiler.markup
 * Understanding Angular Markup} in the angular Developer Guide.
 */

function parseBindings(string) {
  var results = [];
  var lastIndex = 0;
  var index;
  while((index = string.indexOf('{{', lastIndex)) > -1) {
    if (lastIndex < index)
      results.push(string.substr(lastIndex, index - lastIndex));
    lastIndex = index;

    index = string.indexOf('}}', index);
    index = index < 0 ? string.length : index + 2;

    results.push(string.substr(lastIndex, index - lastIndex));
    lastIndex = index;
  }
  if (lastIndex != string.length)
    results.push(string.substr(lastIndex, string.length - lastIndex));
  return results.length === 0 ? [ string ] : results;
}

function binding(string) {
  var binding = string.replace(/\n/gm, ' ').match(/^\{\{(.*)\}\}$/);
  return binding ? binding[1] : null;
}

function hasBindings(bindings) {
  return bindings.length > 1 || binding(bindings[0]) !== null;
}

angularTextMarkup('{{}}', function(text, textNode, parentElement) {
  var bindings = parseBindings(text),
      self = this;
  if (hasBindings(bindings)) {
    if (isLeafNode(parentElement[0])) {
      parentElement.attr('ng:bind-template', text);
    } else {
      var cursor = textNode, newElement;
      forEach(parseBindings(text), function(text){
        var exp = binding(text);
        if (exp) {
          newElement = jqLite('<span>');
          newElement.attr('ng:bind', exp);
        } else {
          newElement = jqLite(document.createTextNode(text));
        }
        if (msie && text.charAt(0) == ' ') {
          newElement = jqLite('<span>&nbsp;</span>');
          var nbsp = newElement.html();
          newElement.text(text.substr(1));
          newElement.html(nbsp + newElement.html());
        }
        cursor.after(newElement);
        cursor = newElement;
      });
      textNode.remove();
    }
  }
});

/**
 * This tries to normalize the behavior of value attribute across browsers. If value attribute is
 * not specified, then specify it to be that of the text.
 */
angularTextMarkup('option', function(text, textNode, parentElement){
  if (lowercase(nodeName_(parentElement)) == 'option') {
    if (msie <= 7) {
      // In IE7 The issue is that there is no way to see if the value was specified hence
      // we have to resort to parsing HTML;
      htmlParser(parentElement[0].outerHTML, {
        start: function(tag, attrs) {
          if (isUndefined(attrs.value)) {
            parentElement.attr('value', text);
          }
        }
      });
    } else if (parentElement[0].getAttribute('value') == null) {
      // jQuery does normalization on 'value' so we have to bypass it.
      parentElement.attr('value', text);
    }
  }
});

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:href
 *
 * @description
 * Using <angular/> markup like {{hash}} in an href attribute makes
 * the page open to a wrong URL, if the user clicks that link before
 * angular has a chance to replace the {{hash}} with actual URL, the
 * link will be broken and will most likely return a 404 error.
 * The `ng:href` solves this problem by placing the `href` in the
 * `ng:` namespace.
 *
 * The buggy way to write it:
 * <pre>
 * <a href="http://www.gravatar.com/avatar/{{hash}}"/>
 * </pre>
 *
 * The correct way to write it:
 * <pre>
 * <a ng:href="http://www.gravatar.com/avatar/{{hash}}"/>
 * </pre>
 *
 * @element ANY
 * @param {template} template any string which can contain `{{}}` markup.
 *
 * @example
 * This example uses `link` variable inside `href` attribute:
    <doc:example>
      <doc:source>
        <input name="value" /><br />
        <a id="link-1" href ng:click="value = 1">link 1</a> (link, don't reload)<br />
        <a id="link-2" href="" ng:click="value = 2">link 2</a> (link, don't reload)<br />
        <a id="link-3" ng:href="#{{'123'}}" ng:click="value = 3">link 3</a> (link, reload!)<br />
        <a id="link-4" href="" name="xx" ng:click="value = 4">anchor</a> (link, don't reload)<br />
        <a id="link-5" name="xxx" ng:click="value = 5">anchor</a> (no link)<br />
        <a id="link-6" ng:href="#/{{value}}">link</a> (link, change hash)
      </doc:source>
      <doc:scenario>
        it('should execute ng:click but not reload when href without value', function() {
          element('#link-1').click();
          expect(input('value').val()).toEqual('1');
          expect(element('#link-1').attr('href')).toBe("");
        });

        it('should execute ng:click but not reload when href empty string', function() {
          element('#link-2').click();
          expect(input('value').val()).toEqual('2');
          expect(element('#link-2').attr('href')).toBe("");
        });

        it('should execute ng:click and change url when ng:href specified', function() {
          element('#link-3').click();
          expect(input('value').val()).toEqual('3');
          expect(element('#link-3').attr('href')).toBe("#123");
          expect(browser().location().hash()).toEqual('123');
        });

        it('should execute ng:click but not reload when href empty string and name specified', function() {
          element('#link-4').click();
          expect(input('value').val()).toEqual('4');
          expect(element('#link-4').attr('href')).toBe("");
        });

        it('should execute ng:click but not reload when no href but name specified', function() {
          element('#link-5').click();
          expect(input('value').val()).toEqual('5');
          expect(element('#link-5').attr('href')).toBe(undefined);
        });

        it('should only change url when only ng:href', function() {
          input('value').enter('6');
          element('#link-6').click();
          expect(browser().location().hash()).toEqual('/6');
          expect(element('#link-6').attr('href')).toBe("#/6");
        });
      </doc:scenario>
    </doc:example>
 */

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:src
 *
 * @description
 * Using <angular/> markup like `{{hash}}` in a `src` attribute doesn't
 * work right: The browser will fetch from the URL with the literal
 * text `{{hash}}` until <angular/> replaces the expression inside
 * `{{hash}}`. The `ng:src` attribute solves this problem by placing
 *  the `src` attribute in the `ng:` namespace.
 *
 * The buggy way to write it:
 * <pre>
 * <img src="http://www.gravatar.com/avatar/{{hash}}"/>
 * </pre>
 *
 * The correct way to write it:
 * <pre>
 * <img ng:src="http://www.gravatar.com/avatar/{{hash}}"/>
 * </pre>
 *
 * @element ANY
 * @param {template} template any string which can contain `{{}}` markup.
 */

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:disabled
 *
 * @description
 *
 * The following markup will make the button enabled on Chrome/Firefox but not on IE8 and older IEs:
 * <pre>
 * <div ng:init="scope = { isDisabled: false }">
 *  <button disabled="{{scope.isDisabled}}">Disabled</button>
 * </div>
 * </pre>
 *
 * The HTML specs do not require browsers to preserve the special attributes such as disabled.
 * (The presence of them means true and absence means false)
 * This prevents the angular compiler from correctly retrieving the binding expression.
 * To solve this problem, we introduce ng:disabled.
 *
 * @example
    <doc:example>
      <doc:source>
        Click me to toggle: <input type="checkbox" name="checked"><br/>
        <button name="button" ng:disabled="{{checked}}">Button</button>
      </doc:source>
      <doc:scenario>
        it('should toggle button', function() {
          expect(element('.doc-example-live :button').attr('disabled')).toBeFalsy();
          input('checked').check();
          expect(element('.doc-example-live :button').attr('disabled')).toBeTruthy();
        });
      </doc:scenario>
    </doc:example>
 *
 * @element ANY
 * @param {template} template any string which can contain '{{}}' markup.
 */


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:checked
 *
 * @description
 * The HTML specs do not require browsers to preserve the special attributes such as checked.
 * (The presence of them means true and absence means false)
 * This prevents the angular compiler from correctly retrieving the binding expression.
 * To solve this problem, we introduce ng:checked.
 * @example
    <doc:example>
      <doc:source>
        Check me to check both: <input type="checkbox" name="master"><br/>
        <input id="checkSlave" type="checkbox" ng:checked="{{master}}">
      </doc:source>
      <doc:scenario>
        it('should check both checkBoxes', function() {
          expect(element('.doc-example-live #checkSlave').attr('checked')).toBeFalsy();
          input('master').check();
          expect(element('.doc-example-live #checkSlave').attr('checked')).toBeTruthy();
        });
      </doc:scenario>
    </doc:example>
 *
 * @element ANY
 * @param {template} template any string which can contain '{{}}' markup.
 */


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:multiple
 *
 * @description
 * The HTML specs do not require browsers to preserve the special attributes such as multiple.
 * (The presence of them means true and absence means false)
 * This prevents the angular compiler from correctly retrieving the binding expression.
 * To solve this problem, we introduce ng:multiple.
 *
 * @example
     <doc:example>
       <doc:source>
         Check me check multiple: <input type="checkbox" name="checked"><br/>
         <select id="select" ng:multiple="{{checked}}">
           <option>Misko</option>
           <option>Igor</option>
           <option>Vojta</option>
           <option>Di</option>
         </select>
       </doc:source>
       <doc:scenario>
         it('should toggle multiple', function() {
           expect(element('.doc-example-live #select').attr('multiple')).toBeFalsy();
           input('checked').check();
           expect(element('.doc-example-live #select').attr('multiple')).toBeTruthy();
         });
       </doc:scenario>
     </doc:example>
 *
 * @element ANY
 * @param {template} template any string which can contain '{{}}' markup.
 */


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:readonly
 *
 * @description
 * The HTML specs do not require browsers to preserve the special attributes such as readonly.
 * (The presence of them means true and absence means false)
 * This prevents the angular compiler from correctly retrieving the binding expression.
 * To solve this problem, we introduce ng:readonly.
 * @example
    <doc:example>
      <doc:source>
        Check me to make text readonly: <input type="checkbox" name="checked"><br/>
        <input type="text" ng:readonly="{{checked}}" value="I'm Angular"/>
      </doc:source>
      <doc:scenario>
        it('should toggle readonly attr', function() {
          expect(element('.doc-example-live :text').attr('readonly')).toBeFalsy();
          input('checked').check();
          expect(element('.doc-example-live :text').attr('readonly')).toBeTruthy();
        });
      </doc:scenario>
    </doc:example>
 *
 * @element ANY
 * @param {template} template any string which can contain '{{}}' markup.
 */


/**
* @workInProgress
* @ngdoc directive
* @name angular.directive.ng:selected
*
* @description
* The HTML specs do not require browsers to preserve the special attributes such as selected.
* (The presence of them means true and absence means false)
* This prevents the angular compiler from correctly retrieving the binding expression.
* To solve this problem, we introduce ng:selected.
* @example
   <doc:example>
     <doc:source>
       Check me to select: <input type="checkbox" name="checked"><br/>
       <select>
         <option>Hello!</option>
         <option id="greet" ng:selected="{{checked}}">Greetings!</option>
       </select>
     </doc:source>
     <doc:scenario>
       it('should select Greetings!', function() {
         expect(element('.doc-example-live #greet').attr('selected')).toBeFalsy();
         input('checked').check();
         expect(element('.doc-example-live #greet').attr('selected')).toBeTruthy();
       });
     </doc:scenario>
   </doc:example>
* @element ANY
* @param {template} template any string which can contain '{{}}' markup.
*/


var NG_BIND_ATTR = 'ng:bind-attr';
var SPECIAL_ATTRS = {};

forEach('src,href,checked,disabled,multiple,readonly,selected'.split(','), function(name) {
  SPECIAL_ATTRS['ng:' + name] = name;
});

angularAttrMarkup('{{}}', function(value, name, element){
  // don't process existing attribute markup
  if (angularDirective(name) || angularDirective("@" + name)) return;
  if (msie && name == 'src')
    value = decodeURI(value);
  var bindings = parseBindings(value),
      bindAttr;
  if (hasBindings(bindings)) {
    element.removeAttr(name);
    bindAttr = fromJson(element.attr(NG_BIND_ATTR) || "{}");
    bindAttr[SPECIAL_ATTRS[name] || name] = value;
    element.attr(NG_BIND_ATTR, toJson(bindAttr));
  }
});

/**
 * @workInProgress
 * @ngdoc overview
 * @name angular.widget
 * @description
 *
 * An angular widget can be either a custom attribute that modifies an existing DOM element or an
 * entirely new DOM element.
 *
 * During html compilation, widgets are processed after {@link angular.markup markup}, but before
 * {@link angular.directive directives}.
 *
 * Following is the list of built-in angular widgets:
 *
 * * {@link angular.widget.@ng:format ng:format} - Formats data for display to user and for storage.
 * * {@link angular.widget.@ng:non-bindable ng:non-bindable} - Blocks angular from processing an
 *   HTML element.
 * * {@link angular.widget.@ng:repeat ng:repeat} - Creates and manages a collection of cloned HTML
 *   elements.
 * * {@link angular.widget.@ng:required ng:required} - Verifies presence of user input.
 * * {@link angular.widget.@ng:validate ng:validate} - Validates content of user input.
 * * {@link angular.widget.HTML HTML input elements} - Standard HTML input elements data-bound by
 *   angular.
 * * {@link angular.widget.ng:view ng:view} - Works with $route to "include" partial templates
 * * {@link angular.widget.ng:switch ng:switch} - Conditionally changes DOM structure
 * * {@link angular.widget.ng:include ng:include} - Includes an external HTML fragment
 *
 * For more information about angular widgets, see {@link guide/dev_guide.compiler.widgets
 * Understanding Angular Widgets} in the angular Developer Guide.
 */

/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.HTML
 *
 * @description
 * The most common widgets you will use will be in the form of the
 * standard HTML set. These widgets are bound using the `name` attribute
 * to an expression. In addition, they can have `ng:validate`, `ng:required`,
 * `ng:format`, `ng:change` attribute to further control their behavior.
 *
 * @usageContent
 *   see example below for usage
 *
 *   <input type="text|checkbox|..." ... />
 *   <textarea ... />
 *   <select ...>
 *     <option>...</option>
 *   </select>
 *
 * @example
    <doc:example>
      <doc:source>
        <table style="font-size:.9em;">
          <tr>
            <th>Name</th>
            <th>Format</th>
            <th>HTML</th>
            <th>UI</th>
            <th ng:non-bindable>{{input#}}</th>
          </tr>
          <tr>
            <th>text</th>
            <td>String</td>
            <td><tt>&lt;input type="text" name="input1"&gt;</tt></td>
            <td><input type="text" name="input1" size="4"></td>
            <td><tt>{{input1|json}}</tt></td>
          </tr>
          <tr>
            <th>textarea</th>
            <td>String</td>
            <td><tt>&lt;textarea name="input2"&gt;&lt;/textarea&gt;</tt></td>
            <td><textarea name="input2" cols='6'></textarea></td>
            <td><tt>{{input2|json}}</tt></td>
          </tr>
          <tr>
            <th>radio</th>
            <td>String</td>
            <td><tt>
              &lt;input type="radio" name="input3" value="A"&gt;<br>
              &lt;input type="radio" name="input3" value="B"&gt;
            </tt></td>
            <td>
              <input type="radio" name="input3" value="A">
              <input type="radio" name="input3" value="B">
            </td>
            <td><tt>{{input3|json}}</tt></td>
          </tr>
          <tr>
            <th>checkbox</th>
            <td>Boolean</td>
            <td><tt>&lt;input type="checkbox" name="input4" value="checked"&gt;</tt></td>
            <td><input type="checkbox" name="input4" value="checked"></td>
            <td><tt>{{input4|json}}</tt></td>
          </tr>
          <tr>
            <th>pulldown</th>
            <td>String</td>
            <td><tt>
              &lt;select name="input5"&gt;<br>
              &nbsp;&nbsp;&lt;option value="c"&gt;C&lt;/option&gt;<br>
              &nbsp;&nbsp;&lt;option value="d"&gt;D&lt;/option&gt;<br>
              &lt;/select&gt;<br>
            </tt></td>
            <td>
              <select name="input5">
                <option value="c">C</option>
                <option value="d">D</option>
              </select>
            </td>
            <td><tt>{{input5|json}}</tt></td>
          </tr>
          <tr>
            <th>multiselect</th>
            <td>Array</td>
            <td><tt>
              &lt;select name="input6" multiple size="4"&gt;<br>
              &nbsp;&nbsp;&lt;option value="e"&gt;E&lt;/option&gt;<br>
              &nbsp;&nbsp;&lt;option value="f"&gt;F&lt;/option&gt;<br>
              &lt;/select&gt;<br>
            </tt></td>
            <td>
              <select name="input6" multiple size="4">
                <option value="e">E</option>
                <option value="f">F</option>
              </select>
            </td>
            <td><tt>{{input6|json}}</tt></td>
          </tr>
        </table>
      </doc:source>
      <doc:scenario>

        it('should exercise text', function(){
         input('input1').enter('Carlos');
         expect(binding('input1')).toEqual('"Carlos"');
        });
        it('should exercise textarea', function(){
         input('input2').enter('Carlos');
         expect(binding('input2')).toEqual('"Carlos"');
        });
        it('should exercise radio', function(){
         expect(binding('input3')).toEqual('null');
         input('input3').select('A');
         expect(binding('input3')).toEqual('"A"');
         input('input3').select('B');
         expect(binding('input3')).toEqual('"B"');
        });
        it('should exercise checkbox', function(){
         expect(binding('input4')).toEqual('false');
         input('input4').check();
         expect(binding('input4')).toEqual('true');
        });
        it('should exercise pulldown', function(){
         expect(binding('input5')).toEqual('"c"');
         select('input5').option('d');
         expect(binding('input5')).toEqual('"d"');
        });
        it('should exercise multiselect', function(){
         expect(binding('input6')).toEqual('[]');
         select('input6').options('e');
         expect(binding('input6')).toEqual('["e"]');
         select('input6').options('e', 'f');
         expect(binding('input6')).toEqual('["e","f"]');
        });
      </doc:scenario>
    </doc:example>
 */

function modelAccessor(scope, element) {
  var expr = element.attr('name');
  var exprFn, assignFn;
  if (expr) {
    exprFn = parser(expr).assignable();
    assignFn = exprFn.assign;
    if (!assignFn) throw new Error("Expression '" + expr + "' is not assignable.");
    return {
      get: function() {
        return exprFn(scope);
      },
      set: function(value) {
        if (value !== undefined) {
          return scope.$tryEval(function(){
            assignFn(scope, value);
          }, element);
        }
      }
    };
  }
}

function modelFormattedAccessor(scope, element) {
  var accessor = modelAccessor(scope, element),
      formatterName = element.attr('ng:format') || NOOP,
      formatter = compileFormatter(formatterName);
  if (accessor) {
    return {
      get: function() {
        return formatter.format(scope, accessor.get());
      },
      set: function(value) {
        return accessor.set(formatter.parse(scope, value));
      }
    };
  }
}

function compileValidator(expr) {
  return parser(expr).validator()();
}

function compileFormatter(expr) {
  return parser(expr).formatter()();
}

/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.@ng:validate
 *
 * @description
 * The `ng:validate` attribute widget validates the user input. If the input does not pass
 * validation, the `ng-validation-error` CSS class and the `ng:error` attribute are set on the input
 * element. Check out {@link angular.validator validators} to find out more.
 *
 * @param {string} validator The name of a built-in or custom {@link angular.validator validator} to
 *     to be used.
 *
 * @element INPUT
 * @css ng-validation-error
 *
 * @example
 * This example shows how the input element becomes red when it contains invalid input. Correct
 * the input to make the error disappear.
 *
    <doc:example>
      <doc:source>
        I don't validate:
        <input type="text" name="value" value="NotANumber"><br/>

        I need an integer or nothing:
        <input type="text" name="value" ng:validate="integer"><br/>
      </doc:source>
      <doc:scenario>
         it('should check ng:validate', function(){
           expect(element('.doc-example-live :input:last').attr('className')).
             toMatch(/ng-validation-error/);

           input('value').enter('123');
           expect(element('.doc-example-live :input:last').attr('className')).
             not().toMatch(/ng-validation-error/);
         });
      </doc:scenario>
    </doc:example>
 */
/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.@ng:required
 *
 * @description
 * The `ng:required` attribute widget validates that the user input is present. It is a special case
 * of the {@link angular.widget.@ng:validate ng:validate} attribute widget.
 *
 * @element INPUT
 * @css ng-validation-error
 *
 * @example
 * This example shows how the input element becomes red when it contains invalid input. Correct
 * the input to make the error disappear.
 *
    <doc:example>
      <doc:source>
        I cannot be blank: <input type="text" name="value" ng:required><br/>
      </doc:source>
      <doc:scenario>
       it('should check ng:required', function(){
         expect(element('.doc-example-live :input').attr('className')).toMatch(/ng-validation-error/);
         input('value').enter('123');
         expect(element('.doc-example-live :input').attr('className')).not().toMatch(/ng-validation-error/);
       });
      </doc:scenario>
    </doc:example>
 */
/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.@ng:format
 *
 * @description
 * The `ng:format` attribute widget formats stored data to user-readable text and parses the text
 * back to the stored form. You might find this useful, for example, if you collect user input in a
 * text field but need to store the data in the model as a list. Check out
 * {@link angular.formatter formatters} to learn more.
 *
 * @param {string} formatter The name of the built-in or custom {@link angular.formatter formatter}
 *     to be used.
 *
 * @element INPUT
 *
 * @example
 * This example shows how the user input is converted from a string and internally represented as an
 * array.
 *
    <doc:example>
      <doc:source>
        Enter a comma separated list of items:
        <input type="text" name="list" ng:format="list" value="table, chairs, plate">
        <pre>list={{list}}</pre>
      </doc:source>
      <doc:scenario>
       it('should check ng:format', function(){
         expect(binding('list')).toBe('list=["table","chairs","plate"]');
         input('list').enter(',,, a ,,,');
         expect(binding('list')).toBe('list=["a"]');
       });
      </doc:scenario>
    </doc:example>
 */
function valueAccessor(scope, element) {
  var validatorName = element.attr('ng:validate') || NOOP,
      validator = compileValidator(validatorName),
      requiredExpr = element.attr('ng:required'),
      formatterName = element.attr('ng:format') || NOOP,
      formatter = compileFormatter(formatterName),
      format, parse, lastError, required,
      invalidWidgets = scope.$service('$invalidWidgets') || {markValid:noop, markInvalid:noop};
  if (!validator) throw "Validator named '" + validatorName + "' not found.";
  format = formatter.format;
  parse = formatter.parse;
  if (requiredExpr) {
    scope.$watch(requiredExpr, function(newValue) {
      required = newValue;
      validate();
    });
  } else {
    required = requiredExpr === '';
  }

  element.data($$validate, validate);
  return {
    get: function(){
      if (lastError)
        elementError(element, NG_VALIDATION_ERROR, null);
      try {
        var value = parse(scope, element.val());
        validate();
        return value;
      } catch (e) {
        lastError = e;
        elementError(element, NG_VALIDATION_ERROR, e);
      }
    },
    set: function(value) {
      var oldValue = element.val(),
          newValue = format(scope, value);
      if (oldValue != newValue) {
        element.val(newValue || ''); // needed for ie
      }
      validate();
    }
  };

  function validate() {
    var value = trim(element.val());
    if (element[0].disabled || element[0].readOnly) {
      elementError(element, NG_VALIDATION_ERROR, null);
      invalidWidgets.markValid(element);
    } else {
      var error, validateScope = inherit(scope, {$element:element});
      error = required && !value
              ? 'Required'
              : (value ? validator(validateScope, value) : null);
      elementError(element, NG_VALIDATION_ERROR, error);
      lastError = error;
      if (error) {
        invalidWidgets.markInvalid(element);
      } else {
        invalidWidgets.markValid(element);
      }
    }
  }
}

function checkedAccessor(scope, element) {
  var domElement = element[0], elementValue = domElement.value;
  return {
    get: function(){
      return !!domElement.checked;
    },
    set: function(value){
      domElement.checked = toBoolean(value);
    }
  };
}

function radioAccessor(scope, element) {
  var domElement = element[0];
  return {
    get: function(){
      return domElement.checked ? domElement.value : null;
    },
    set: function(value){
      domElement.checked = value == domElement.value;
    }
  };
}

function optionsAccessor(scope, element) {
  var formatterName = element.attr('ng:format') || NOOP,
      formatter = compileFormatter(formatterName);
  return {
    get: function(){
      var values = [];
      forEach(element[0].options, function(option){
        if (option.selected) values.push(formatter.parse(scope, option.value));
      });
      return values;
    },
    set: function(values){
      var keys = {};
      forEach(values, function(value){
        keys[formatter.format(scope, value)] = true;
      });
      forEach(element[0].options, function(option){
        option.selected = keys[option.value];
      });
    }
  };
}

function noopAccessor() { return { get: noop, set: noop }; }

/*
 * TODO: refactor
 *
 * The table below is not quite right. In some cases the formatter is on the model side
 * and in some cases it is on the view side. This is a historical artifact
 *
 * The concept of model/view accessor is useful for anyone who is trying to develop UI, and
 * so it should be exposed to others. There should be a form object which keeps track of the
 * accessors and also acts as their factory. It should expose it as an object and allow
 * the validator to publish errors to it, so that the the error messages can be bound to it.
 *
 */
var textWidget = inputWidget('keydown change', modelAccessor, valueAccessor, initWidgetValue(), true),
    INPUT_TYPE = {
      'text':            textWidget,
      'textarea':        textWidget,
      'hidden':          textWidget,
      'password':        textWidget,
      'checkbox':        inputWidget('click', modelFormattedAccessor, checkedAccessor, initWidgetValue(false)),
      'radio':           inputWidget('click', modelFormattedAccessor, radioAccessor, radioInit),
      'select-one':      inputWidget('change', modelAccessor, valueAccessor, initWidgetValue(null)),
      'select-multiple': inputWidget('change', modelAccessor, optionsAccessor, initWidgetValue([]))
//      'file':            fileWidget???
    };


function initWidgetValue(initValue) {
  return function (model, view) {
    var value = view.get();
    if (!value && isDefined(initValue)) {
      value = copy(initValue);
    }
    if (isUndefined(model.get()) && isDefined(value)) {
      model.set(value);
    }
  };
}

function radioInit(model, view, element) {
 var modelValue = model.get(), viewValue = view.get(), input = element[0];
 input.checked = false;
 input.name = this.$id + '@' + input.name;
 if (isUndefined(modelValue)) {
   model.set(modelValue = null);
 }
 if (modelValue == null && viewValue !== null) {
   model.set(viewValue);
 }
 view.set(modelValue);
}

/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:change
 *
 * @description
 * The directive executes an expression whenever the input widget changes.
 *
 * @element INPUT
 * @param {expression} expression to execute.
 *
 * @example
 * @example
    <doc:example>
      <doc:source>
        <div ng:init="checkboxCount=0; textCount=0"></div>
        <input type="text" name="text" ng:change="textCount = 1 + textCount">
           changeCount {{textCount}}<br/>
        <input type="checkbox" name="checkbox" ng:change="checkboxCount = 1 + checkboxCount">
           changeCount {{checkboxCount}}<br/>
      </doc:source>
      <doc:scenario>
         it('should check ng:change', function(){
           expect(binding('textCount')).toBe('0');
           expect(binding('checkboxCount')).toBe('0');

           using('.doc-example-live').input('text').enter('abc');
           expect(binding('textCount')).toBe('1');
           expect(binding('checkboxCount')).toBe('0');


           using('.doc-example-live').input('checkbox').check();
           expect(binding('textCount')).toBe('1');
           expect(binding('checkboxCount')).toBe('1');
         });
      </doc:scenario>
    </doc:example>
 */
function inputWidget(events, modelAccessor, viewAccessor, initFn, textBox) {
  return annotate('$updateView', '$defer', function($updateView, $defer, element) {
    var scope = this,
        model = modelAccessor(scope, element),
        view = viewAccessor(scope, element),
        action = element.attr('ng:change') || '',
        lastValue;
    if (model) {
      initFn.call(scope, model, view, element);
      this.$eval(element.attr('ng:init')||'');
      element.bind(events, function(event){
        function handler(){
          var value = view.get();
          if (!textBox || value != lastValue) {
            model.set(value);
            lastValue = model.get();
            scope.$tryEval(action, element);
            $updateView();
          }
        }
        event.type == 'keydown' ? $defer(handler) : handler();
      });
      scope.$watch(model.get, function(value){
        if (lastValue !== value) {
          view.set(lastValue = value);
        }
      });
    }
  });
}

function inputWidgetSelector(element){
  this.directives(true);
  this.descend(true);
  return INPUT_TYPE[lowercase(element[0].type)] || noop;
}

angularWidget('input', inputWidgetSelector);
angularWidget('textarea', inputWidgetSelector);


/**
 * @workInProgress
 * @ngdoc directive
 * @name angular.directive.ng:options
 *
 * @description
 * Dynamically generate a list of `<option>` elements for a `<select>` element using an array or
 * an object obtained by evaluating the `ng:options` expression.
 *
 * When an item in the select menu is select, the value of array element or object property
 * represented by the selected option will be bound to the model identified by the `name` attribute
 * of the parent select element.
 *
 * Optionally, a single hard-coded `<option>` element, with the value set to an empty string, can
 * be nested into the `<select>` element. This element will then represent `null` or "not selected"
 * option. See example below for demonstration.
 *
 * Note: `ng:options` provides iterator facility for `<option>` element which must be used instead
 * of {@link angular.widget.@ng:repeat ng:repeat}. `ng:repeat` is not suitable for use with
 * `<option>` element because of the following reasons:
 *
 *   * value attribute of the option element that we need to bind to requires a string, but the
 *     source of data for the iteration might be in a form of array containing objects instead of
 *     strings
 *   * {@link angular.widget.@ng:repeat ng:repeat} unrolls after the select binds causing
 *     incorect rendering on most browsers.
 *   * binding to a value not in list confuses most browsers.
 *
 * @element select
 * @param {comprehension_expression} comprehension in one of the following forms:
 *
 *   * for array data sources:
 *     * `label` **`for`** `value` **`in`** `array`
 *     * `select` **`as`** `label` **`for`** `value` **`in`** `array`
 *     * `label`  **`group by`** `group` **`for`** `value` **`in`** `array`
 *     * `select` **`as`** `label` **`group by`** `group` **`for`** `value` **`in`** `array`
 *   * for object data sources:
 *     * `label` **`for (`**`key` **`,`** `value`**`) in`** `object`
 *     * `select` **`as`** `label` **`for (`**`key` **`,`** `value`**`) in`** `object`
 *     * `label` **`group by`** `group` **`for (`**`key`**`,`** `value`**`) in`** `object`
 *     * `select` **`as`** `label` **`group by`** `group`
 *         **`for` `(`**`key`**`,`** `value`**`) in`** `object`
 *
 * Where:
 *
 *   * `array` / `object`: an expression which evaluates to an array / object to iterate over.
 *   * `value`: local variable which will refer to each item in the `array` or each property value
 *      of `object` during iteration.
 *   * `key`: local variable which will refer to a property name in `object` during iteration.
 *   * `label`: The result of this expression will be the label for `<option>` element. The
 *     `expression` will most likely refer to the `value` variable (e.g. `value.propertyName`).
 *   * `select`: The result of this expression will be bound to the model of the parent `<select>`
 *      element. If not specified, `select` expression will default to `value`.
 *   * `group`: The result of this expression will be used to group options using the `<optgroup>`
 *      DOM element.
 *
 * @example
    <doc:example>
      <doc:source>
        <script>
        function MyCntrl(){
          this.colors = [
            {name:'black', shade:'dark'},
            {name:'white', shade:'light'},
            {name:'red', shade:'dark'},
            {name:'blue', shade:'dark'},
            {name:'yellow', shade:'light'}
          ];
          this.color = this.colors[2]; // red
        }
        </script>
        <div ng:controller="MyCntrl">
          <ul>
            <li ng:repeat="color in colors">
              Name: <input name="color.name">
              [<a href ng:click="colors.$remove(color)">X</a>]
            </li>
            <li>
              [<a href ng:click="colors.push({})">add</a>]
            </li>
          </ul>
          <hr/>
          Color (null not allowed):
          <select name="color" ng:options="c.name for c in colors"></select><br>

          Color (null allowed):
          <div  class="nullable">
            <select name="color" ng:options="c.name for c in colors">
              <option value="">-- chose color --</option>
            </select>
          </div><br/>

          Color grouped by shade:
          <select name="color" ng:options="c.name group by c.shade for c in colors">
          </select><br/>


          Select <a href ng:click="color={name:'not in list'}">bogus</a>.<br>
          <hr/>
          Currently selected: {{ {selected_color:color}  }}
          <div style="border:solid 1px black; height:20px"
               ng:style="{'background-color':color.name}">
          </div>
        </div>
      </doc:source>
      <doc:scenario>
         it('should check ng:options', function(){
           expect(binding('color')).toMatch('red');
           select('color').option('0');
           expect(binding('color')).toMatch('black');
           using('.nullable').select('color').option('');
           expect(binding('color')).toMatch('null');
         });
      </doc:scenario>
    </doc:example>
 */
//                       00001111100000000000222200000000000000000000003333000000000000044444444444444444000000000555555555555555550000000666666666666666660000000000000007777
var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*)|(?:\(\s*([\$\w][\$\w\d]*)\s*,\s*([\$\w][\$\w\d]*)\s*\)))\s+in\s+(.*)$/;
angularWidget('select', function(element){
  this.descend(true);
  this.directives(true);

  var isMultiselect = element.attr('multiple'),
      expression = element.attr('ng:options'),
      onChange = expressionCompile(element.attr('ng:change') || "").fnSelf,
      match;

  if (!expression) {
    return inputWidgetSelector.call(this, element);
  }
  if (! (match = expression.match(NG_OPTIONS_REGEXP))) {
    throw Error(
      "Expected ng:options in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_'" +
      " but got '" + expression + "'.");
  }

  var displayFn = expressionCompile(match[2] || match[1]).fnSelf,
      valueName = match[4] || match[6],
      keyName = match[5],
      groupByFn = expressionCompile(match[3] || '').fnSelf,
      valueFn = expressionCompile(match[2] ? match[1] : valueName).fnSelf,
      valuesFn = expressionCompile(match[7]).fnSelf,
      // we can't just jqLite('<option>') since jqLite is not smart enough
      // to create it in <select> and IE barfs otherwise.
      optionTemplate = jqLite(document.createElement('option')),
      optGroupTemplate = jqLite(document.createElement('optgroup')),
      nullOption = false; // if false then user will not be able to select it

  return function(selectElement){

    // This is an array of array of existing option groups in DOM. We try to reuse these if possible
    // optionGroupsCache[0] is the options with no option group
    // optionGroupsCache[?][0] is the parent: either the SELECT or OPTGROUP element
    var optionGroupsCache = [[{element: selectElement, label:''}]],
        scope = this,
        model = modelAccessor(scope, element);

    // find existing special options
    forEach(selectElement.children(), function(option){
      if (option.value == '')
        // User is allowed to select the null.
        nullOption = {label:jqLite(option).text(), id:''};
    });
    selectElement.html(''); // clear contents

    selectElement.bind('change', function(){
      var optionGroup,
          collection = valuesFn(scope) || [],
          key = selectElement.val(),
          tempScope = inherit(scope),
          value, optionElement, index, groupIndex, length, groupLength;

      try {
        if (isMultiselect) {
          value = [];
          for (groupIndex = 0, groupLength = optionGroupsCache.length;
               groupIndex < groupLength;
               groupIndex++) {
            // list of options for that group. (first item has the parent)
            optionGroup = optionGroupsCache[groupIndex];

            for(index = 1, length = optionGroup.length; index < length; index++) {
              if ((optionElement = optionGroup[index].element)[0].selected) {
                if (keyName) tempScope[keyName] = key;
                tempScope[valueName] = collection[optionElement.val()];
                value.push(valueFn(tempScope));
              }
            }
          }
        } else {
          if (key == '?') {
            value = undefined;
          } else if (key == ''){
            value = null;
          } else {
            tempScope[valueName] = collection[key];
            if (keyName) tempScope[keyName] = key;
            value = valueFn(tempScope);
          }
        }
        if (isDefined(value) && model.get() !== value) {
          onChange(scope);
          model.set(value);
        }
        scope.$tryEval(function(){
          scope.$root.$eval();
        });
      } finally {
        tempScope = null; // TODO(misko): needs to be $destroy
      }
    });

    scope.$onEval(function(){
      var scope = this,
          optionGroups = {'':[]}, // Temporary location for the option groups before we render them
          optionGroupNames = [''],
          optionGroupName,
          optionGroup,
          option,
          existingParent, existingOptions, existingOption,
          values = valuesFn(scope) || [],
          keys = values,
          key,
          groupLength, length,
          fragment,
          groupIndex, index,
          optionElement,
          optionScope = inherit(scope),
          modelValue = model.get(),
          selected,
          selectedSet = false, // nothing is selected yet
          isMulti = isMultiselect,
          lastElement,
          element;

      try {
        if (isMulti) {
          selectedSet = new HashMap();
          if (modelValue && isNumber(length = modelValue.length)) {
            for (index = 0; index < length; index++) {
              selectedSet.put(modelValue[index], true);
            }
          }
        } else if (modelValue === null || nullOption) {
          // if we are not multiselect, and we are null then we have to add the nullOption
          optionGroups[''].push(extend({selected:modelValue === null, id:'', label:''}, nullOption));
          selectedSet = true;
        }

        // If we have a keyName then we are iterating over on object. Grab the keys and sort them.
        if(keyName) {
          keys = [];
          for (key in values) {
            if (values.hasOwnProperty(key))
              keys.push(key);
          }
          keys.sort();
        }

        // We now build up the list of options we need (we merge later)
        for (index = 0; length = keys.length, index < length; index++) {
          optionScope[valueName] = values[keyName ? optionScope[keyName]=keys[index]:index];
          optionGroupName = groupByFn(optionScope) || '';
          if (!(optionGroup = optionGroups[optionGroupName])) {
            optionGroup = optionGroups[optionGroupName] = [];
            optionGroupNames.push(optionGroupName);
          }
          if (isMulti) {
            selected = !!selectedSet.remove(valueFn(optionScope));
          } else {
            selected = modelValue === valueFn(optionScope);
            selectedSet = selectedSet || selected; // see if at least one item is selected
          }
          optionGroup.push({
              id: keyName ? keys[index] : index,   // either the index into array or key from object
              label: displayFn(optionScope) || '', // what will be seen by the user
              selected: selected                   // determine if we should be selected
            });
        }
        optionGroupNames.sort();
        if (!isMulti && !selectedSet) {
          // nothing was selected, we have to insert the undefined item
          optionGroups[''].unshift({id:'?', label:'', selected:true});
        }

        // Now we need to update the list of DOM nodes to match the optionGroups we computed above
        for (groupIndex = 0, groupLength = optionGroupNames.length;
             groupIndex < groupLength;
             groupIndex++) {
          // current option group name or '' if no group
          optionGroupName = optionGroupNames[groupIndex];

          // list of options for that group. (first item has the parent)
          optionGroup = optionGroups[optionGroupName];

          if (optionGroupsCache.length <= groupIndex) {
            // we need to grow the optionGroups
            optionGroupsCache.push(
                existingOptions = [
                  existingParent = {
                      element: optGroupTemplate.clone().attr('label', optionGroupName),
                      label: optionGroup.label
                    }
                ]
            );
            selectElement.append(existingParent.element);
          } else {
            existingOptions = optionGroupsCache[groupIndex];
            existingParent = existingOptions[0];  // either SELECT (no group) or OPTGROUP element

            // update the OPTGROUP label if not the same.
            if (existingParent.label != optionGroupName) {
              existingParent.element.attr('label', existingParent.label = optionGroupName);
            }
          }

          lastElement = null;  // start at the begining
          for(index = 0, length = optionGroup.length; index < length; index++) {
            option = optionGroup[index];
            if (existingOption = existingOptions[index+1]) {
              // reuse elements
              lastElement = existingOption.element;
              if (existingOption.label !== option.label) {
                lastElement.text(existingOption.label = option.label);
              }
              if (existingOption.id !== option.id) {
                lastElement.val(existingOption.id = option.id);
              }
              if (existingOption.selected !== option.selected) {
                lastElement.attr('selected', option.selected);
              }
            } else {
              // grow elements
              // jQuery(v1.4.2) Bug: We should be able to chain the method calls, but
              // in this version of jQuery on some browser the .text() returns a string
              // rather then the element.
              (element = optionTemplate.clone())
                .val(option.id)
                .attr('selected', option.selected)
                .text(option.label);
              existingOptions.push(existingOption = {
                element: element,
                label: option.label,
                id: option.id,
                checked: option.selected
              });
              if (lastElement) {
                lastElement.after(element);
              } else {
                existingParent.element.append(element);
              }
              lastElement = element;
            }
          }
          // remove any excessive OPTIONs in a group
          index++; // increment since the existingOptions[0] is parent element not OPTION
          while(existingOptions.length > index) {
            existingOptions.pop().element.remove();
          }
        }
        // remove any excessive OPTGROUPs from select
        while(optionGroupsCache.length > groupIndex) {
          optionGroupsCache.pop()[0].element.remove();
        }
      } finally {
        optionScope = null; // TODO(misko): needs to be $destroy()
      }
    });
  };
});


/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.ng:include
 *
 * @description
 * Fetches, compiles and includes an external HTML fragment.
 *
 * Keep in mind that Same Origin Policy applies to included resources
 * (e.g. ng:include won't work for file:// access).
 *
 * @param {string} src angular expression evaluating to URL. If the source is a string constant,
 *                 make sure you wrap it in quotes, e.g. `src="'myPartialTemplate.html'"`.
 * @param {Scope=} [scope=new_child_scope] optional expression which evaluates to an
 *                 instance of angular.scope to set the HTML fragment to.
 * @param {string=} onload Expression to evaluate when a new partial is loaded.
 *
 * @example
    <doc:example>
      <doc:source jsfiddle="false">
       <select name="url">
        <option value="examples/ng-include/template1.html">template1.html</option>
        <option value="examples/ng-include/template2.html">template2.html</option>
        <option value="">(blank)</option>
       </select>
       url of the template: <tt><a href="{{url}}">{{url}}</a></tt>
       <hr/>
       <ng:include src="url"></ng:include>
      </doc:source>
      <doc:scenario>
        it('should load template1.html', function(){
         expect(element('.doc-example-live ng\\:include').text()).
           toBe('Content of template1.html\n');
        });
        it('should load template2.html', function(){
         select('url').option('examples/ng-include/template2.html');
         expect(element('.doc-example-live ng\\:include').text()).
           toBe('Content of template2.html\n');
        });
        it('should change to blank', function(){
         select('url').option('');
         expect(element('.doc-example-live ng\\:include').text()).toEqual('');
        });
      </doc:scenario>
    </doc:example>
 */
angularWidget('ng:include', function(element){
  var compiler = this,
      srcExp = element.attr("src"),
      scopeExp = element.attr("scope") || '',
      onloadExp = element[0].getAttribute('onload') || ''; //workaround for jquery bug #7537
  if (element[0]['ng:compiled']) {
    this.descend(true);
    this.directives(true);
  } else {
    element[0]['ng:compiled'] = true;
    return extend(function(xhr, element){
      var scope = this, childScope;
      var changeCounter = 0;
      var preventRecursion = false;
      function incrementChange(){ changeCounter++;}
      this.$watch(srcExp, incrementChange);
      this.$watch(scopeExp, incrementChange);

      // note that this propagates eval to the current childScope, where childScope is dynamically
      // bound (via $route.onChange callback) to the current scope created by $route
      scope.$onEval(function(){
        if (childScope && !preventRecursion) {
          preventRecursion = true;
          try {
            childScope.$eval();
          } finally {
            preventRecursion = false;
          }
        }
      });
      this.$watch(function(){return changeCounter;}, function(){
        var src = this.$eval(srcExp),
            useScope = this.$eval(scopeExp);

        if (src) {
          xhr('GET', src, null, function(code, response){
            element.html(response);
            childScope = useScope || createScope(scope);
            compiler.compile(element)(childScope);
            scope.$eval(onloadExp);
          }, false, true);
        } else {
          childScope = null;
          element.html('');
        }
      });
    }, {$inject:['$xhr.cache']});
  }
});

/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.ng:switch
 *
 * @description
 * Conditionally change the DOM structure.
 *
 * @usageContent
 * <any ng:switch-when="matchValue1">...</any>
 *   <any ng:switch-when="matchValue2">...</any>
 *   ...
 *   <any ng:switch-default>...</any>
 *
 * @param {*} on expression to match against <tt>ng:switch-when</tt>.
 * @paramDescription
 * On child elments add:
 *
 * * `ng:switch-when`: the case statement to match against. If match then this
 *   case will be displayed.
 * * `ng:switch-default`: the default case when no other casses match.
 *
 * @example
    <doc:example>
      <doc:source>
        <select name="switch">
          <option>settings</option>
          <option>home</option>
          <option>other</option>
        </select>
        <tt>switch={{switch}}</tt>
        </hr>
        <ng:switch on="switch" >
          <div ng:switch-when="settings">Settings Div</div>
          <span ng:switch-when="home">Home Span</span>
          <span ng:switch-default>default</span>
        </ng:switch>
        </code>
      </doc:source>
      <doc:scenario>
        it('should start in settings', function(){
         expect(element('.doc-example-live ng\\:switch').text()).toEqual('Settings Div');
        });
        it('should change to home', function(){
         select('switch').option('home');
         expect(element('.doc-example-live ng\\:switch').text()).toEqual('Home Span');
        });
        it('should select deafault', function(){
         select('switch').option('other');
         expect(element('.doc-example-live ng\\:switch').text()).toEqual('default');
        });
      </doc:scenario>
    </doc:example>
 */
//TODO(im): remove all the code related to using and inline equals
var ngSwitch = angularWidget('ng:switch', function (element){
  var compiler = this,
      watchExpr = element.attr("on"),
      usingExpr = (element.attr("using") || 'equals'),
      usingExprParams = usingExpr.split(":"),
      usingFn = ngSwitch[usingExprParams.shift()],
      changeExpr = element.attr('change') || '',
      cases = [];
  if (!usingFn) throw "Using expression '" + usingExpr + "' unknown.";
  if (!watchExpr) throw "Missing 'on' attribute.";
  eachNode(element, function(caseElement){
    var when = caseElement.attr('ng:switch-when');
    var switchCase = {
        change: changeExpr,
        element: caseElement,
        template: compiler.compile(caseElement)
      };
    if (isString(when)) {
      switchCase.when = function(scope, value){
        var args = [value, when];
        forEach(usingExprParams, function(arg){
          args.push(arg);
        });
        return usingFn.apply(scope, args);
      };
      cases.unshift(switchCase);
    } else if (isString(caseElement.attr('ng:switch-default'))) {
      switchCase.when = valueFn(true);
      cases.push(switchCase);
    }
  });

  // this needs to be here for IE
  forEach(cases, function(_case){
    _case.element.remove();
  });

  element.html('');
  return function(element){
    var scope = this, childScope;
    this.$watch(watchExpr, function(value){
      var found = false;
      element.html('');
      childScope = createScope(scope);
      forEach(cases, function(switchCase){
        if (!found && switchCase.when(childScope, value)) {
          found = true;
          childScope.$tryEval(switchCase.change, element);
          switchCase.template(childScope, function(caseElement){
            element.append(caseElement);
          });
        }
      });
    });
    scope.$onEval(function(){
      if (childScope) childScope.$eval();
    });
  };
}, {
  equals: function(on, when) {
    return ''+on == when;
  }
});


/*
 * Modifies the default behavior of html A tag, so that the default action is prevented when href
 * attribute is empty.
 *
 * The reasoning for this change is to allow easy creation of action links with ng:click without
 * changing the location or causing page reloads, e.g.:
 * <a href="" ng:click="model.$save()">Save</a>
 */
angularWidget('a', function() {
  this.descend(true);
  this.directives(true);

  return function(element) {
    var hasNgHref = ((element.attr('ng:bind-attr') || '').indexOf('"href":') !== -1);

    // turn <a href ng:click="..">link</a> into a link in IE
    // but only if it doesn't have name attribute, in which case it's an anchor
    if (!hasNgHref && !element.attr('name') && !element.attr('href')) {
      element.attr('href', '');
    }

    if (element.attr('href') === '' && !hasNgHref) {
      element.bind('click', function(event){
        event.preventDefault();
      });
    }
  };
});


/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.@ng:repeat
 *
 * @description
 * The `ng:repeat` widget instantiates a template once per item from a collection. The collection is
 * enumerated with the `ng:repeat-index` attribute, starting from 0. Each template instance gets
 * its own scope, where the given loop variable is set to the current collection item, and `$index`
 * is set to the item index or key.
 *
 * Special properties are exposed on the local scope of each template instance, including:
 *
 *   * `$index` – `{number}` – iterator offset of the repeated element (0..length-1)
 *   * `$position` – `{string}` – position of the repeated element in the iterator. One of:
 *        * `'first'`,
 *        * `'middle'`
 *        * `'last'`
 *
 * Note: Although `ng:repeat` looks like a directive, it is actually an attribute widget.
 *
 * @element ANY
 * @param {string} repeat_expression The expression indicating how to enumerate a collection. Two
 *   formats are currently supported:
 *
 *   * `variable in expression` – where variable is the user defined loop variable and `expression`
 *     is a scope expression giving the collection to enumerate.
 *
 *     For example: `track in cd.tracks`.
 *
 *   * `(key, value) in expression` – where `key` and `value` can be any user defined identifiers,
 *     and `expression` is the scope expression giving the collection to enumerate.
 *
 *     For example: `(name, age) in {'adam':10, 'amalie':12}`.
 *
 * @example
 * This example initializes the scope to a list of names and
 * then uses `ng:repeat` to display every person:
    <doc:example>
      <doc:source>
        <div ng:init="friends = [{name:'John', age:25}, {name:'Mary', age:28}]">
          I have {{friends.length}} friends. They are:
          <ul>
            <li ng:repeat="friend in friends">
              [{{$index + 1}}] {{friend.name}} who is {{friend.age}} years old.
            </li>
          </ul>
        </div>
      </doc:source>
      <doc:scenario>
         it('should check ng:repeat', function(){
           var r = using('.doc-example-live').repeater('ul li');
           expect(r.count()).toBe(2);
           expect(r.row(0)).toEqual(["1","John","25"]);
           expect(r.row(1)).toEqual(["2","Mary","28"]);
         });
      </doc:scenario>
    </doc:example>
 */
angularWidget('@ng:repeat', function(expression, element){
  element.removeAttr('ng:repeat');
  element.replaceWith(jqLite('<!-- ng:repeat: ' + expression + ' -->'));
  var linker = this.compile(element);
  return function(iterStartElement){
    var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/),
        lhs, rhs, valueIdent, keyIdent;
    if (! match) {
      throw Error("Expected ng:repeat in form of '_item_ in _collection_' but got '" +
      expression + "'.");
    }
    lhs = match[1];
    rhs = match[2];
    match = lhs.match(/^([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\)$/);
    if (!match) {
      throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '" +
      keyValue + "'.");
    }
    valueIdent = match[3] || match[1];
    keyIdent = match[2];

    var children = [], currentScope = this;
    this.$onEval(function(){
      var index = 0,
          childCount = children.length,
          lastIterElement = iterStartElement,
          collection = this.$tryEval(rhs, iterStartElement),
          collectionLength = size(collection, true),
          fragment = (element[0].nodeName != 'OPTION') ? document.createDocumentFragment() : null,
          addFragment,
          childScope,
          key;

      for (key in collection) {
        if (collection.hasOwnProperty(key)) {
          if (index < childCount) {
            // reuse existing child
            childScope = children[index];
            childScope[valueIdent] = collection[key];
            if (keyIdent) childScope[keyIdent] = key;
            lastIterElement = childScope.$element;
            childScope.$position = index == 0
                ? 'first'
                : (index == collectionLength - 1 ? 'last' : 'middle');
            childScope.$eval();
          } else {
            // grow children
            childScope = createScope(currentScope);
            childScope[valueIdent] = collection[key];
            if (keyIdent) childScope[keyIdent] = key;
            childScope.$index = index;
            childScope.$position = index == 0
                ? 'first'
                : (index == collectionLength - 1 ? 'last' : 'middle');
            children.push(childScope);
            linker(childScope, function(clone){
              clone.attr('ng:repeat-index', index);

              if (fragment) {
                fragment.appendChild(clone[0]);
                addFragment = true;
              } else {
                //temporarily preserve old way for option element
                lastIterElement.after(clone);
                lastIterElement = clone;
              }
            });
          }
          index ++;
        }
      }

      //attach new nodes buffered in doc fragment
      if (addFragment) {
        lastIterElement.after(jqLite(fragment));
      }

      // shrink children
      while(children.length > index) {
        children.pop().$element.remove();
      }
    }, iterStartElement);
  };
});


/**
 * @workInProgress
 * @ngdoc widget
 * @name angular.widget.@ng:non-bindable
 *
 * @description
 * Sometimes it is necessary to write code which looks like bindings but which should be left alone
 * by angular. Use `ng:non-bindable` to make angular ignore a chunk of HTML.
 *
 * Note: `ng:non-bindable` looks like a directive, but is actually an attribute widget.
 *
 * @element ANY
 *
 * @example
 * In this example there are two location where a simple binding (`{{}}`) is present, but the one
 * wrapped in `ng:non-bindable` is left alone.
 *
 * @example
    <doc:example>
      <doc:source>
        <div>Normal: {{1 + 2}}</div>
        <div ng:non-bindable>Ignored: {{1 + 2}}</div>
      </doc:source>
      <doc:scenario>
       it('should check ng:non-bindable', function(){
         expect(using('.doc-example-live').binding('1 + 2')).toBe('3');
         expect(using('.doc-example-live').element('div:last').text()).
           toMatch(/1 \+ 2/);
       });
      </doc:scenario>
    </doc:example>
 */
angularWidget("@ng:non-bindable", noop);


/**
 * @ngdoc widget
 * @name angular.widget.ng:view
 *
 * @description
 * # Overview
 * `ng:view` is a widget that complements the {@link angular.service.$route $route} service by
 * including the rendered template of the current route into the main layout (`index.html`) file.
 * Every time the current route changes, the included view changes with it according to the
 * configuration of the `$route` service.
 *
 * This widget provides functionality similar to {@link angular.widget.ng:include ng:include} when
 * used like this:
 *
 *     <ng:include src="$route.current.template" scope="$route.current.scope"></ng:include>
 *
 *
 * # Advantages
 * Compared to `ng:include`, `ng:view` offers these advantages:
 *
 * - shorter syntax
 * - more efficient execution
 * - doesn't require `$route` service to be available on the root scope
 *
 *
 * @example
    <doc:example>
      <doc:source jsfiddle="false">
         <script>
           function MyCtrl($route) {
             $route.when('/overview',
               { controller: OverviewCtrl,
                 template: 'guide/dev_guide.overview.html'});
             $route.when('/bootstrap',
               { controller: BootstrapCtrl,
                 template: 'guide/dev_guide.bootstrap.auto_bootstrap.html'});
           };
           MyCtrl.$inject = ['$route'];

           function BootstrapCtrl(){}
           function OverviewCtrl(){}
         </script>
         <div ng:controller="MyCtrl">
           <a href="#/overview">overview</a> |
           <a href="#/bootstrap">bootstrap</a> |
           <a href="#/undefined">undefined</a>

           <br/>

           The view is included below:
           <hr/>
           <ng:view></ng:view>
         </div>
      </doc:source>
      <doc:scenario>
        it('should load templates', function(){
          element('.doc-example-live a:contains(overview)').click();
          expect(element('.doc-example-live ng\\:view').text()).toMatch(/Developer Guide: Overview/);

          element('.doc-example-live a:contains(bootstrap)').click();
          expect(element('.doc-example-live ng\\:view').text()).toMatch(/Developer Guide: Initializing Angular: Automatic Initiialization/);
        });
      </doc:scenario>
    </doc:example>
 */
angularWidget('ng:view', function(element) {
  var compiler = this;

  if (!element[0]['ng:compiled']) {
    element[0]['ng:compiled'] = true;
    return annotate('$xhr.cache', '$route', function($xhr, $route, element){
      var parentScope = this,
          childScope;

      $route.onChangeListener(function(){
        var src;

        if ($route.current) {
          src = $route.current.template;
          childScope = $route.current.scope;
        }

        if (src) {
          //xhr's callback must be async, see commit history for more info
          $xhr('GET', src, function(code, response){
            element.html(response);
            compiler.compile(element)(childScope);
          });
        } else {
          element.html('');
        }
      })(); //initialize the state forcefully, it's possible that we missed the initial
            //$route#onChange already

      // note that this propagates eval to the current childScope, where childScope is dynamically
      // bound (via $route.onChange callback) to the current scope created by $route
      parentScope.$onEval(function() {
        if (childScope) {
          childScope.$eval();
        }
      });
    });
  } else {
    this.descend(true);
    this.directives(true);
  }
});

var browserSingleton;

angularService('$browser', function($log){
  if (!browserSingleton) {
    browserSingleton = new Browser(window, jqLite(window.document), jqLite(window.document.body),
                                   XHR, $log);
    browserSingleton.bind();
  }
  return browserSingleton;
}, {$inject:['$log']});


extend(angular, {
  // disabled for now until we agree on public name
  //'annotate': annotate,
  'element': jqLite,
  'compile': compile,
  'scope': createScope,
  'copy': copy,
  'extend': extend,
  'equals': equals,
  'forEach': forEach,
  'injector': createInjector,
  'noop':noop,
  'bind':bind,
  'toJson': toJson,
  'fromJson': fromJson,
  'identity':identity,
  'isUndefined': isUndefined,
  'isDefined': isDefined,
  'isString': isString,
  'isFunction': isFunction,
  'isObject': isObject,
  'isNumber': isNumber,
  'isArray': isArray,
  'version': version
});

//try to bind to jquery now so that one can write angular.element().read()
//but we will rebind on bootstrap again.
bindJQuery();



  jqLiteWrap(document).ready(function(){
    angularInit(angularJsConfig(document), document);
  });

})(window, document);
angular.element(document).find('head').append('<style type="text/css">@charset "UTF-8";.ng-format-negative{color:red;}.ng-exception{border:2px solid #FF0000;font-family:"Courier New",Courier,monospace;font-size:smaller;white-space:pre;}.ng-validation-error{border:2px solid #FF0000;}#ng-callout{margin:0;padding:0;border:0;outline:0;font-size:13px;font-weight:normal;font-family:Verdana,Arial,Helvetica,sans-serif;vertical-align:baseline;background:transparent;text-decoration:none;}#ng-callout .ng-arrow-left{background-image:url("data:image/gif;base64,R0lGODlhCwAXAKIAAMzMzO/v7/f39////////wAAAAAAAAAAACH5BAUUAAQALAAAAAALABcAAAMrSLoc/AG8FeUUIN+sGebWAnbKSJodqqlsOxJtqYooU9vvk+vcJIcTkg+QAAA7");background-repeat:no-repeat;background-position:left top;position:absolute;z-index:101;left:-12px;height:23px;width:10px;top:-3px;}#ng-callout .ng-arrow-right{background-image:url("data:image/gif;base64,R0lGODlhCwAXAKIAAMzMzO/v7/f39////////wAAAAAAAAAAACH5BAUUAAQALAAAAAALABcAAAMrCLTcoM29yN6k9socs91e5X3EyJloipYrO4ohTMqA0Fn2XVNswJe+H+SXAAA7");background-repeat:no-repeat;background-position:left top;position:absolute;z-index:101;height:23px;width:11px;top:-2px;}#ng-callout{position:absolute;z-index:100;border:2px solid #CCCCCC;background-color:#fff;}#ng-callout .ng-content{padding:10px 10px 10px 10px;color:#333333;}#ng-callout .ng-title{background-color:#CCCCCC;text-align:left;padding-left:8px;padding-bottom:5px;padding-top:2px;font-weight:bold;}.ng-input-indicator-wait{background-image:url("data:image/png;base64,R0lGODlhEAAQAPQAAP///wAAAPDw8IqKiuDg4EZGRnp6egAAAFhYWCQkJKysrL6+vhQUFJycnAQEBDY2NmhoaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFdyAgAgIJIeWoAkRCCMdBkKtIHIngyMKsErPBYbADpkSCwhDmQCBethRB6Vj4kFCkQPG4IlWDgrNRIwnO4UKBXDufzQvDMaoSDBgFb886MiQadgNABAokfCwzBA8LCg0Egl8jAggGAA1kBIA1BAYzlyILczULC2UhACH5BAkKAAAALAAAAAAQABAAAAV2ICACAmlAZTmOREEIyUEQjLKKxPHADhEvqxlgcGgkGI1DYSVAIAWMx+lwSKkICJ0QsHi9RgKBwnVTiRQQgwF4I4UFDQQEwi6/3YSGWRRmjhEETAJfIgMFCnAKM0KDV4EEEAQLiF18TAYNXDaSe3x6mjidN1s3IQAh+QQJCgAAACwAAAAAEAAQAAAFeCAgAgLZDGU5jgRECEUiCI+yioSDwDJyLKsXoHFQxBSHAoAAFBhqtMJg8DgQBgfrEsJAEAg4YhZIEiwgKtHiMBgtpg3wbUZXGO7kOb1MUKRFMysCChAoggJCIg0GC2aNe4gqQldfL4l/Ag1AXySJgn5LcoE3QXI3IQAh+QQJCgAAACwAAAAAEAAQAAAFdiAgAgLZNGU5joQhCEjxIssqEo8bC9BRjy9Ag7GILQ4QEoE0gBAEBcOpcBA0DoxSK/e8LRIHn+i1cK0IyKdg0VAoljYIg+GgnRrwVS/8IAkICyosBIQpBAMoKy9dImxPhS+GKkFrkX+TigtLlIyKXUF+NjagNiEAIfkECQoAAAAsAAAAABAAEAAABWwgIAICaRhlOY4EIgjH8R7LKhKHGwsMvb4AAy3WODBIBBKCsYA9TjuhDNDKEVSERezQEL0WrhXucRUQGuik7bFlngzqVW9LMl9XWvLdjFaJtDFqZ1cEZUB0dUgvL3dgP4WJZn4jkomWNpSTIyEAIfkECQoAAAAsAAAAABAAEAAABX4gIAICuSxlOY6CIgiD8RrEKgqGOwxwUrMlAoSwIzAGpJpgoSDAGifDY5kopBYDlEpAQBwevxfBtRIUGi8xwWkDNBCIwmC9Vq0aiQQDQuK+VgQPDXV9hCJjBwcFYU5pLwwHXQcMKSmNLQcIAExlbH8JBwttaX0ABAcNbWVbKyEAIfkECQoAAAAsAAAAABAAEAAABXkgIAICSRBlOY7CIghN8zbEKsKoIjdFzZaEgUBHKChMJtRwcWpAWoWnifm6ESAMhO8lQK0EEAV3rFopIBCEcGwDKAqPh4HUrY4ICHH1dSoTFgcHUiZjBhAJB2AHDykpKAwHAwdzf19KkASIPl9cDgcnDkdtNwiMJCshACH5BAkKAAAALAAAAAAQABAAAAV3ICACAkkQZTmOAiosiyAoxCq+KPxCNVsSMRgBsiClWrLTSWFoIQZHl6pleBh6suxKMIhlvzbAwkBWfFWrBQTxNLq2RG2yhSUkDs2b63AYDAoJXAcFRwADeAkJDX0AQCsEfAQMDAIPBz0rCgcxky0JRWE1AmwpKyEAIfkECQoAAAAsAAAAABAAEAAABXkgIAICKZzkqJ4nQZxLqZKv4NqNLKK2/Q4Ek4lFXChsg5ypJjs1II3gEDUSRInEGYAw6B6zM4JhrDAtEosVkLUtHA7RHaHAGJQEjsODcEg0FBAFVgkQJQ1pAwcDDw8KcFtSInwJAowCCA6RIwqZAgkPNgVpWndjdyohACH5BAkKAAAALAAAAAAQABAAAAV5ICACAimc5KieLEuUKvm2xAKLqDCfC2GaO9eL0LABWTiBYmA06W6kHgvCqEJiAIJiu3gcvgUsscHUERm+kaCxyxa+zRPk0SgJEgfIvbAdIAQLCAYlCj4DBw0IBQsMCjIqBAcPAooCBg9pKgsJLwUFOhCZKyQDA3YqIQAh+QQJCgAAACwAAAAAEAAQAAAFdSAgAgIpnOSonmxbqiThCrJKEHFbo8JxDDOZYFFb+A41E4H4OhkOipXwBElYITDAckFEOBgMQ3arkMkUBdxIUGZpEb7kaQBRlASPg0FQQHAbEEMGDSVEAA1QBhAED1E0NgwFAooCDWljaQIQCE5qMHcNhCkjIQAh+QQJCgAAACwAAAAAEAAQAAAFeSAgAgIpnOSoLgxxvqgKLEcCC65KEAByKK8cSpA4DAiHQ/DkKhGKh4ZCtCyZGo6F6iYYPAqFgYy02xkSaLEMV34tELyRYNEsCQyHlvWkGCzsPgMCEAY7Cg04Uk48LAsDhRA8MVQPEF0GAgqYYwSRlycNcWskCkApIyEAOwAAAAAAAAAAAA==");background-position:right;background-repeat:no-repeat;}</style>');