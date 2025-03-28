var CryptoJS =
  CryptoJS ||
  (function (h, s) {
    var f = {},
      g = (f.lib = {}),
      q = function () { },
      m = (g.Base = {
        extend: function (a) {
          q.prototype = this;
          var c = new q();
          a && c.mixIn(a);
          c.hasOwnProperty("init") ||
            (c.init = function () {
              c.$super.init.apply(this, arguments);
            });
          c.init.prototype = c;
          c.$super = this;
          return c;
        },
        create: function () {
          var a = this.extend();
          a.init.apply(a, arguments);
          return a;
        },
        init: function () { },
        mixIn: function (a) {
          for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
          a.hasOwnProperty("toString") && (this.toString = a.toString);
        },
        clone: function () {
          return this.init.prototype.extend(this);
        },
      }),
      r = (g.WordArray = m.extend({
        init: function (a, c) {
          a = this.words = a || [];
          this.sigBytes = c != s ? c : 4 * a.length;
        },
        toString: function (a) {
          return (a || k).stringify(this);
        },
        concat: function (a) {
          var c = this.words,
            d = a.words,
            b = this.sigBytes;
          a = a.sigBytes;
          this.clamp();
          if (b % 4)
            for (var e = 0; e < a; e++)
              c[(b + e) >>> 2] |=
                ((d[e >>> 2] >>> (24 - 8 * (e % 4))) & 255) <<
                (24 - 8 * ((b + e) % 4));
          else if (65535 < d.length)
            for (e = 0; e < a; e += 4) c[(b + e) >>> 2] = d[e >>> 2];
          else c.push.apply(c, d);
          this.sigBytes += a;
          return this;
        },
        clamp: function () {
          var a = this.words,
            c = this.sigBytes;
          a[c >>> 2] &= 4294967295 << (32 - 8 * (c % 4));
          a.length = h.ceil(c / 4);
        },
        clone: function () {
          var a = m.clone.call(this);
          a.words = this.words.slice(0);
          return a;
        },
        random: function (a) {
          for (var c = [], d = 0; d < a; d += 4)
            c.push((4294967296 * h.random()) | 0);
          return new r.init(c, a);
        },
      })),
      l = (f.enc = {}),
      k = (l.Hex = {
        stringify: function (a) {
          var c = a.words;
          a = a.sigBytes;
          for (var d = [], b = 0; b < a; b++) {
            var e = (c[b >>> 2] >>> (24 - 8 * (b % 4))) & 255;
            d.push((e >>> 4).toString(16));
            d.push((e & 15).toString(16));
          }
          return d.join("");
        },
        parse: function (a) {
          for (var c = a.length, d = [], b = 0; b < c; b += 2)
            d[b >>> 3] |= parseInt(a.substr(b, 2), 16) << (24 - 4 * (b % 8));
          return new r.init(d, c / 2);
        },
      }),
      n = (l.Latin1 = {
        stringify: function (a) {
          var c = a.words;
          a = a.sigBytes;
          for (var d = [], b = 0; b < a; b++)
            d.push(
              String.fromCharCode((c[b >>> 2] >>> (24 - 8 * (b % 4))) & 255)
            );
          return d.join("");
        },
        parse: function (a) {
          for (var c = a.length, d = [], b = 0; b < c; b++)
            d[b >>> 2] |= (a.charCodeAt(b) & 255) << (24 - 8 * (b % 4));
          return new r.init(d, c);
        },
      }),
      j = (l.Utf8 = {
        stringify: function (a) {
          try {
            return decodeURIComponent(escape(n.stringify(a)));
          } catch (c) {
            throw Error("Malformed UTF-8 data");
          }
        },
        parse: function (a) {
          return n.parse(unescape(encodeURIComponent(a)));
        },
      }),
      u = (g.BufferedBlockAlgorithm = m.extend({
        reset: function () {
          this._data = new r.init();
          this._nDataBytes = 0;
        },
        _append: function (a) {
          "string" == typeof a && (a = j.parse(a));
          this._data.concat(a);
          this._nDataBytes += a.sigBytes;
        },
        _process: function (a) {
          var c = this._data,
            d = c.words,
            b = c.sigBytes,
            e = this.blockSize,
            f = b / (4 * e),
            f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
          a = f * e;
          b = h.min(4 * a, b);
          if (a) {
            for (var g = 0; g < a; g += e) this._doProcessBlock(d, g);
            g = d.splice(0, a);
            c.sigBytes -= b;
          }
          return new r.init(g, b);
        },
        clone: function () {
          var a = m.clone.call(this);
          a._data = this._data.clone();
          return a;
        },
        _minBufferSize: 0,
      }));
    g.Hasher = u.extend({
      cfg: m.extend(),
      init: function (a) {
        this.cfg = this.cfg.extend(a);
        this.reset();
      },
      reset: function () {
        u.reset.call(this);
        this._doReset();
      },
      update: function (a) {
        this._append(a);
        this._process();
        return this;
      },
      finalize: function (a) {
        a && this._append(a);
        return this._doFinalize();
      },
      blockSize: 16,
      _createHelper: function (a) {
        return function (c, d) {
          return new a.init(d).finalize(c);
        };
      },
      _createHmacHelper: function (a) {
        return function (c, d) {
          return new t.HMAC.init(a, d).finalize(c);
        };
      },
    });
    var t = (f.algo = {});
    return f;
  })(Math);
(function (h) {
  for (
    var s = CryptoJS,
    f = s.lib,
    g = f.WordArray,
    q = f.Hasher,
    f = s.algo,
    m = [],
    r = [],
    l = function (a) {
      return (4294967296 * (a - (a | 0))) | 0;
    },
    k = 2,
    n = 0;
    64 > n;

  ) {
    var j;
    a: {
      j = k;
      for (var u = h.sqrt(j), t = 2; t <= u; t++)
        if (!(j % t)) {
          j = !1;
          break a;
        }
      j = !0;
    }
    j && (8 > n && (m[n] = l(h.pow(k, 0.5))), (r[n] = l(h.pow(k, 1 / 3))), n++);
    k++;
  }
  var a = [],
    f = (f.SHA256 = q.extend({
      _doReset: function () {
        this._hash = new g.init(m.slice(0));
      },
      _doProcessBlock: function (c, d) {
        for (
          var b = this._hash.words,
          e = b[0],
          f = b[1],
          g = b[2],
          j = b[3],
          h = b[4],
          m = b[5],
          n = b[6],
          q = b[7],
          p = 0;
          64 > p;
          p++
        ) {
          if (16 > p) a[p] = c[d + p] | 0;
          else {
            var k = a[p - 15],
              l = a[p - 2];
            a[p] =
              (((k << 25) | (k >>> 7)) ^ ((k << 14) | (k >>> 18)) ^ (k >>> 3)) +
              a[p - 7] +
              (((l << 15) | (l >>> 17)) ^
                ((l << 13) | (l >>> 19)) ^
                (l >>> 10)) +
              a[p - 16];
          }
          k =
            q +
            (((h << 26) | (h >>> 6)) ^
              ((h << 21) | (h >>> 11)) ^
              ((h << 7) | (h >>> 25))) +
            ((h & m) ^ (~h & n)) +
            r[p] +
            a[p];
          l =
            (((e << 30) | (e >>> 2)) ^
              ((e << 19) | (e >>> 13)) ^
              ((e << 10) | (e >>> 22))) +
            ((e & f) ^ (e & g) ^ (f & g));
          q = n;
          n = m;
          m = h;
          h = (j + k) | 0;
          j = g;
          g = f;
          f = e;
          e = (k + l) | 0;
        }
        b[0] = (b[0] + e) | 0;
        b[1] = (b[1] + f) | 0;
        b[2] = (b[2] + g) | 0;
        b[3] = (b[3] + j) | 0;
        b[4] = (b[4] + h) | 0;
        b[5] = (b[5] + m) | 0;
        b[6] = (b[6] + n) | 0;
        b[7] = (b[7] + q) | 0;
      },
      _doFinalize: function () {
        var a = this._data,
          d = a.words,
          b = 8 * this._nDataBytes,
          e = 8 * a.sigBytes;
        d[e >>> 5] |= 128 << (24 - (e % 32));
        d[(((e + 64) >>> 9) << 4) + 14] = h.floor(b / 4294967296);
        d[(((e + 64) >>> 9) << 4) + 15] = b;
        a.sigBytes = 4 * d.length;
        this._process();
        return this._hash;
      },
      clone: function () {
        var a = q.clone.call(this);
        a._hash = this._hash.clone();
        return a;
      },
    }));
  s.SHA256 = q._createHelper(f);
  s.HmacSHA256 = q._createHmacHelper(f);
})(Math);
(function () {
  var h = CryptoJS,
    s = h.enc.Utf8;
  h.algo.HMAC = h.lib.Base.extend({
    init: function (f, g) {
      f = this._hasher = new f.init();
      "string" == typeof g && (g = s.parse(g));
      var h = f.blockSize,
        m = 4 * h;
      g.sigBytes > m && (g = f.finalize(g));
      g.clamp();
      for (
        var r = (this._oKey = g.clone()),
        l = (this._iKey = g.clone()),
        k = r.words,
        n = l.words,
        j = 0;
        j < h;
        j++
      )
        (k[j] ^= 1549556828), (n[j] ^= 909522486);
      r.sigBytes = l.sigBytes = m;
      this.reset();
    },
    reset: function () {
      var f = this._hasher;
      f.reset();
      f.update(this._iKey);
    },
    update: function (f) {
      this._hasher.update(f);
      return this;
    },
    finalize: function (f) {
      var g = this._hasher;
      f = g.finalize(f);
      g.reset();
      return g.finalize(this._oKey.clone().concat(f));
    },
  });
})();

(function () {
  var C = CryptoJS;
  var C_lib = C.lib;
  var WordArray = C_lib.WordArray;
  var C_enc = C.enc;
  var Base64 = (C_enc.Base64 = {
    stringify: function (wordArray) {
      // Shortcuts
      var words = wordArray.words;
      var sigBytes = wordArray.sigBytes;
      var map = this._map;

      wordArray.clamp();

      var base64Chars = [];
      for (var i = 0; i < sigBytes; i += 3) {
        var byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
        var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

        var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

        for (var j = 0; j < 4 && i + j * 0.75 < sigBytes; j++) {
          base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
        }
      }

      var paddingChar = map.charAt(64);
      if (paddingChar) {
        while (base64Chars.length % 4) {
          base64Chars.push(paddingChar);
        }
      }

      return base64Chars.join("");
    },
    parse: function (base64Str) {
      var base64StrLength = base64Str.length;
      var map = this._map;
      var paddingChar = map.charAt(64);
      if (paddingChar) {
        var paddingIndex = base64Str.indexOf(paddingChar);
        if (paddingIndex != -1) {
          base64StrLength = paddingIndex;
        }
      }
      var words = [];
      var nBytes = 0;
      for (var i = 0; i < base64StrLength; i++) {
        if (i % 4) {
          var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
          var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
          words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
          nBytes++;
        }
      }

      return WordArray.create(words, nBytes);
    },
    _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  });
})();

var cURL = cURL || (function () {
  var p = {};
  p = {
    parseUrl: function (url) {
      var regex = /^(https?):\/\/([^\/:]+)(?::(\d+))?([^?#]*)(\?[^#]*)?(#.*)?$/;
      var matches = url.match(regex);
      if (!matches) {
        throw Error("Invalid URL");
      }
      return {
        protocol: matches[1],
        host: matches[2],
        port: matches[3] || "",
        pathname: matches[4] || "/",
        search: matches[5] || "",
        hash: matches[6] || "",
        href: url,
      };
    },
    getHost: function (url) {
      var parsedUrl = this.parseUrl(url);
      return parsedUrl.host;
    },
    getPathname: function (url) {
      var parsedUrl = this.parseUrl(url);
      return parsedUrl.pathname;
    },
    getSearchParams: function (url) {
      var parsedUrl = this.parseUrl(url);
      var searchParams = parsedUrl.search;
      if (!searchParams) {
        return {};
      }
      var paramsArray = searchParams.slice(1).split("&");
      var paramsObj = {};

      paramsArray.forEach((param) => {
        var raw_param = param.split("=");
        paramsObj[raw_param[0]] = decodeURIComponent(raw_param[1] || "");
      });
      return paramsObj;
    },
    getFilePath: function (url) {
      var parsedUrl = this.parseUrl(url);
      var pathname = parsedUrl.pathname;
      var segments = pathname.split("/");
      return segments[segments.length - 1];
    },
  };
  return p;
})();

var ObjectUtils = (function () {
  return {
    keys: function (obj) {
      var result = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) result.push(key);
      }
      return result;
    },
    entries: function (obj) {
      var result = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) result.push([key, obj[key]]);
      }
      return result;
    },
    values: function (obj) {
      var result = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) result.push(obj[key]);
      }
      return result;
    },
  };
})();

function getSharedKey(
  accountName,
  accountKey,
  originDirectory,
  destinationDirectory,
  endpointUrl,
  httpMethod
) {
  function signRequestWithoutParams(
    verb,
    date,
    accountName,
    accountKey,
    pathName
  ) {
    var canonicalizedHeaders =
      "x-ms-date:" + date + "\nx-ms-version:2019-02-02";
    console.log(canonicalizedHeaders);

    var canonicalizedResource = "/" + accountName + pathName;
    console.log(canonicalizedResource);

    var stringToSign =
    verb +
    "\n\n\n\n\n\n\n\n\n\n\n\n" +
    canonicalizedHeaders +
    "\n" +
    canonicalizedResource;
    var rawSignature = CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(stringToSign, CryptoJS.enc.Base64.parse(accountKey))
    );
    var signature = "SharedKey " + accountName + ":" + rawSignature;

    return signature;
  }

  function signRequestWithParams(
    verb,
    date,
    accountName,
    accountKey,
    pathName,
    params
  ) {
    var canonicalizedHeaders = "x-ms-date:" + date + "\nx-ms-version:2019-02-02";
    var _params = ObjectUtils.entries(params)
      .map((param) => {
        var element = param[0] + ":" + param[1];
        return element;
      })
      .join("\n");
    var canonicalizedResource = "/" + accountName + pathName + "\n" + _params;
    console.log(canonicalizedResource);

    var stringToSign =
      verb +
      "\n\n\n\n\n\n\n\n\n\n\n\n" +
      canonicalizedHeaders +
      "\n" +
      canonicalizedResource;
    var rawSignature = CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(stringToSign, CryptoJS.enc.Base64.parse(accountKey))
    );
    var signature = "SharedKey " + accountName + ":" + rawSignature;

    return signature;
  }

  function signRequestToCopyFileWithoutParams(
    verb,
    date,
    accountName,
    accountKey,
    url,
    origin,
    destination
  ) {
    var canonicalizedHeaders =
      "x-ms-copy-source:" +
      url + origin +
      "\nx-ms-date:" +
      date +
      "\nx-ms-version:2019-02-02";
    console.log(canonicalizedHeaders);

    var canonicalizedResource = "/" + accountName + destination;
    console.log(canonicalizedResource);
    var stringToSign =
      verb +
      "\n\n\n\n\n\n\n\n\n\n\n\n" +
      canonicalizedHeaders +
      "\n" +
      canonicalizedResource;
    var rawSignature = CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(stringToSign, CryptoJS.enc.Base64.parse(accountKey))
    );
    var signature = "SharedKey " + accountName + ":" + rawSignature;

    return signature;
  }

  function signRequestToDeleteWithoutParams(
      verb,
      date,
      accountName,
      accountKey,
      pathName
    ) {
      var canonicalizedHeaders =
        "x-ms-date:" + date + "\nx-ms-version:2019-02-02";
      console.log(canonicalizedHeaders);

      var canonicalizedResource = "/" + accountName + pathName;
      console.log(canonicalizedResource);

      var stringToSign =
        verb +
        "\n\n\n\n\n\n\n\n\n\n\n\n" +
        canonicalizedHeaders +
        "\n" +
        canonicalizedResource;
      var rawSignature = CryptoJS.enc.Base64.stringify(
        CryptoJS.HmacSHA256(stringToSign, CryptoJS.enc.Base64.parse(accountKey))
      );
      var signature = "SharedKey " + accountName + ":" + rawSignature;

      return signature;
    }

  var result = "";
  var sharedKey = "";
  var date = new Date().toUTCString();
  var params = cURL.getSearchParams(endpointUrl);
  var pathName = cURL.getPathname(endpointUrl);

  if (ObjectUtils.keys(params).length === 0 && httpMethod == "GET") {
    sharedKey = signRequestWithoutParams(
      httpMethod,
      date,
      accountName,
      accountKey,
      pathName
    );
  }

  if (ObjectUtils.keys(params).length !== 0 && httpMethod == "GET") {
    sharedKey = signRequestWithParams(
      httpMethod,
      date,
      accountName,
      accountKey,
      pathName,
      params
    );
  }

  if (ObjectUtils.keys(params).length === 0 && httpMethod == "PUT") {
    sharedKey = signRequestToCopyFileWithoutParams(
      httpMethod,
      date,
      accountName,
      accountKey,
      endpointUrl,
      originDirectory,
      destinationDirectory
    );
  }

  if (ObjectUtils.keys(params).length === 0 && httpMethod == "DELETE") {
    sharedKey = signRequestToDeleteWithoutParams(
      httpMethod,
      date,
      accountName,
      accountKey,
      originDirectory
    );
  }

  result = date + "||" + sharedKey;

  return result;
}

exports.getSharedKey = getSharedKey;