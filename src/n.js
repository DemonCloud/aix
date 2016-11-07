/* 
 * n.js
 *
 * Base Dom Lib
 *
 * support web browser 
 * * Chrome
 * * FireFox
 * * Safari
 * * IE 9+ - Edge Support
 *
 * @Author  : YIJUN
 * @Date    : 2016.6.22
 * @Version : 0.1
 *
 * @License : Fuck any LISCENSE
 */

(function(root,factory){

	if(typeof define === 'function' && define.amd)
		// support AMD require.js
		// ruler by UMD Javascript
		define(factory);
	else if(typeof exports === "object")
		// support NodeJS exports
		module.exports = factory(_);
	else
		// build on browser global object
		root.__ = factory(_);

})( this , function(_){
	'use strict';

	// Dom ready
	var rfire = false,
		rinit = false,
		rlist = [];

	function domready(){
		if(!rfire){
			rfire = true;
			rlist.forEach(function(v,i){
				v.fn.call(_.root,v.ct);
			});
			rlist = [];
		}
	}

	// DOOM selector cache
	var dcache = [];

	// __ interpolate
	var __ = function(x,context){
		if(_.isFunction(x)){
			if(rfire){
				return setTimeout(function(){ x(context); } , 0);
			} else {
				rlist.push({ fn:x , ct:context });
			}

			if(document.readyState === 'complete')
				setTimeout(domready,0);
			else if(!rinit)
				document.addEventListener("DOMContentLoaded", domready , false);
			rinit = true;

			return;

		}else if(x instanceof DOOM){

			return x;

		}else if( _.isString(x)){

			var cache;
			dcache.forEach(function(sl){
				if(sl.$indicator === x) cache = sl;
			});

			if(cache != null && inpage(cache))
				return _.clonedoom(cache);
		}

		return new DOOM(x);
	};

	// DOOM config
	// support set Doom some behiver
	__.config = {
		// cache limit
		limit : 4,

		version : _.version,
	};

	function pushcache(sl){
		if(dcache.length >= __.config.limit)
			dcache.shift();
		dcache.push(sl);
	}

	function inpage(sl){
		return sl.$el.every(function(e){ 
			return _.ua.browser.IE ? 
						 document.body.contains(e) :
						 document.contains(e); });
	}

	// get childNodes and filter by selector
	// cant use Global matcher
	var isId      = /^#[^\s\=\+\.\#\[\]]+/i														// "#idname"
	   ,isClass   = /^\.[^\s\=\+\.\#\[\]]+$/i													// ".className"
	   ,isTag     = /^[^\[\]\+\-\.#\s\=]+$/i													// "p" "div" "DIV"
	   ,isAttr    = /([^\s]+)?\[([^\s]+)=["']?([^\s'"]+)["']?\]$/i 		// div[id="nami"]
	   ,mreSl     = /^[^\s]+,[^\s]+/gi
	   ,cidSl     = /[\s|\r]+/gi
	   ,pitSl     = /[>|\+|\~]+/gi
		 ,isHTML    = /<[a-z][\s\S]*>/i;
	// Performance JavaScript selector
	// Just Optimzer this function for sl pref
	// @ much more need its better
	function dsizzle(elm){
		elm = _.trim(elm);
		var $el,$1 = !cidSl.test(elm) ,$2 = !pitSl.test(elm);
		if($1&&$2){
			if(isId.test(elm))
				return [document.getElementById(elm.substr(1))];
			else if(isClass.test(elm))
				$el = document.getElementsByClassName(elm.substr(1));
			else if(isTag.test(elm))
				$el = document.getElementsByTagName(elm);
			else if(isAttr.test(elm)){
				var matcher = isAttr.exec(elm);
				var parent = matcher[1],
                    attr   = matcher[2],
                    value  = matcher[3];
				if(parent == null){
					return _.slice(document.getElementsByTagName("*")).filter(function(e){
						return e.getAttribute(attr) === value;
					})
				} else {
					return dsizzle(parent).filter(function(e){
						return e.getAttribute(attr) === value;
					})			
				}
			}
			else 
				$el = document.querySelectorAll(elm);
		}else 
			if(isHTML.test(elm)){
				var dg = document.createElement("i");
						dg.innerHTML = elm;
				$el = _.slice(dg.querySelectorAll("*"));
				return $el.filter(function(node){
					return node.nodeType === 1;
				});
			}
			else
				$el = document.querySelectorAll(elm);
		return _.slice($el);
	}

	var DOOM = function(str){
		this.$el = [];
		
		if(str!=null){
			if(_.isString(str)){
				this.$el = dsizzle(str);
				this.$indicator = str;
			}else if( str===document || str===_.root || str.nodeType ===1){
				this.$el.push(str);
				this.$indicator = "";
			}
		}

		this.length = this.$el.length;
		pushcache(_.clonedoom(this));

		return this;
	};


	// Define base porperty
	__.fn = DOOM.prototype = {

		constructor : DOOM,

		version : _.version,

		extend: function(obj){
			_.extend(__.fn,obj);
		}
	};

	// DOOM selector wrap
	__.fn.extend({

		each : function(fn,context){
			return _.foreach(this.$el,fn,context)
		},

		get : function(index){
			return this.$el[( +index + ( index < 0 ? this.length : 0 ) )]
		},

		at : function(index){
			var cp = _.clonedoom(this);

			index = +index + (index < 0 ? cp.length : 0);
			cp.$el = [cp.$el[index]];
			cp.length = 1;

			return cp;
		},

		first : function(){
			return this.at(0);
		},

		last : function(){
			return this.at(-1);
		},

		by : function(idf){
			var cp = _.clonedoom(this);

			cp.$el = cp.$el.filter(idf);
			cp.length = cp.$el.length;

			return cp;
		},

		even : function(){
			return this.by(function(elm,i){
				return i%2 != 0
			})
		},

		odd : function(){
			return this.by(function(elm,i){
				return i%2 == 0
			})
		},

		next : function(isPrev){
			var cp = _.clonedoom(this);

			var res = [],
					api = isPrev ? "previousElementSibling" : "nextElementSibling";

			_.foreach(cp.$el,function(e){
				if(e[api]!=null) res.push(e[api]);
			});

			// not comment && document && script
			cp.$el = _.filter(res,function(c){
				return c.nodeType !== 3 && c.nodeType !== 8 && c.nodeName !== "SCRIPT";
			});
			cp.length = cp.$el.length;
			return cp;
		},

		prev : function(isNext){
			return this.next(!isNext);
		},

		find : function(sl){
			var cp  = _.clonedoom(this);
			var res = []; 
			
			_.foreach(cp.$el,function(e){
				res = _.slice(e.querySelectorAll(sl)).concat(res);
			});

			cp.$el = res;
			cp.length = cp.$el.length;

			return cp;
		},

		siblings : function(){
			var cp = _.clonedoom(this);
			var res = [];
			var self = cp.$el;

			_.foreach(cp.$el,function(e){
				res = _.slice(e.parentNode.children).concat(res);
			});

			cp.$el = _.filter(_.unique(res),function(e){ 
				return !_.has(self,e);
			});
			cp.length = cp.$el.length;

			return cp
		},

		childrens : function(){
			var cp = _.clonedoom(this);
			var res = [];

			_.foreach(cp.$el,function(e){
				res = _.slice(e.children).concat(res);
			});

			cp.$el = _.unique(res);
			cp.length = cp.$el.length;

			return cp
		}
	});


	// DOOM selector style
	var propList = [
		"checked",
		"disabled",
		"readonly",
		"required",
		"validate"
	];

	function styleFilter(style){
		if(style.search("rgb") != -1){
			var bg = style.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
		}
		return style;
	}

	function styleParse(name){
		if(name.search("-") != -1){
			var arr = name.split("-");
			for(var i=1, l=arr.length; i<l; i++)
				arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
			return arr.join('');
		}
		return name;
	}

	function hex(s){
		return ("0"+ parseInt(s).toString(16)).slice(-2);
	}

	__.fn.extend({
		
		addClass: function(style){
			return this.each(function(e){
				var sarr = e.getAttribute("class");
				if(sarr){
					sarr = sarr.split(' ');
					e.setAttribute("class",_.unique(sarr.concat(style.split(' '))).join(' '));
				}else{
					e.setAttribute("class",_.unique(style.split(' ')).join(' '));
				}
			})
		},

		removeClass: function(style){
			return this.each(function(e){
				var sarr = e.getAttribute("class");
				if(sarr){
					sarr = sarr.split(' ');
					_.foreach(style.split(' '),function(v){ _.not(sarr,v) });
					e.setAttribute("class",sarr.join(' '));
				}
			})
		},

		toggleClass: function(style){
			return this.each(function(e){
				var sarr = e.getAttribute("class");
				if(sarr){
					sarr = sarr.split(' ');
					_.foreach(_.unique(style.split(' ')),function(s){ 
						_.has(sarr,s) ? _.not(sarr,s) : sarr.push(s)
					});
					e.setAttribute("class",sarr.join(' '));
				}else{
					e.setAttribute("class",style);
				}
			})
		},

		attr: function(){
			var args = _.slice(arguments);

			if(args.length){
				if(args.length === 1)
					return this.get(0).getAttribute(args[0]);
				else
					this.each(function(e){ e.setAttribute(args[0],_.parseString(args[1])); });
			}

			return this;
		},

		removeAttr: function(atr){
			return this.each(function(e){
				e.removeAttribute(atr);
			});
		},

		data: function(){
			var args = _.slice(arguments);
			if(args[0]){
				args[0] = "data-" + args[0];
				return this.attr.apply(this,args);
			}
			return this;
		},

		prop : function(){
			var args = _.slice(arguments);
			
			if(args.length){
				if(args.length === 1)
					return _[_.has(propList,args[0]) ? "isString" : "cool"](this.attr(args[0]));
				else
					if(args[1]!==false&&args[1]!==0)
						return this.attr(args[0],_.has(propList,args[0]) ? "" : args[1]);
					else
						return this.removeAttr(args[0]);
			}

			return this;
		},

		removeProp : function(attr){
			return this.removeAttr(attr);
		},

		value : function(val){
			if(_.slice(arguments).length){
				//select value must be diff deel with
				return this.each(function(elm){
					var tagName = elm.tagName.toUpperCase();
					if(tagName === "SELECT")
						_.foreach(_.slice(elm.options),function(o){ 
							o.removeAttribute("selected");
							if((o.getAttribute("value") || o.innerText) === val+"")
								o.setAttribute("selected","")
						});
					else
						elm.setAttribute("value",val);
				});
			}else{
					var elm = this.get(0);
					if(elm.tagName.toUpperCase() === "SELECT")
						return elm.options[elm.selectedIndex].value || elm.innerText;
					else 
						return elm.value || elm.getAttribute("value");
			}
		},

		text : function(ct){
			if(ct != null)
				return this.each(function(e){ e.innerText = ct+"" });
			else 
				return _.decodeHTML(this.get(0).innerText||"");
		},

		fill : function(ct){
			var tmp= ""; 
			if(ct != null){
				if(ct.nodeType && ct.nodeType === 1)
					tmp = ct.outerHTML;
				else if(_.isObject(ct) && ct instanceof DOOM)
					ct.each(function(e){ tmp+= e.outerHTML; })
				else
					tmp = ct+"";
				return this.each(function(e){
					e.innerHTML = tmp+"";
				});
			}else{
				return this.get(0).innerHTML || "";
			}
		},

		html : function(){
			return this.fill.apply(this,_.slice(arguments));
		},

		empty : function(){
			return this.each(function(e){ e.innerHTML = ""; });
		},

		offset : function(){
			var top = 0,
					left = 0,
					width = 0,
					height = 0;

			var elm = this.get(0);
			width  = elm.offsetWidth;
			height = elm.offsetHeight;
			
			while(elm){
				left  += elm.offsetLeft;
				top   += elm.offsetTop;
				elm    = elm.offsetParent;
			}

			return {
				top: top,
				left: left,
				witdh: width,
				height : height
			}
		},

		pos : function(){
			var elm = this.get(0);
			return {
				top    : elm.offsetTop,
				left   : elm.offsetLeft,
				width  : elm.offsetWidth,
				height : elm.offsetHeight
			}
		},

		draw : function(css,val){
			if(_.isString(css))
				if(val == null)
					return styleFilter(window.getComputedStyle(this.get(0),null)[css]);
				else
					return this.each(function(e){ e.style[styleParse(css)] = val+"" });
			else if(_.isObject(css))
				for(var key in css)
					this.draw(key,css[key]);

			return this;
		},

		redraw : function(){
			return this.removeAttr("style");
		}
		
	});

	// Doom Events
	// Dom fired api
	var capEvents = [
		"blur"       , "focus"       , "invalid"     ,
		"abort"      , "afterprint"  , "beforeprint" ,
		"checking"   , "downloading" ,
		"load"       , "unload"      ,
		"loadend"    , "loadstart"   ,
		"mouseenter" , "mouseleave"  ,
		"resize"     , "show"        , "select"
	];

	var capTypes = {
		"UIEvent"       : [
			"focus",
			"blur",
			"focusin",
			"focusout"
		],
		"MouseEvent"    : [
			"click",
			"dbclick",
			"mouseup",
			"mousedown",
			"mouseout",
			"mouseover",
			"mouseenter",
			"mouseleave"
		],
		"KeyboardEvent" : [
			"keydown",
			"keypress",
			"keyup"
		]
	};

	function createEvent(elm,type,prop){
		var structor = "CustomEvent";

		_.foreach(capTypes,function(typelist,con){
			if(_.has(typelist,type))
				structor = con;
		});

		var eventInit = {
			data: prop,
			bubbles: true,
			cancelable: true,
			target: elm,
			toElement: elm,
			srcElement: elm,
			currentTarget: elm
		};

		switch(structor){
			case "CustomEvent"   : return new CustomEvent(type,eventInit);
			case "UIEvent"       : return new UIEvent(type,eventInit);
			case "MouseEvent"    : return new MouseEvent(type,eventInit);
			case "KeyboardEvent" : return new KeyboardEvent(type,eventInit);
		}
	}

	__.fn.extend({
		reg : function(type,cal,context,capit){
			return this.each(function(elm){
				if(elm._events == null){
					_.define(elm,"_events",{
						value : {},
						writable : true,
						enumerable: false,
						configurable: true
					});
				}

				if(cal!=null){
					var fn = function(event){
						cal.call(context||elm,event,type,context);
					};

					fn.fn = cal.fn || cal;
					fn.cal = cal;

					// save events Type
					if(elm._events[type] == null)
						elm._events[type] = [];
					elm._events[type].push(fn);
					
					// bind events
					// elm real dispatch event here
					elm.addEventListener(type,fn,!!capit);
				}
			});
		},

		purge : function(type,cal){
			return this.each(function(elm){
				// normal remove binder
				if(_.isString(type)){
					if(cal != null){
						if(elm._events[type] != null){
							elm.removeEventListener(type,_.cat(elm._events[type],function(fn){ 
								return fn.fn===cal 
							})[0]||cal);

							// If clean events
							if(!elm._events[type].length)
								delete elm._events[type];
						}else{
							elm.removeEventListener(type,cal)
						}

						// live remove binder
						if(elm._events["_"+type] != null){
							document.documentElement.removeEventListener(type,
								_.cat(elm._events["_"+type],function(fn){ return fn.fn===cal })[0].cal,
								true);

							// If clean events
							if(!elm._events["_"+type].length)
								delete elm._events["_"+type];
						}


					}else{
						_.foreach(elm._events[type],function(fn){
							elm.removeEventListener(type,fn);
						});

						// live remove binder
						_.foreach(elm._events["_"+type],function(fn){
							document.documentElement.removeEventListener(type,fn.cal,true);
						});
						delete elm._events["_"+type];
						delete elm._events[type];
					}
				}else{
					_.foreach(elm._events,function(fns,type){
						if(type.search("_") != -1){
							// live remove binder
							_.foreach(fns,function(fn){
								detectLive.removeEventListener(type.slice(1),fn.cal,true);
							});
						}else{
							_.foreach(fns,function(fn){
								elm.removeEventListener(type,fn);
							});
						}
					});

					elm._events = {};
				}

			});
		},

		off : function(type,param,fn){
			return this.purge(type,fn);
		},

		// Agent and live elm events, 
		// also it can use the purge for unbind event
		on : function(){
			return this.live.apply(this,_.slice(arguments));
		},

		agent : function(){
			return this.live.apply(this,_.slice(arguments));
		},

		live : function(type,sl,cal,context,ctbak){
			var t = !_.isFunction(sl) , data;
			if(!_.isFunction(cal)){
				data = cal
				cal = _.isFunction(context) ? context : _.NULL;
				context = ctbak;
			}

			return this.each(function(elm){
				if(t){
					var fn = function(event){
						var fire = event.target || event.toElement;
								event.data = data;

						if(_.has(__(elm).find(sl).$el,fire))
							return cal.call(context||fire,event,type);
					}; fn.fn = cal; fn.elm = elm;

					__(elm).reg("_"+type,fn,null);
					document.documentElement.addEventListener(type,fn,true);
				}else
					__(elm).reg(type,sl,cal);
			})

		},

		signet : function(name,val){
			if(name != null)
				if(val != null)
					return this.each(function(e){
						if(e[name])
							e.name = val;
						else
							_.define(e,name,{ value : val, writable : true, enumerable: false, configurable: true })

					});
				else
					return this.get(0)[name];
			return this;
		},

		once : function(type,cal){
			return this.each(function(e){
				var fn = function(event){
					cal.call(e,event,type);
					e.removeEventListener(type,fn); fn = null;
				};
				e.addEventListener(type,fn);
			});
		},

		dispatch : function(type,cal){
			return this.each(function(e){
				var event = createEvent(e,type);
				return _.isFunction(cal) ? cal.call(e,event) : e.dispatchEvent(event);
			});
		}
	
	});

	return __;
});
