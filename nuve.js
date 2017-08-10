/*
 */
/*
 MIT
*/
var Url = require("url"),
    spawn = require("child_process").spawn,
    fs = require("fs"),
    XMLHttpRequest = function() {
        var b = this,
            r = require("http"),
            t = require("https"),
            c = {},
            m, d, e = {},
            q = {
                "User-Agent": "node.js",
                Accept: "*/*"
            },
            k = !1,
            n = !1,
            p = q;
        this.UNSENT = 0;
        this.OPENED = 1;
        this.HEADERS_RECEIVED = 2;
        this.LOADING = 3;
        this.DONE = 4;
        this.readyState = this.UNSENT;
        this.onreadystatechange = null;
        this.responseXML = this.responseText = "";
        this.statusText = this.status = null;
        var l = function(a) {
            b.readyState = a;
            if ("function" === typeof b.onreadystatechange) b.onreadystatechange();
            if ("readystatechange" in c) {
                a = c.readystatechange.length;
                for (var g = 0; g < a; g++) c.readystatechange[g].call(b)
            }
        };
        this.open = function(a, b, f, d, h) {
            e = {
                method: a,
                url: b.toString(),
                async: "boolean" !== typeof f ? !0 : f,
                user: d || null,
                password: h || null
            };
            this.abort();
            l(this.OPENED)
        };
        this.setRequestHeader = function(a, b) {
            if (this.readyState !== this.OPENED) throw "NVALID_STATE_ERR: setRequestHeader can only be called when state is OPEN";
            if (k) throw "INVALID_STATE_ERR: send flag is true";
            p[a] = b
        };
        this.getResponseHeader = function(a) {
            return this.readyState >
                this.OPENED && d.headers[a] && !n ? d.headers[a] : null
        };
        this.getAllResponseHeaders = function() {
            if (this.readyState < this.HEADERS_RECEIVED || n) return "";
            var a = "",
                b;
            for (b in d.headers) a += b + ": " + d.headers[b] + "\r\n";
            return a.substr(0, a.length - 2)
        };
        this.send = function(a) {
            if (this.readyState !== this.OPENED) throw "INVALID_STATE_ERR: connection must be opened before send() is called";
            if (k) throw "INVALID_STATE_ERR: send has already been called";
            var g = !1,
                f = Url.parse(e.url);
            switch (f.protocol) {
                case "https:":
                    g = !0;
                case "http:":
                    var c =
                        f.hostname;
                    break;
                case void 0:
                case "":
                    c = "localhost";
                    break;
                default:
                    throw "Protocol not supported.";
            }
            var h = f.port || (g ? 443 : 80),
                f = f.pathname + (f.search ? f.search : "");
            this.setRequestHeader("Host", c);
            if (e.user) {
                "undefined" === typeof e.password && (e.password = "");
                var q = new Buffer(e.user + ":" + e.password);
                p.Authorization = "Basic " + q.toString("base64")
            }
            "GET" === e.method || "HEAD" === e.method ? a = null : a && (this.setRequestHeader("Content-Length", Buffer.byteLength(a)), p["Content-Type"] || this.setRequestHeader("Content-Type", "text/plain;charset\x3dUTF-8"));
            c = {
                host: c,
                port: h,
                path: f,
                method: e.method,
                headers: p
            };
            n = !1;
            if (!e.hasOwnProperty("async") || e.async) {
                g = g ? t.request : r.request;
                k = !0;
                if ("function" === typeof b.onreadystatechange) b.onreadystatechange();
                m = g(c, function(a) {
                    d = a;
                    d.setEncoding("utf8");
                    l(b.HEADERS_RECEIVED);
                    b.status = d.statusCode;
                    d.on("data", function(a) {
                        a && (b.responseText += a);
                        k && l(b.LOADING)
                    });
                    d.on("end", function() {
                        k && (l(b.DONE), k = !1)
                    });
                    d.on("error", function(a) {
                        b.handleError(a)
                    })
                }).on("error", function(a) {
                    b.handleError(a)
                });
                a && m.write(a);
                m.end()
            } else {
                h =
                    ".node-xmlhttprequest-sync-" + process.pid;
                fs.writeFileSync(h, "", "utf8");
                a = "var http \x3d require('http'), https \x3d require('https'), fs \x3d require('fs');var doRequest \x3d http" + (g ? "s" : "") + ".request;var options \x3d " + JSON.stringify(c) + ";var responseText \x3d '';var req \x3d doRequest(options, function(response) {response.setEncoding('utf8');response.on('data', function(chunk) {responseText +\x3d chunk;});response.on('end', function() {fs.writeFileSync('" + h + "', 'NODE-XMLHTTPREQUEST-STATUS:' + response.statusCode + ',' + responseText, 'utf8');});response.on('error', function(error) {fs.writeFileSync('" +
                    h + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');});}).on('error', function(error) {fs.writeFileSync('" + h + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');});" + (a ? "req.write('" + a.replace(/'/g, "\\'") + "');" : "") + "req.end();";
                for (syncProc = spawn(process.argv[0], ["-e", a]);
                    "" == (b.responseText = fs.readFileSync(h, "utf8")););
                syncProc.stdin.end();
                fs.unlinkSync(h);
                b.responseText.match(/^NODE-XMLHTTPREQUEST-ERROR:/) ? (a = b.responseText.replace(/^NODE-XMLHTTPREQUEST-ERROR:/, ""),
                    b.handleError(a)) : (b.status = b.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:([0-9]*),.*/, "$1"), b.responseText = b.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:[0-9]*,(.*)/, "$1"), l(b.DONE))
            }
        };
        this.handleError = function(a) {
            this.status = 503;
            this.statusText = a;
            this.responseText = a.stack;
            n = !0;
            l(this.DONE)
        };
        this.abort = function() {
            m && (m.abort(), m = null);
            p = q;
            this.responseXML = this.responseText = "";
            n = !0;
            this.readyState === this.UNSENT || this.readyState === this.OPENED && !k || this.readyState === this.DONE || (k = !1, l(this.DONE));
            this.readyState = this.UNSENT
        };
        this.addEventListener = function(a, b) {
            a in c || (c[a] = []);
            c[a].push(b)
        }
    };
var CryptoJS = CryptoJS || function(d, g) {
    var n = {},
        l = n.lib = {},
        b = l.Base = function() {
            function e() {}
            return {
                extend: function(a) {
                    e.prototype = this;
                    var b = new e;
                    a && b.mixIn(a);
                    b.$super = this;
                    return b
                },
                create: function() {
                    var e = this.extend();
                    e.init.apply(e, arguments);
                    return e
                },
                init: function() {},
                mixIn: function(e) {
                    for (var a in e) e.hasOwnProperty(a) && (this[a] = e[a]);
                    e.hasOwnProperty("toString") && (this.toString = e.toString)
                },
                clone: function() {
                    return this.$super.extend(this)
                }
            }
        }(),
        k = l.WordArray = b.extend({
            init: function(e, a) {
                e =
                    this.words = e || [];
                this.sigBytes = a != g ? a : 4 * e.length
            },
            toString: function(e) {
                return (e || h).stringify(this)
            },
            concat: function(e) {
                var a = this.words,
                    b = e.words,
                    k = this.sigBytes;
                e = e.sigBytes;
                this.clamp();
                if (k % 4)
                    for (var c = 0; c < e; c++) a[k + c >>> 2] |= (b[c >>> 2] >>> 24 - c % 4 * 8 & 255) << 24 - (k + c) % 4 * 8;
                else if (65535 < b.length)
                    for (c = 0; c < e; c += 4) a[k + c >>> 2] = b[c >>> 2];
                else a.push.apply(a, b);
                this.sigBytes += e;
                return this
            },
            clamp: function() {
                var e = this.words,
                    a = this.sigBytes;
                e[a >>> 2] &= 4294967295 << 32 - a % 4 * 8;
                e.length = d.ceil(a / 4)
            },
            clone: function() {
                var e =
                    b.clone.call(this);
                e.words = this.words.slice(0);
                return e
            },
            random: function(e) {
                for (var a = [], c = 0; c < e; c += 4) a.push(4294967296 * d.random() | 0);
                return k.create(a, e)
            }
        }),
        f = n.enc = {},
        h = f.Hex = {
            stringify: function(e) {
                var a = e.words;
                e = e.sigBytes;
                for (var c = [], b = 0; b < e; b++) {
                    var k = a[b >>> 2] >>> 24 - b % 4 * 8 & 255;
                    c.push((k >>> 4).toString(16));
                    c.push((k & 15).toString(16))
                }
                return c.join("")
            },
            parse: function(e) {
                for (var a = e.length, c = [], b = 0; b < a; b += 2) c[b >>> 3] |= parseInt(e.substr(b, 2), 16) << 24 - b % 8 * 4;
                return k.create(c, a / 2)
            }
        },
        c = f.Latin1 = {
            stringify: function(e) {
                var a =
                    e.words;
                e = e.sigBytes;
                for (var c = [], b = 0; b < e; b++) c.push(String.fromCharCode(a[b >>> 2] >>> 24 - b % 4 * 8 & 255));
                return c.join("")
            },
            parse: function(e) {
                for (var a = e.length, b = [], c = 0; c < a; c++) b[c >>> 2] |= (e.charCodeAt(c) & 255) << 24 - c % 4 * 8;
                return k.create(b, a)
            }
        },
        a = f.Utf8 = {
            stringify: function(e) {
                try {
                    return decodeURIComponent(escape(c.stringify(e)))
                } catch (v) {
                    throw Error("Malformed UTF-8 data");
                }
            },
            parse: function(e) {
                return c.parse(unescape(encodeURIComponent(e)))
            }
        },
        r = l.BufferedBlockAlgorithm = b.extend({
            reset: function() {
                this._data =
                    k.create();
                this._nDataBytes = 0
            },
            _append: function(e) {
                "string" == typeof e && (e = a.parse(e));
                this._data.concat(e);
                this._nDataBytes += e.sigBytes
            },
            _process: function(e) {
                var a = this._data,
                    c = a.words,
                    b = a.sigBytes,
                    f = this.blockSize,
                    h = b / (4 * f),
                    h = e ? d.ceil(h) : d.max((h | 0) - this._minBufferSize, 0);
                e = h * f;
                b = d.min(4 * e, b);
                if (e) {
                    for (var m = 0; m < e; m += f) this._doProcessBlock(c, m);
                    m = c.splice(0, e);
                    a.sigBytes -= b
                }
                return k.create(m, b)
            },
            clone: function() {
                var a = b.clone.call(this);
                a._data = this._data.clone();
                return a
            },
            _minBufferSize: 0
        });
    l.Hasher =
        r.extend({
            init: function() {
                this.reset()
            },
            reset: function() {
                r.reset.call(this);
                this._doReset()
            },
            update: function(a) {
                this._append(a);
                this._process();
                return this
            },
            finalize: function(a) {
                a && this._append(a);
                this._doFinalize();
                return this._hash
            },
            clone: function() {
                var a = r.clone.call(this);
                a._hash = this._hash.clone();
                return a
            },
            blockSize: 16,
            _createHelper: function(a) {
                return function(b, c) {
                    return a.create(c).finalize(b)
                }
            },
            _createHmacHelper: function(a) {
                return function(b, c) {
                    return m.HMAC.create(a, c).finalize(b)
                }
            }
        });
    var m =
        n.algo = {};
    return n
}(Math);
(function() {
    var d = CryptoJS,
        g = d.lib,
        n = g.WordArray,
        g = g.Hasher,
        l = [],
        b = d.algo.SHA1 = g.extend({
            _doReset: function() {
                this._hash = n.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
            },
            _doProcessBlock: function(b, f) {
                for (var k, c = this._hash.words, a = c[0], g = c[1], m = c[2], e = c[3], n = c[4], d = 0; 80 > d; d++) 16 > d ? l[d] = b[f + d] | 0 : (k = l[d - 3] ^ l[d - 8] ^ l[d - 14] ^ l[d - 16], l[d] = k << 1 | k >>> 31), k = (a << 5 | a >>> 27) + n + l[d], k = 20 > d ? k + ((g & m | ~g & e) + 1518500249) : 40 > d ? k + ((g ^ m ^ e) + 1859775393) : 60 > d ? k + ((g & m | g & e | m & e) - 1894007588) : k + ((g ^ m ^ e) - 899497514),
                    n = e, e = m, m = g << 30 | g >>> 2, g = a, a = k;
                c[0] = c[0] + a | 0;
                c[1] = c[1] + g | 0;
                c[2] = c[2] + m | 0;
                c[3] = c[3] + e | 0;
                c[4] = c[4] + n | 0
            },
            _doFinalize: function() {
                var b = this._data,
                    f = b.words,
                    d = 8 * this._nDataBytes,
                    c = 8 * b.sigBytes;
                f[c >>> 5] |= 128 << 24 - c % 32;
                f[(c + 64 >>> 9 << 4) + 15] = d;
                b.sigBytes = 4 * f.length;
                this._process()
            }
        });
    d.SHA1 = g._createHelper(b);
    d.HmacSHA1 = g._createHmacHelper(b)
})();
(function() {
    var d = CryptoJS,
        g = d.enc.Utf8;
    d.algo.HMAC = d.lib.Base.extend({
        init: function(d, l) {
            d = this._hasher = d.create();
            "string" == typeof l && (l = g.parse(l));
            var b = d.blockSize,
                k = 4 * b;
            l.sigBytes > k && (l = d.finalize(l));
            d = this._oKey = l.clone();
            l = this._iKey = l.clone();
            for (var f = d.words, h = l.words, c = 0; c < b; c++) f[c] ^= 1549556828, h[c] ^= 909522486;
            d.sigBytes = l.sigBytes = k;
            this.reset()
        },
        reset: function() {
            var d = this._hasher;
            d.reset();
            d.update(this._iKey)
        },
        update: function(d) {
            this._hasher.update(d);
            return this
        },
        finalize: function(d) {
            var g =
                this._hasher;
            d = g.finalize(d);
            g.reset();
            return g.finalize(this._oKey.clone().concat(d))
        }
    })
})();
var N = N || {};
N.Base64 = function() {
    var d, g, n;
    var l = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    var b = [];
    for (n = 0; n < l.length; n += 1) b[l[n]] = n;
    var k = function(a) {
        d = a;
        g = 0
    };
    var f = function() {
        if (!d || g >= d.length) return -1;
        var a = d.charCodeAt(g) & 255;
        g += 1;
        return a
    };
    var h = function() {
        if (!d) return -1;
        for (;;) {
            if (g >= d.length) return -1;
            var a = d.charAt(g);
            g += 1;
            if (b[a]) return b[a];
            if ("A" === a) return 0
        }
    };
    var c = function(a) {
        a = a.toString(16);
        1 === a.length && (a = "0" + a);
        return unescape("%" + a)
    };
    return {
        encodeBase64: function(a) {
            var b;
            k(a);
            a = "";
            var c = Array(3);
            var e = 0;
            for (b = !1; !b && -1 !== (c[0] = f());) c[1] = f(), c[2] = f(), a += l[c[0] >> 2], -1 !== c[1] ? (a += l[c[0] << 4 & 48 | c[1] >> 4], -1 !== c[2] ? (a += l[c[1] << 2 & 60 | c[2] >> 6], a += l[c[2] & 63]) : (a += l[c[1] << 2 & 60], a += "\x3d", b = !0)) : (a += l[c[0] << 4 & 48], a += "\x3d", a += "\x3d", b = !0), e += 4, 76 <= e && (a += "\n", e = 0);
            return a
        },
        decodeBase64: function(a) {
            var b;
            k(a);
            a = "";
            var d = Array(4);
            for (b = !1; !b && -1 !== (d[0] = h()) && -1 !== (d[1] = h());) d[2] = h(), d[3] = h(), a += c(d[0] << 2 & 255 | d[1] >> 4), -1 !== d[2] ? (a += c(d[1] << 4 & 255 | d[2] >> 2), -1 !== d[3] ? a += c(d[2] << 6 & 255 |
                d[3]) : b = !0) : b = !0;
            return a
        }
    }
}(N);
N = N || {};
N.authors = ["aalonsog@dit.upm.es", "prodriguez@dit.upm.es", "jcervino@dit.upm.es"];
N.version = .1;
N = N || {};
N.API = function(d) {
    var g = function(b, k, f, g, c, a, r, m) {
        if (void 0 === a) {
            var e = d.API.params.service;
            var h = d.API.params.key;
            c = d.API.params.url + c
        } else e = a.service, h = a.key, c = a.url + c;
        if ("" === e || "" === h) console.log("ServiceID and Key are required!!");
        else {
            a = (new Date).getTime();
            var t = Math.floor(99999 * Math.random());
            var u = a + "," + t;
            var q = "MAuth realm\x3dhttp://marte3.dit.upm.es,mauth_signature_method\x3dHMAC_SHA1";
            r && m && (r = l(r), q = q + ",mauth_username\x3d" + r + ",mauth_role\x3d" + m, u += "," + r + "," + m);
            r = n(u, h);
            q += ",mauth_serviceid\x3d";
            q +=
                e;
            q += ",mauth_cnonce\x3d";
            q += t;
            q += ",mauth_timestamp\x3d";
            q += a;
            q += ",mauth_signature\x3d";
            q += r;
            var p = new XMLHttpRequest;
            p.onreadystatechange = function() {
                if (4 === p.readyState) switch (p.status) {
                    case 100:
                    case 200:
                    case 201:
                    case 202:
                    case 203:
                    case 204:
                    case 205:
                        b(p.responseText);
                        break;
                    default:
                        void 0 !== k && k(p.status + " Error" + p.responseText, p.status)
                }
            };
            p.open(f, c, !0);
            p.setRequestHeader("Authorization", q);
            void 0 !== g ? (p.setRequestHeader("Content-Type", "application/json"), p.send(JSON.stringify(g))) : p.send()
        }
    };
    var n =
        function(b, k) {
            b = CryptoJS.HmacSHA1(b, k).toString(CryptoJS.enc.Hex);
            return d.Base64.encodeBase64(b)
        };
    var l = function(b) {
        b = b.toLowerCase();
        var d = {
                a: "[\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5]",
                ae: "\u00e6",
                c: "\u00e7",
                e: "[\u00e8\u00e9\u00ea\u00eb]",
                i: "[\u00ec\u00ed\u00ee\u00ef]",
                n: "\u00f1",
                o: "[\u00f2\u00f3\u00f4\u00f5\u00f6]",
                oe: "\u0153",
                u: "[\u00f9\u00fa\u00fb\u0171\u00fc]",
                y: "[\u00fd\u00ff]"
            },
            f;
        for (f in d) b = b.replace(new RegExp(d[f], "g"), f);
        return b
    };
    return {
        params: {
            service: void 0,
            key: void 0,
            url: void 0
        },
        init: function(b,
            k, f) {
            d.API.params.service = b;
            d.API.params.key = k;
            d.API.params.url = f
        },
        createRoom: function(b, d, f, h, c) {
            h || (h = {});
            g(function(a) {
                a = JSON.parse(a);
                d(a)
            }, f, "POST", {
                name: b,
                options: h
            }, "rooms", c)
        },
        getRooms: function(b, d, f) {
            g(b, d, "GET", void 0, "rooms", f)
        },
        getRoom: function(b, d, f, h) {
            g(d, f, "GET", void 0, "rooms/" + b, h)
        },
        updateRoom: function(b, d, f, h, c, a) {
            g(f, h, "PUT", {
                name: d,
                options: c
            }, "rooms/" + b, a)
        },
        patchRoom: function(b, d, f, h, c, a) {
            g(f, h, "PATCH", {
                name: d,
                options: c
            }, "rooms/" + b, a)
        },
        deleteRoom: function(b, d, f, h) {
            g(d, f, "DELETE",
                void 0, "rooms/" + b, h)
        },
        createToken: function(b, d, f, h, c, a) {
            g(h, c, "POST", void 0, "rooms/" + b + "/tokens", a, d, f)
        },
        createService: function(b, d, f, h, c) {
            g(f, h, "POST", {
                name: b,
                key: d
            }, "services/", c)
        },
        getServices: function(b, d, f) {
            g(b, d, "GET", void 0, "services/", f)
        },
        getService: function(b, d, f, h) {
            g(d, f, "GET", void 0, "services/" + b, h)
        },
        deleteService: function(b, d, f, h) {
            g(d, f, "DELETE", void 0, "services/" + b, h)
        },
        getUsers: function(b, d, f, h) {
            g(d, f, "GET", void 0, "rooms/" + b + "/users/", h)
        },
        getUser: function(b, d, f, h, c) {
            g(f, h, "GET", void 0,
                "rooms/" + b + "/users/" + d, c)
        },
        deleteUser: function(b, d, f, h, c) {
            g(f, h, "DELETE", void 0, "rooms/" + b + "/users/" + d, c)
        }
    }
}(N);
module.exports = N;