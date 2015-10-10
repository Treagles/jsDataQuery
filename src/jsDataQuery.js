/*globals sqlFormatter,define,quote,global */
/*jslint nomen: true*/
/*jslint bitwise: true */

;
'use strict';

(function (_) {
        /** Used as a safe reference for `undefined` in pre-ES5 environments. (thanks lodash)*/
        var undefined;

        /**
         * Escapes special characters in a string
         * @method myRegExpEscape
         * @private
         * @param str the string to be escaped
         * @return {String} escaped string
         */
        var myRegExpEscape = function (str) {
            return str.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1'); // str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
        };

        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== "function") {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    FNOP = function () {
                    },
                    fBound = function () {
                        return fToBind.apply(this instanceof FNOP && oThis ? this : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                FNOP.prototype = this.prototype;
                fBound.prototype = new FNOP();

                return fBound;
            };
        }

        /** Used to determine if values are of the language type `Object`. (thanks lodash)*/
        var objectTypes = {
            'function': true,
            'object': true
        };

        /**
         * Used as a reference to the global object. (thanks lodash)
         *
         * The `this` value is used if it is the global object to avoid Greasemonkey's
         * restricted `window` object, otherwise the `window` object is used.
         */
        var root = (objectTypes[typeof window] && window !== (this && this.window)) ? window : this;

        /** Detect free variable `exports`. (thanks lodash) */
        var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

        /** Detect free variable `module`. (thanks lodash)*/
        var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

        /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. (thanks lodash)*/
        var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
        if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
            root = freeGlobal;
        }

        /** Detect the popular CommonJS extension `module.exports`. Tthanks lodash */
        var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;


        function isAngularField(f) {
            return (f.substr(0, 2) === '$$');
        }

        /**
         * Provides utility functions to filter data and to create sql condition over database.
         * Every function returns a function f where:
         * f ( r, context )  = true if r matches condition in the given context
         * f( r, context ) = result  evaluated in the given context if f is a computation function
         * f.isTrue = true if f is always true
         * f.isFalse = true if f is always false
         * f ( r, context) = undefined if there is no sufficient data to evaluate f
         * null fields and undefined fields are all considered (and returned) as null values (so they compare equal)
         * f.toSql(formatter, context)  = a string representing the underlying condition to be applied to a database.
         *  formatter is used to obtain details about making the expression, see sqlFormatter for an example
         *  [context] is the context into which the expression have to be evaluated
         *  @module jsDataQuery
         */

        /**
         * Function with ability to be converted to sql. When invoked gives a result depending on the arguments.
         * @class sqlFun
         * @type sqlFun
         */


        /**
         * Converts a SqlFun into a string
         * @method toSql
         * @param {sqlFormatter} formatter  used to obtain details about making the expression,
         *      see sqlFormatter for an example
         * @param {object} context  is the context into which the expression have to be evaluated
         * @return {string} //the sql representation of the expression
         */



        /**
         * constant true if it is a constant expression, false otherwise
         * @property isTrue
         * @type boolean
         */

        /**
         * name of this field in the select result
         * @property fieldName
         * @type string
         **/

        /**
         * true if the function is the true constant
         * @property isTrue
         * @type boolean
         **/

        /**
         * true if the function is the false constant
         * @property isFalse
         * @type boolean
         **/

        /**
         *  table to which this field has been taken in a select
         * @property  tableName
         * @type string
         */

        /**
         * Compare function provider to help building conditions that can be applyed both to collections,
         *  using the returned function as a filter, or to a database, using the toSql() method
         *  @class jsDataQuery
         */

        /**
         * Check if an object is the null or undefined constant
         * @method isNullOrUndefined
         * @param {sqlFun|undefined|null} o
         * @return {boolean} true if o is null or undefined
         */
        function isNullOrUndefined(o) {
            return _.isUndefined(o) || _.isNull(o);
        }

        /**
         * @private
         * Adds some useful methods and properties to a function in order to transform it into a sqlFun
         * @method toSqlFun
         * @param {function} f
         * @param {function} toSql
         * @return {sqlFun}
         */
        function toSqlFun(f, toSql) {
            var tryInvoke = f();
            if (tryInvoke !== undefined) {
                f = constant(tryInvoke);
            } else {
                f.constant = false;
                f.toSql = toSql;
            }
            f.as = as;
            return f;
        }


        /**
         * Establish the output name for an expression
         * @method as
         * @param {string} fieldName
         * @return {sqlFun}
         */
        function as(fieldName) {
            this.fieldName = fieldName;
            return this;
        }



        /**
         * Transforms a generic function into a sqlFun.
         * @method context
         * @param environmentFunction A function to apply to a generic environment
         * @return {sqlFun}
         * @example if environment = {a:1, b:2} and environmentFunction = function (env){return env.a}
         *   context(environmentFunction) applied to environment will return 1
         */
        function context(environmentFunction) {
            var f = function (environment) {
                if (environment === undefined) {
                    return undefined;
                }
                return environmentFunction(environment);
            };
            f.toSql = function (formatter, environment) {
                return formatter.quote(environmentFunction(environment));
            };
            f.as = as;
            f.constant = false;
            f.toString = function () {
                return 'context(' + environmentFunction.toString() + ')';
            };
            return f;
        }


        /**
         * Gets a field from an object. This is a very important function to distinguish between generic strings and
         *  field names.
         * @method field
         * @param fieldName
         * @param {string} [tableName]
         * @return {sqlFun} f such that
         *  f(r) = r[fieldName]
         *  f.toSql() = 'fieldName' or 'tableName.fieldName' where tableName is specified
         *
         */
        function field(fieldName, tableName) {
            var f = function (r) {
                if (r === undefined) {
                    return undefined;
                }
                if (r.hasOwnProperty(fieldName)) {
                    return r[fieldName];
                }
                return null;
            };
            f.tableName = tableName;
            f.fieldName = fieldName;
            f.toString = function () {
                return fieldName
            };
            var toSql = function (formatter) {
                return formatter.field(fieldName, tableName);
            };
            return toSqlFun(f, toSql);
        }


        /**
         * @private
         * transform strings into fields, leaves other things unchanged
         * For example 'a' becomes f(r)-> r['a'],
         *  12 is returned unchanged,
         *  a function is returned  unchanged
         * @method autofield
         * @param {sqlFun|string} p
         * @return {sqlFun}
         */
        function autofield(p) {
            if (_.isString(p)) {
                return field(p); //p is considered a field name
            }
            return p;
        }


        /**
         * Defines a constant function. The toSql method invokes the formatter.quote function
         * @method constant
         * @param {object} K is a literal
         * @return {sqlFun} f such that f()= k, f.toSql()= formatter.quote(k)
         */
        function constant(K) {
            var k = K;
            if (k === undefined) {
                k = null;
            }
            var f = function () {
                return k;
            };
            f.toString = function () {
                return 'constant(' + k.toString() + ')'
            };
            f.constant = true;
            f.as = as;
            if (k === true) {
                f.isTrue = true;
                f.toSql = function (formatter) {
                    return formatter.eq(1, 1);
                };
                return f;
            }

            if (k === false) {
                f.isFalse = true;
                f.toSql = function (formatter) {
                    return formatter.eq(1, 0);
                };
                return f;
            }

            /*
             The .toSql method of a constant calls directly the quote method of the formatter. HERE is where the
             tree top-down scan ends.
             */
            f.toSql = function (formatter) {
                return formatter.quote(k);
            };
            return f;
        }


        /**
         * Evaluates an expression in a given context
         * @method calc
         * @param expr function representing a generic expression
         * @param {object} r
         * @param {object} context
         * @return {Object|string|null|undefined} expr evaluated in the context r
         *  undefined are returned as null constant
         */
        function calc(expr, r, context) {
            if (isNullOrUndefined(expr)) {
                return expr;
            }
            //if expr has .toSql extension, it can be directly evaluated with a simple invoke. If it is called with
            // undefined, and it is not a constant, it must return undefined. In no other case undefined is
            // allowed as return value from sqlFun invocation
            if (expr.toSql) {
                return expr(r, context);
            }
            //if expr is an array, a new array is returned where each element is the evaluation of the
            // corresponding element in the original array
            if (_.isArray(expr)) {
                return _.map(expr, function (el) {
                    return calc(el, r, context);
                });
            }
            //any other object is returned as is
            return expr;
        }

        /**
         * Check if an expression evaluates to null
         * @method isNull
         * @param expr1
         * @return {sqlFun} f where f(expr) = true if expr evaluates to null or undefined
         *  f.toSql() = something like '(EXPR is null)' where EXPR is the sql representation of the given expr
         */
        function isNull(expr1) {
            var expr = autofield(expr1);
            var f = function (r, context) {
                if (isNullOrUndefined(expr)) {
                    return true;
                }
                var res = calc(expr, r, context);
                if (res === undefined) {
                    return undefined;
                }
                return (res === null);
            };
            var toSql = function (formatter, context) {
                return formatter.isNull(expr, context);
            };
            return toSqlFun(f, toSql);
        }


        /**
         * @method minus
         * @param expr1
         * @return {sqlFun} f where f(r) = - r. r should evaluate into a number
         */
        function minus(expr1) {
            var expr = autofield(expr1);
            var f = function (r, context) {
                var v1 = calc(expr, r, context);
                if (isNullOrUndefined(v1)) {
                    return v1;
                }
                return -v1;
            };
            f.toString = function () {
                return '-' + expr.toString();
            };
            var toSql = function (formatter, context) {
                return formatter.minus(expr, context);
            };
            return toSqlFun(f, toSql);
        }


        /**
         * @method not
         * @param expr1
         * @return {sqlFun} f where f(r) = not r. r should evaluate into a boolean
         */
        function not(expr1) {
            var expr = autofield(expr1);
            var f = function (r, context) {
                var v1 = calc(expr, r, context);
                if (isNullOrUndefined(v1)) {
                    return v1;
                }
                return !v1;
            };
            f.toString = function () {
                return 'not(' + expr.toString() + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.not(expr, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * Check if the nth bit of expression is set
         * @method bitSet
         * @param expression note: this is autofield-ed, so if you can use a field name for it
         * @param nbit
         * @return {sqlFun}
         */
        function bitSet(expression, nbit) {
            var expr = autofield(expression),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2;
                    if (v1 === undefined) {
                        return undefined;
                    }
                    if (v1 == null) {
                        return false;
                    }
                    v2 = calc(nbit, r, context);
                    if (v2 === undefined) {
                        return undefined;
                    }
                    if (v2 === null) {
                        return false;
                    }
                    return (v1 & (1 << v2)) !== 0;
                };
            f.toString = function () {
                return 'bitSet(' + expr.toString() + ',' + nbit.toString() + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.bitSet(expr, nbit, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * Check if the nth bit of expression is not set
         * @method bitClear
         * @param expression note: this is autofield-ed, so if you can use a field name for it
         * @param nbit
         * @return {sqlFun}
         */
        function bitClear(expression, nbit) {
            var expr = autofield(expression),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2;
                    if (v1 === undefined) {
                        return undefined;
                    }
                    if (v1 === null) {
                        return false;
                    }
                    v2 = calc(nbit, r, context);
                    if (v2 === undefined) {
                        return undefined;
                    }
                    if (v2 === null) {
                        return false;
                    }
                    return (v1 & (1 << v2)) === 0;
                };
            f.toString = function () {
                return 'bitClear(' + expr.toString() + ',' + nbit.toString() + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.bitClear(expr, nbit, context);
            };
            return toSqlFun(f, toSql);

        }


        /**
         * check if expr1 & mask === val & mask
         * @method testMask
         * @param expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param {expression} mask
         * @param {expression} val
         * @return {sqlFun}
         */
        function testMask(expr1, mask, val) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2, v3;
                    if (v1 == undefined) {
                        return undefined;
                    }
                    if (v1 == null) {
                        return false;
                    }
                    v2 = calc(mask, r, context);
                    if (v2 == undefined) {
                        return undefined;
                    }
                    if (v2 == null) {
                        return false;
                    }
                    v3 = calc(val, r, context);
                    if (v3 == undefined) {
                        return undefined;
                    }
                    if (v3 == null) {
                        return false;
                    }
                    return ((v1 & v2) === (v3 & v2));
                };

            f.toString = function () {
                return 'testMask(' + expr.toString() + ',' + mask.toString() + ',' + val.toString() + ')';
            };

            var toSql = function (formatter, context) {
                return formatter.testMask(expr, mask, val, context);
            };
            return toSqlFun(f, toSql);
        }


        /**
         * Check if expr1 evaluates between min and max
         * @method between
         * @param expr1  note: this is autofield-ed, so if you can use a field name for it
         * @param min
         * @param max
         * @returns {sqlFun}
         */
        function between(expr1, min, max) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2, v3;
                    if (v1 === undefined) {
                        return undefined;
                    }
                    if (v1 === null) {
                        return false;
                    }
                    v2 = calc(min, r, context);
                    if (v2 === undefined) {
                        return undefined;
                    }
                    if (v2 === null) {
                        return false;
                    }
                    v3 = calc(max, r, context);
                    if (v3 === undefined) {
                        return undefined;
                    }
                    if (v3 === null) {
                        return false;
                    }
                    return (v1 >= v2) && (v1 <= v3);
                };
            f.toString = function () {
                return 'between(' + expr.toString() + ',' + min.toString() + ',' + max.toString() + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.between(expr, min, max, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * Checks if expr1 is (sql-like) mask, where mask can contain * and _ characters
         * @method like
         * @param expr1 {string} expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param mask {string} mask is a string or a function that evaluates into a string
         * @returns {sqlFun}
         * @example like('a','s%') compiles into (a like 's%')
         *        like(const('a'),'s%') compiles into ('a' like 's%')
         */
        function like(expr1, mask) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2, likeExpr;
                    if (v1 === undefined) {
                        return undefined;
                    }
                    if (v1 === null) {
                        return false;
                    }
                    v2 = calc(mask, r, context);
                    if (v2 === undefined) {
                        return undefined;
                    }
                    if (v2 === null) {
                        return false;
                    }
                    likeExpr = myRegExpEscape(v2);
                    return (new RegExp(likeExpr.replace(new RegExp('%', 'g'), ".*").replace(new RegExp('_', 'g'), ".")).exec(v1) !== null);
                };
            f.toString = function () {
                return 'like(' + expr.toString() + ',' + mask.toString() + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.like(expr, mask, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * Finds distinct values of a field
         * @method distinctVal
         * @param {object[]} arr
         * @param fieldname
         * @returns {object[]|undefined}
         */
        function distinctVal(arr, fieldname) {
            if (arr === undefined) {
                return undefined;
            }
            if (fieldname) {
                return _.uniq(_.map(arr, fieldname));
            }
            return _.uniq(arr);
        }

        /**
         * Finds distinct values of a field
         * @method distinctVal
         * @param {sqlFun} exprList
         * @returns {sqlFun}
         */
        function distinct(exprList) {
            var f = function (arr, context) {
                if (arr === undefined) {
                    return undefined;
                }
                var someUndefined = false,
                    res = _.map(arr, function (a) {
                        return _.reduce(exprList, function (accumulator, expr) {
                            var o = calc(expr, a, context);
                            if (o === undefined) {
                                someUndefined = true;
                            }
                            accumulator.push(o);
                            return accumulator;

                        }, []);
                    });
                if (someUndefined) {
                    return undefined;
                }
                return _.uniq(res);
            };
            f.toString = function () {
                return 'distinct(' + arrayToString(exprList) + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.distinct(exprList, context);
            };
            return toSqlFun(f, toSql);
        }


        /**
         * checks if expr1 is in the array list
         * @method isIn
         * @param expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param list {Array} Array or function that evaluates into an array
         * @returns {sqlFun}
         */
        function isIn(expr1, list) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    var v = calc(expr, r, context), l;
                    if (v === undefined) {
                        return undefined;
                    }
                    if (v === null) {
                        return false;
                    }

                    l = calc(list, r, context);
                    if (l === undefined) {
                        return undefined;
                    }
                    if (l === null) {
                        return false;
                    }
                    return (_.indexOf(l, v) >= 0);
                };
            f.toString = function () {
                return 'isIn(' + expr.toString() + ',' + arrayToString(list) + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.isIn(expr, list, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * checks if expr1 is not in the array list
         * @method isNotIn
         * @param expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param list {Array} Array or function that evaluates into an array
         * @returns {sqlFun}
         */
        function isNotIn(expr1, list) {
            return not(isIn(expr1, list));
        }

        function toString(o) {
            if (o === undefined) {
                return 'undefined';
            }
            if (o === null) {
                return 'null';
            }
            return o.toString();
        }

        /**
         * checks if expr1 evaluates equal to expr2
         * @method eq
         * @param {sqlFun} expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param {sqlFun} expr2
         * @returns {sqlFun}
         */
        function eq(expr1, expr2) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2;
                    if (v1 === undefined) {
                        return undefined;
                    }
                    v2 = calc(expr2, r, context);
                    if (v2 === undefined) {
                        return undefined;
                    }
                    return v1 === v2;
                };

            f.toString = function () {
                return 'eq(' + toString(expr) + ',' + toString(expr2) + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.eq(expr, expr2, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * checks if expr1 evaluates different from expr2
         * @method ne
         * @param {sqlFun} expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param {sqlFun} expr2
         * @returns {sqlFun}
         */
        function ne(expr1, expr2) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2;
                    if (v1 === undefined) {
                        return undefined;
                    }
                    v2 = calc(expr2, r, context);
                    if (v2 === undefined) {
                        return undefined;
                    }
                    return v1 !== v2;
                };
            f.toString = function () {
                return 'ne(' + expr.toString() + ',' + expr2.toString() + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.ne(expr, expr2, context);
            };
            return toSqlFun(f, toSql);
        }


        /**
         * checks if expr1 evaluates less than from expr2
         * @method lt
         * @param {sqlFun} expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param {sqlFun} expr2
         * @returns {sqlFun}
         */
        function lt(expr1, expr2) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2;
                    if (v1 === undefined) {
                        return undefined;
                    }
                    if (v1 === null) {
                        return false;
                    }
                    v2 = calc(expr2, r, context);
                    if (v2 === undefined) {
                        return undefined;
                    }
                    if (v2 === null) {
                        return false;
                    }
                    return v1 < v2;
                };
            f.toString = function () {
                return 'lt(' + expr.toString() + ',' + expr2.toString() + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.lt(expr, expr2, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * checks if expr1 evaluates less than or equal to from expr2
         * @method le
         * @param {sqlFun} expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param {sqlFun} expr2
         * @returns {sqlFun}
         */
        function le(expr1, expr2) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2;
                    if (v1 === undefined) {
                        return undefined;
                    }
                    if (v1 === null) {
                        return false;
                    }

                    v2 = calc(expr2, r, context);
                    if (v2 === undefined) {
                        return undefined;
                    }
                    if (v2 === null) {
                        return false;
                    }
                    return v1 <= v2;
                };
            f.toString = function () {
                return 'le(' + expr.toString() + ',' + expr2.toString() + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.le(expr, expr2, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * checks if expr1 evaluates greater than expr2
         * @method gt
         * @param {sqlFun} expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param {sqlFun} expr2
         * @returns {sqlFun}
         */
        function gt(expr1, expr2) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2;
                    if (v1 === undefined) {
                        return undefined;
                    }
                    if (v1 === null) {
                        return false;
                    }
                    v2 = calc(expr2, r, context);
                    if (v2 === undefined) {
                        return undefined;
                    }
                    if (v2 === null) {
                        return false;
                    }

                    return v1 > v2;
                };
            f.toString = function () {
                return 'gt(' + expr.toString() + ',' + expr2.toString() + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.gt(expr, expr2, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * checks if expr1 evaluates greater than or equal to expr2
         * @method ge
         * @param expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param expr2
         * @returns {sqlFun}
         */
        function ge(expr1, expr2) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    var v1 = calc(expr, r, context), v2;
                    if (v1 === undefined) {
                        return undefined;
                    }
                    if (v1 === null) {
                        return false;
                    }
                    v2 = calc(expr2, r, context);
                    if (v2 === undefined) {
                        return undefined;
                    }
                    if (v2 === null) {
                        return false;
                    }

                    return v1 >= v2;
                };

            f.toString = function () {
                return 'ge(' + toString(expr) + ',' + toString(expr2) + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.ge(expr, expr2, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * checks if at least one of supplied expression evaluates to a truthy value
         * @method or
         * @param {sqlFun[]} arr  array or list of expression
         * @returns {sqlFun}
         */
        function or(arr) {
            var a = arr,
                alwaysTrue = false,
                f;
            if (!_.isArray(a)) {
                a = [].slice.call(arguments);
            }
            var optimizedArgs = _.filter(a, function (el) {
                if (el === undefined) {
                    return false;
                }
                if (el === null) {
                    return false;
                }

                if (el === false) {
                    return false;
                }
                if (el.isFalse) {
                    return false;
                }

                if (el === true || el.isTrue) {
                    alwaysTrue = true;
                }
                return true;
            });
            if (alwaysTrue) {
                return constant(true);
            }
            if (optimizedArgs.length === 0) {
                return constant(false);
            }

            f = function (r, context) {
                var i,
                    someUndefined = false;
                for (i = 0; i < optimizedArgs.length; i += 1) {
                    var x = calc(optimizedArgs[i], r, context);
                    if (x === true) {
                        return true;
                    }
                    if (x === undefined) {
                        someUndefined = true;
                    }
                }
                if (someUndefined) {
                    return undefined;
                }
                return false;
            };
            f.toString = function () {
                return 'or(' + arrayToString(a) + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.joinOr(_.map(optimizedArgs, function (v) {
                    return formatter.toSql(v, context);
                }));
            };
            return toSqlFun(f, toSql);
        }

        /**
         * return the first object not null in the  array parameter
         * @param {sqlFun[]} arr
         * @returns {sqlFun}
         */
        function coalesce(arr) {
            var a = arr,
                f;
            if (!_.isArray(a)) {
                a = [].slice.call(arguments);
            }
            f = function (r, context) {
                var i;
                for (i = 0; i < a.length; i += 1) {
                    var x = calc(a[i], r, context);
                    if (x === undefined) {
                        return undefined;
                    }
                    if (x !== null) {
                        return x;
                    }
                }
                return null;
            };
            f.toString = function () {
                return 'coalesce(' + arrayToString(a) + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.coalesce(_.map(a, function (v) {
                    return formatter.toSql(v, context);
                }));
            };
            return toSqlFun(f, toSql);
        }


        /**
         * checks if expr1 is null or equal to expr2
         * @method isNullOrEq
         * @param expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param expr2
         * @return {sqlFun}
         */
        function isNullOrEq(expr1, expr2) {
            var expr = autofield(expr1);
            return or(isNull(expr), eq(expr, expr2));
        }

        /**
         * checks if expr1 is null or greater than expr2
         * @method isNullOrGt
         * @param expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param expr2
         * @returns {sqlFun}
         */
        function isNullOrGt(expr1, expr2) {
            var expr = autofield(expr1);
            return or(isNull(expr), gt(expr, expr2));
        }

        /**
         * checks if expr1 is null or greater than or equal to expr2
         * @method isNullOrGe
         * @param expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param expr2
         * @return {sqlFun}
         */
        function isNullOrGe(expr1, expr2) {
            var expr = autofield(expr1);
            return or(isNull(expr), ge(expr, expr2));
        }

        /**
         * checks if expr1 is null or less than expr2
         * @method isNullOrLt
         * @param expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param expr2
         * @return {sqlFun}
         */
        function isNullOrLt(expr1, expr2) {
            var expr = autofield(expr1);
            return or(isNull(expr), lt(expr, expr2));
        }

        /**
         * checks if expr1 is null or less than or equal to expr2
         * @method isNullOrLe
         * @param {sqlFun} expr1 note: this is autofield-ed, so if you can use a field name for it
         * @param {sqlFun} expr2
         * @returns {sqlFun}
         */
        function isNullOrLe(expr1, expr2) {
            var expr = autofield(expr1);
            return or(isNull(expr), le(expr, expr2));
        }

        /**
         * Evaluates the maximum value of an expression in a table. If any undefined is found, return undefined.
         * Null are skipped. If all is null return null
         * @method max
         * @param {sqlFun} expr1
         * @returns {sqlFun}
         */
        function max(expr1) {
            var expr = autofield(expr1),
                f = function (arr, context) {
                    if (arr === undefined) {
                        return undefined;
                    }
                    var m = null;
                    _.forEach(arr, function (el) {
                        var val = calc(expr, el, context);
                        if (val === undefined) {
                            m = undefined; //if any undefined is found, return undefined
                            return false;
                        }
                        if (m === null) {
                            m = val;
                            return;
                        }
                        if (val === null) {
                            return;
                        }
                        if (val > m) {
                            m = val;
                        }
                    });
                    return m;
                };
            f.toString = function () {
                return 'max(' + expr.toString() + ')';
            };

            f.grouping = true;
            var toSql = function (formatter, context) {
                return formatter.max(expr, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * Evaluates the minimum value of an expression in a table. If any undefined is found, return undefined.
         * Null are skipped. If all is null return null
         * @method min
         * @param {sqlFun} expr1
         * @returns {sqlFun}
         */
        function min(expr1) {
            var expr = autofield(expr1),
                f = function (arr, context) {
                    if (arr === undefined) {
                        return undefined;
                    }
                    var m = null;
                    _.forEach(arr, function (el) {
                        var val = calc(expr, el, context);
                        if (val === undefined) {
                            m = undefined; //if any undefined is found, return undefined
                            return false;
                        }
                        if (m === null) {
                            m = val;
                            return;
                        }
                        if (val === null) {
                            return;
                        }
                        if (val < m) {
                            m = val;
                        }
                    });
                    return m;
                };
            f.toString = function () {
                return 'min(' + expr.toString() + ')';
            };

            f.grouping = true;
            var toSql = function (formatter, context) {
                return formatter.min(expr, context);
            };
            return toSqlFun(f, toSql);
        }


        /**
         * @method substring
         * @param {sqlFun} expr1
         * @param {number} start
         * @param {number} len
         * @returns {sqlFun}
         */
        function substring(expr1, start, len) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    if (r === undefined) {
                        return undefined;
                    }
                    var vExpr = calc(expr, r, context), vStart, vLen;
                    if (vExpr === undefined) {
                        return undefined;
                    }
                    if (vExpr === null) {
                        return null;
                    }

                    vStart = calc(start, r, context);
                    if (vStart === undefined) {
                        return undefined;
                    }
                    if (vStart === null) {
                        return null;
                    }
                    vStart -= 1; //javascript substring starting index is 0, sql is 1
                    vLen = calc(len, r, context);
                    if (vLen === undefined) {
                        return undefined;
                    }
                    if (vLen === null) {
                        return null;
                    }
                    if (vStart < 0) {
                        vStart = 0;
                    }
                    return vExpr.substr(vStart, vLen);
                };
            f.toString = function () {
                return 'substring(' + toString(expr) + ',' + toString(start) + ',' + toString(len) + ')';
            };

            var toSql = function (formatter, context) {
                return formatter.substring(expr, start, len, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * Converts a generic expression into an integer
         * @method convertToInt
         * @param {sqlFun} expr1
         * @returns {sqlFun}
         */
        function convertToInt(expr1) {

            var expr = autofield(expr1),
                f = function (r, context) {
                    if (r === undefined) {
                        return undefined;
                    }
                    var vExpr = calc(expr, r, context);
                    if (vExpr === undefined) {
                        return undefined;
                    }
                    if (vExpr === null || vExpr === '') {
                        return null;
                    }
                    return parseInt(vExpr, 10);
                };
            f.toString = function () {
                return 'convertToInt(' + expr.toString() + ')';
            };

            var toSql = function (formatter, context) {
                return formatter.convertToInt(expr, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * Converts a generic expression into a string
         * @method convertToString
         * @param {sqlFun} expr1
         * @param {number} maxLen maximum string len
         * @returns {sqlFun}
         */
        function convertToString(expr1, maxLen) {
            var expr = autofield(expr1),
                f = function (r, context) {
                    if (r === undefined) {
                        return undefined;
                    }
                    var vExpr = calc(expr, r, context);
                    if (vExpr === undefined) {
                        return undefined;
                    }
                    if (vExpr === null) {
                        return null;
                    }
                    return vExpr.toString().substr(0, maxLen);
                };
            f.toString = function () {
                return 'convertToString(' + expr.toString() + ',' + maxLen.toString() + ')';
            };

            var toSql = function (formatter, context) {
                return formatter.convertToString(expr, maxLen, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * checks if all supplied expression evaluate to truthy values
         * @method and
         * @param arr {Array} array or list of expression
         * @return {sqlFun}
         */
        function and(arr) {
            var a = arr,
                alwaysFalse = false,
                f;
            if (!_.isArray(a)) {
                a = [].slice.call(arguments);
            }
            var optimizedArgs = _.filter(a, function (el) {
                if (el === undefined) {
                    return false;
                }
                if (el === null) {
                    return false;
                }
                if (el === true || el.isTrue) {
                    return false;
                }
                if (el === false || el.isFalse) {
                    alwaysFalse = true;
                }
                return true;
            });

            if (alwaysFalse) {
                return constant(false);
            }

            if (optimizedArgs.length === 0) {
                return constant(true);
            }

            f = function (r, context) {
                var i;
                var someUndefined = false;
                for (i = 0; i < optimizedArgs.length; i += 1) {
                    var x = calc(optimizedArgs[i], r, context);
                    if (x === false) {
                        return false;
                    }
                    if (x === undefined) {
                        someUndefined = true;
                    }
                }
                if (someUndefined) {
                    return undefined;
                }
                return true;
            };
            f.toString = function () {
                return 'and(' + arrayToString(a) + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.joinAnd(_.map(optimizedArgs, function (v) {
                    return formatter.toSql(v, context);
                }));
            };

            return toSqlFun(f, toSql);
        }


        /**
         * Compares a set of keys of an object with an array of values or with fields of another object
         *  values can be an array or an object
         * @method mcmp
         * @param {string[]} keys
         * @param values
         * @param {string} [alias]
         * @return {sqlFun} f(r) = true if :
         *  case values is an array: r[keys[i]] = values[i] for each i=0..keys.length-1
         *  case values is an object: r[keys[i]] = values[keys[i]] for each i=0..keys.length-1
         */
        function mcmp(keys, values, alias) {
            if (keys.length === 0) {
                return constant(true);
            }
            var myValues = _.clone(values), //stabilizes input!!
                picked;

            if (_.isArray(values)) {
                picked = values; //_.map(values, function(v) {return formatter.toSql(v, context);});
            } else {
                picked = _.map(keys, function (k) {
                    return values[k];
                });
            }

            if (_.contains(picked, null)) {
                return constant(false);
            }


            var f = function (r, context) {
                if (r === undefined) {
                    return undefined;
                }
                var i, field, value;
                for (i = 0; i < keys.length; i += 1) {
                    field = keys[i];
                    if (_.isArray(myValues)) {
                        value = calc(myValues[i], r, context);
                    } else {
                        value = myValues[field];
                    }

                    if (isNullOrUndefined(r[field]) || isNullOrUndefined(value)) {
                        return false;
                    }
                    if (r[field] !== value) {
                        return false;
                    }
                }
                return true;
            };
            f.toString = function () {
                return 'mcmp(' + arrayToString(keys) + ',' + arrayToString(picked) + ')';
            };

            var toSql = function (formatter, context) {
                var k, v;

                return formatter.joinAnd(
                    _.map(
                        _.zip(keys, picked),
                        function (pair) {
                            k = pair[0];
                            v = pair[1];
                            if (isNullOrUndefined(v)) {
                                return formatter.isNull(field(k, alias), context);
                            }
                            return formatter.eq(field(k, alias), v, context);
                        }
                    )
                );
            };
            return toSqlFun(f, toSql);
        }

        /**
         * Compares a set of keys of an object with an array of values or with fields of another object
         * @method mcmpLike
         * @param {object}example
         * @return {sqlFun} f(r) = true if  for each non empty field of r:
         *  case field is a string containing a %: r[field] LIKE example[field]
         *  otherwise: r[field] = example[field]
         */

        function mcmpLike(example) {
            if (example === null || example === undefined) {
                return constant(true);
            }

            var exprArr = [],
                myValues = _.clone(example);

            _.forEach(_.keys(example), function (k) {
                if (myValues[k] === undefined || myValues[k] === '' || myValues[k] === null) {
                    return;
                }
                if (_.isString(myValues[k])) {
                    exprArr.push(like(k, '%' + myValues[k] + '%'));

                } else {
                    exprArr.push(eq(k, myValues[k]));
                }
            });
            return and(exprArr)

        }

        /**
         * returns a functions that does a subtraction
         * @method sub
         * @param {sqlFun} expr1
         * @param {sqlFun} expr2
         * @return {sqlFun}
         */
        function sub(expr1, expr2) {
            var expr = autofield(expr1),
                f;
            f = function (r, context) {
                if (r === undefined) {
                    return undefined;
                }
                var x = calc(expr, r, context), y;
                if (x === undefined) {
                    return undefined;
                }
                if (x === null) {
                    return null;
                }

                y = calc(expr2, r, context);
                if (y === undefined) {
                    return undefined;
                }
                if (y === null) {
                    return null;
                }
                return x - y;
            };
            f.toString = function () {
                return expr.toString() + '-' + expr2.toString()
            };
            var toSql = function (formatter, context) {
                return formatter.sub(expr, expr2, context);
            };
            return toSqlFun(f, toSql);
        }


        /**
         * returns a functions that does a division
         * @method div
         * @param {sqlFun} expr1
         * @param {sqlFun} expr2
         * @return {sqlFun}
         */
        function div(expr1, expr2) {
            var expr = autofield(expr1),
                f;
            f = function (r, context) {
                if (r === undefined) {
                    return undefined;
                }
                var x = calc(expr, r, context), y;
                if (x === undefined) {
                    return undefined;
                }
                if (x === null) {
                    return null;
                }
                y = calc(expr2, r, context);
                if (y === undefined) {
                    return undefined;
                }
                if (y === null) {
                    return null;
                }
                return x / y;
            };
            f.toString = function () {
                return 'div(' + expr.toString() + ',' + expr2.toString() + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.div(expr, expr2, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * returns a functions that evaluates the sum of a list or array of values given when it is CREATED
         * @method add
         * @param values
         * @return {sqlFun}
         */
        function add(values) {
            var a = values,
                f;
            if (!_.isArray(a)) {
                a = [].slice.call(arguments);
            }
            f = function (r, context) {
                var i,
                    sum = null;
                for (i = 0; i < a.length; i += 1) {
                    var x = calc(a[i], r, context);
                    if (x === undefined) {
                        return undefined;
                    }
                    if (sum === null) {
                        sum = x;
                    } else {
                        if (x !== null) {
                            sum += x;
                        }
                    }
                }
                return sum;
            };
            f.toString = function () {
                return 'add(' + arrayToString(a) + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.add(a, context);
            };
            return toSqlFun(f, toSql);
        }

        /**
         * returns a functions that evaluates the concatenation of a list or array of strings given when it is CREATED
         * @method concat
         * @param values
         * @return {sqlFun}
         */
        function concat(values) {
            var a = values,
                f;
            if (!_.isArray(a)) {
                a = [].slice.call(arguments);
            }
            f = function (r, context) {
                var i,
                    seq = null;
                for (i = 0; i < a.length; i += 1) {
                    var x = calc(a[i], r, context);
                    if (x === undefined) {
                        return undefined;
                    }
                    if (seq === null) {
                        seq = x;
                    } else {
                        if (x !== null) {
                            seq += x;
                        }
                    }
                }
                return seq;
            };
            f.toString = function () {
                return 'concat(' + arrayToString(values) + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.concat(a, context);
            };
            return toSqlFun(f, toSql);
        }


        /**
         * Evaluates the sum of an array of element given at run time
         * @method sum
         * @param {sqlFun} expr1
         * @returns {sqlFun}
         */
        function sum(expr1) {
            var expr = autofield(expr1),
                f = function (values, context) {
                    if (values === undefined) {
                        return undefined;
                    }
                    var a = values;
                    if (!_.isArray(a)) {
                        a = [].slice.call(arguments);
                    }

                    var i,
                        sum = null;
                    for (i = 0; i < a.length; i += 1) {
                        var x = calc(expr, a[i], context);
                        if (x === undefined) {
                            return undefined;
                        }
                        if (sum === null) {
                            sum = x;
                        } else {
                            if (x !== null) {
                                sum += x;
                            }
                        }
                    }
                    return sum;
                };
            f.toString = function () {
                return 'sum(' + expr.toString() + ')';
            };

            f.grouping = true;
            var toSql = function (formatter, context) {
                return formatter.sum(expr, context);
            };

            return toSqlFun(f, toSql);
        }


        /**
         * returns a functions that evaluates the multiply of a list or array of values
         * If some operand is 0, returns the always 0 function
         * @method mul
         * @param {sqlFun[]} values
         * @return {sqlFun}
         */
        function mul(values) {
            var a = values,
                f;
            if (!_.isArray(a)) {
                a = [].slice.call(arguments);
            }
            f = function (r, context) {
                var i,
                    prod = null,
                    someUndefined = false;
                for (i = 0; i < a.length; i += 1) {
                    var x = calc(a[i], r, context);
                    if (x === undefined) {
                        someUndefined = true;
                    } else if (x === 0) {
                        return 0;
                    } else if (x !== null) {
                        if (prod === null) {
                            prod = x;
                        } else {
                            prod *= x;
                        }
                    }
                }
                if (someUndefined) {
                    return undefined;
                }
                return prod;
            };

            f.toString = function () {
                return 'mul(' + arrayToString(values) + ')';
            };
            var toSql = function (formatter, context) {
                return formatter.add(_.map(a, function (v) {
                    return formatter.toSql(v, context);
                }));
            };
            return toSqlFun(f, toSql);
        }

        function arrayToString(arr) {
            return '[' + _.map(arr, function (value) {
                    return toString(value);
                }).join(',') + ']';
        }

        var dataQuery = {
            context: context,
            calc: calc,
            add: add,
            concat: concat,
            sub: sub,
            div: div,
            minus: minus,
            mul: mul,
            mcmp: mcmp,
            mcmpLike: mcmpLike,
            isNull: isNull,
            constant: constant,
            and: and,
            or: or,
            field: field,
            eq: eq,
            ne: ne,
            gt: gt,
            ge: ge,
            lt: lt,
            le: le,
            not: not,
            isNullOrEq: isNullOrEq,
            isNullOrGt: isNullOrGt,
            isNullOrGe: isNullOrGe,
            isNullOrLt: isNullOrLt,
            isNullOrLe: isNullOrLe,
            bitClear: bitClear,
            bitSet: bitSet,
            isIn: isIn,
            isNotIn: isNotIn,
            distinctVal: distinctVal,
            distinct: distinct,
            like: like,
            between: between,
            testMask: testMask,
            max: max,
            min: min,
            substring: substring,
            convertToInt: convertToInt,
            convertToString: convertToString,
            sum: sum,
            coalesce: coalesce,
            myLoDash: _ //for testing purposes
        };

        // Some AMD build optimizers like r.js check for condition patterns like the following:
        if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
            // Expose lodash to the global object when an AMD loader is present to avoid
            // errors in cases where lodash is loaded by a script tag and not intended
            // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for
            // more details.
            root.jsDataQuery = dataQuery;

            // Define as an anonymous module so, through path mapping, it can be
            // referenced as the "underscore" module.
            define(function () {
                return dataQuery;
            });
        }
        // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
        else if (freeExports && freeModule) {
            // Export for Node.js or RingoJS.
            if (moduleExports) {
                (freeModule.exports = dataQuery).jsDataQuery = dataQuery;
            }
            // Export for Narwhal or Rhino -require.
            else {
                freeExports.jsDataQuery = dataQuery;
            }
        }
        else {
            // Export for a browser or Rhino.
            root.jsDataQuery = dataQuery;
        }
    }.call(this,
        (typeof _ === 'undefined') ? require('lodash') : _
    )
);
