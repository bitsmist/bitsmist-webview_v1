// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from '../util/ajax-util';
import { NoNodeError, NotValidFunctionError } from '../error/errors';

// =============================================================================
//	Custom Component class
// =============================================================================

export default class CustomComponent extends HTMLElement
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
	 *
     */
	constructor()
	{

		super();

		this._container;
		this._element = this;
		this._templates = {};
		this._modalOptions;
		this._modalResult;
		this._modalPromise;
		this._isModal = false;
		this._isOpen = false;

		// Options
		let options = this._getOptions();
		let defaults = { "templateName": options["name"] };
		this._options = Object.assign({}, defaults, options);

		this._components = ( this._options["components"] ? this._options["components"] : {} );
		this._elements = ( this._options["elements"] ? this._options["elements"] : {} );
		this._plugins = ( this._options["plugins"] ? this._options["plugins"] : {} );
		this._events = ( this._options["events"] ? this._options["events"] : {} );
		this._preferences = ( this._options["preferences"] ? this._options["preferences"] : {} );
		this._resource;

//		this.__initPadOnInitComponent();

		this.triggerHtmlEvent(window, "_bm_component_init", this);

		// Register preferences
		this._container["preferenceManager"].register(this, this._preferences);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
     * Container. Set by App object.
     *
	 * @type	{String}
     */
	set container(value)
	{

		this._container = value;

	}

	// -------------------------------------------------------------------------

	/**
     * Component name.
     *
	 * @type	{String}
     */
	get name()
	{

		return this.getOption("name");

	}

	// -------------------------------------------------------------------------

	/**
     * Instance hash code.
     *
	 * @type	{String}
     */
	get hashCode()
	{

		return new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);

	}

	// -------------------------------------------------------------------------
	//  Callbacks
	// -------------------------------------------------------------------------

	/**
     * Connected callback.
     */
	connectedCallback()
	{

		// Init event handlers
		Object.keys(this._events).forEach((eventName) => {
			this.addEventHandler(this, eventName, this._events[eventName]["handler"]);
		});

		this.trigger("initComponent", this);

		this.open().then(() => {
		//	this.__initOnAppendTemplate();
		});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Open component.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	open(options)
	{

		console.debug(`Component.open(): Opening component. name=${this.name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );

			if (this._isOpen)
			{
				resolve();
				return;
			}

			this._autoLoadTemplate(this.getOption("templateName")).then(() => {
				if (this.getOption("autoRefresh"))
				{
					return this.refresh();
				}
			}).then(() => {
				return this.trigger("_beforeOpen", sender);
			}).then(() => {
				return this.trigger("beforeOpen", sender);
			}).then(() => {
				return this.trigger("open", sender);
			}).then(() => {
				return this.trigger("_open", sender);
			}).then(() => {
				this._initOnOpen();
				console.debug(`Component.open(): Opened component. name=${this.name}`);
				this._isOpen = true;
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Open component modally.
	 *
	 * @param	{array}			options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	openModal(options)
	{

		console.debug(`Component.openModal(): Opening component. name=${this.name}`);

		return new Promise((resolve, reject) => {
			if (this._isOpen)
			{
				resolve();
				return;
			}

			options = Object.assign({}, options);
			this._options = Object.assign(this._options, options);
			this._isModal = true;
			this._modalResult = {"result":false};
			this._modalOptions = options;
			this._modalPromise = { "resolve": resolve, "reject": reject };
			this.open();
			this._isOpen = true;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Close component.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	close(options)
	{

		console.debug(`Component.close(): Closing component. name=${this.name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );

			if (!this._isOpen)
			{
				resolve();
				return;
			}

			Promise.resolve().then(() => {
				return this.trigger("_beforeClose", sender);
			}).then(() => {
				return this.trigger("beforeClose", sender);
			}).then(() => {
				return this.trigger("close", sender);
			}).then(() => {
				return this.trigger("_close", sender);
			}).then(() => {
				console.debug(`Component.close(): Closed component. name=${this.name}`);
				if (this._isModal)
				{
					this._modalPromise.resolve(this._modalResult);
				}
				this._initOnClose();
				this._isOpen = false;
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh component.
	 *
	 * @return  {Promise}		Promise.
	 */
	refresh(options)
	{

		console.debug(`Component.refresh(): Refreshing component. name=${this.name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );

			Promise.resolve().then(() => {
				return this.trigger("_beforeRefresh", sender);
			}).then(() => {
				return this.trigger("beforeRefresh", sender);
			}).then(() => {
				if (this.getOption("autoFill"))
				{
					return this.fill();
				}
			}).then(() => {
				return this.trigger("refresh", sender);
			}).then(() => {
				return this.trigger("_refresh", sender);
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply settings.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	setup(options)
	{

		console.debug(`Component.setup(): Setting up component. name=${this.name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			options["currentPreferences"] = ( options["currentPreferences"] ? options["currentPreferences"] : this._container["preferences"] );
			options["newPreferences"] = ( options["newPreferences"] ? options["newPreferences"] : this._container["preferences"] );
			let sender = ( options["sender"] ? options["sender"] : this );

			Promise.resolve().then(() => {
				return this.trigger("formatSettings", sender, options);
			}).then(() => {
				return this.trigger("validateSettings", sender,  options);
			}).then(() => {
				return this.trigger("beforeSetup", sender, options);
			}).then(() => {
				return this.trigger("setup", sender, options);
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Fill.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	fill(options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Change template html.
	 *
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Promise}		Promise.
	 */
	switchTemplate(templateName)
	{

		return new Promise((resolve, reject) => {
			this._autoLoadTemplate(templateName).then(() => {
				this._options["templateName"] = templateName;
				return this.trigger("templateChange", this);
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Add a component to the pad.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
     */
	addComponent(componentName, options)
	{

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);

			Promise.resolve().then(() => {
				// Create component
				if (!this._components[componentName] || !this._components[componentName].object)
				{
					return new Promise((resolve, reject) => {
						this._container["loader"].createComponent(componentName, options).then((component) => {
							component.parent = this;
							this._components[componentName] = ( this._components[componentName] ? this._components[componentName] : {} );
							this._components[componentName].object = component;
							resolve();
						});
					});
				}
			}).then(() => {
				// Auto open
				let component = this._components[componentName].object;
				if (component.getOption("autoOpen"))
				{
					return component.open();
				}
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Add a plugin to the pad.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
     */
	addPlugin(pluginName, options)
	{

		return new Promise((resolve, reject) => {
			options = ( options ? options : {} );
			let className = ( "class" in options ? options["class"] : pluginName );
			let plugin = null;

			options["container"] = this._container;
			options["component"] = this;
			plugin = this._container["app"].createObject(className, pluginName, options);
			this._plugins[pluginName] = ( this._options["plugins"][pluginName] ? this._options["plugins"][pluginName] : {} );
			this._plugins[pluginName].object = plugin;

			plugin["events"].forEach((eventName) => {
				this.addEventHandler("_" + eventName, this.__callPluginEvent);
			});

			resolve(plugin);
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Init html element's event handler.
	 *
	 * @param	{String}		elementName			Element name.
	 * @param	{Options}		options				Options.
     */
	initHtmlEvents(elementName, options)
	{

		// Get target elements
		let elements;
		if (elementName == "_self")
		{
			elements = [this];
		}
		else if (this._elements[elementName] && "rootNode" in this._elements[elementName])
		{
			elements = this.querySelectorAll(this._elements[elementName]["rootNode"]);
		}
		else
		{
			elements = this.querySelectorAll("#" + elementName);
		}

		// Set event handlers
		let events = (this._elements[elementName]["events"] ? this._elements[elementName]["events"] : {});
		for (let i = 0; i < elements.length; i++)
		{
			Object.keys(events).forEach((eventName) => {
				// Merge options
				options = Object.assign({}, events[eventName], options);

				this.addEventHandler(elements[i], eventName, events[eventName]["handler"], options);
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
     * Add an event handler.
	 *
	 * @param	{HTMLElement}	element					HTML element.
	 * @param	{String}		eventName				Event name.
	 * @param	{Function}		handler					Event handler.
	 * @param	{Object}		options					Options passed to elements.
     */
	addEventHandler(element, eventName, handler, options)
	{

		if (typeof handler === "function")
		{
			let listeners = ( element._bm_detail && element._bm_detail.listeners ? element._bm_detail.listeners : {} );

			if (!element._bm_detail)
			{
				element._bm_detail = { "component": this, "listeners": listeners };
			}

			if (!listeners[eventName])
			{
				listeners[eventName] = [];
				element.addEventListener(eventName, this.__callEventHandler);
			}

			listeners[eventName].push({"handler":handler, "options":options});
		}
		else
		{
			throw new NotValidFunctionError(`Event handler is not a function. name=${this.name}, eventName=${eventName}`);
		}

	}

    // -------------------------------------------------------------------------

	/**
	 * Trigger the event.
	 *
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		sender					Object which triggered the event.
	 * @param	{Object}		options					Event parameter options.
	 */
	trigger(eventName, sender, options)
	{

		options = options || {};
		options["eventName"] = eventName;
		options["sender"] = sender;
		let e = null;

		try
		{
			e = new CustomEvent(eventName, { detail: options });
		}
		catch(error)
		{
			e  = document.createEvent('CustomEvent');
			e.initCustomEvent(eventName, false, false, null);
			e.detail = options;
		}

		return this.__callEventHandler(e);

	}

    // -------------------------------------------------------------------------

	/**
	 * Trigger the HTML event.
	 *
	 * @param	{HTMLElement}	element					Html element.
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		sender					Object which triggered the event.
	 * @param	{Object}		options					Event parameter options.
	 */
	triggerHtmlEvent(element, eventName, sender, options)
	{

		options = options || {};
		options["eventName"] = eventName;
		options["sender"] = sender;
		let e = null;

		try
		{
			e = new CustomEvent(eventName, { detail: options });
		}
		catch(error)
		{
			e  = document.createEvent('CustomEvent');
			e.initCustomEvent(eventName, false, false, null);
			e.detail = options;
		}

		element.dispatchEvent(e);

	}

	// -------------------------------------------------------------------------

	/**
	 * Get option value. Return default value when specified key is not available.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 *
	 * @return  {*}				Value.
	 */
	getOption(key, defaultValue)
	{

		let result = defaultValue;

		if (this._options && (key in this._options))
		{
			result = this._options[key];
		}

		return result;

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
     * Get Pad options.  Need to override.
	 *
	 * @return  {Object}		Options.
     */
	_getOptions()
	{

		return {};

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the template html if not loaded yet.
	 *
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Promise}		Promise.
	 */
	_autoLoadTemplate(templateName)
	{

		let promise;

		return new Promise((resolve, reject) => {
			let rootNode;

			if (this.__isLoaded(templateName))
			{
				resolve();
			}
			else
			{
				console.debug(`Component._autoLoadTemplate(): Auto loading template. templateName=${templateName}`);

				this.__loadTemplate(templateName).then(() => {
					return this.trigger("load", this);
				}).then(() => {
					return this.__appendTemplate(this.getOption("rootNode"), templateName);
				}).then(() => {
					resolve();
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Initialization of component on open().
     */
	_initOnOpen()
	{

		// Auto focus
		if (this.getOption("autoFocus"))
		{
			let element = this.querySelector(this.getOption("autoFocus"));
			if (element)
			{
				element.focus();
			}

		}

		// Css
		let css = (this._events["open"] && this._events["open"]["css"] ? this._events["open"]["css"] : undefined );
		if (css)
		{
			Object.assign(this.style, css);
		}

	}

	// -------------------------------------------------------------------------

	/**
     * Initialization of clone on close().
     */
	_initOnClose()
	{

		// Css
		let css = (this._events && this._events["close"] && this._events["close"]["css"] ? this._events["close"]["css"] : undefined );
		if (css)
		{
			Object.assign(this.style, css);
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Load the template html.
	 *
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Promise}		Promise.
	 */
	__loadTemplate(templateName)
	{

		let path = ("path" in this._options ? this._options["path"] : "");
		let url = this._container["loader"].buildTemplateUrl(templateName, path);
		console.debug(`Component.__loadTemplate(): Loading template. templateName=${templateName}, path=${path}`);

		return new Promise((resolve, reject) => {
			AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
				console.debug(`Component.__loadTemplate(): Loaded template. templateName=${templateName}`);
				this._templates[templateName] = {};
				this._templates[templateName]["html"] = xhr.responseText;
				resolve(xhr);
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Append the template html to its root node.
	 *
	 * @param	{String}		rootNode			Root node to append.
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Promise}		Promise.
	 */
	__appendTemplate(rootNode, templateName)
	{

		return new Promise((resolve, reject) => {
			if (rootNode)
			{
				/*
				let root = document.querySelector(rootNode);
				if (!root)
				{
					throw new NoNodeError(`Root node does not exist. name=${this.name}, rootNode=${rootNode}`);
				}

				// Add template to root node
				root.insertAdjacentHTML("afterbegin", this._templates[templateName].html);
				this._element = root.children[0];
				*/
			}
			else
			{
				this.innerHTML = this._templates[this.getOption("templateName")].html
			}

			console.debug(`Component.__appendTemplate(): Appended. templateName=${templateName}`);

			// Trigger events
			Promise.resolve().then(() => {
				return this.__initOnAppendTemplate();
			}).then(() => {
				return this.trigger("_append", this);
			}).then(() => {
				return this.trigger("append", this);
			}).then(() => {
				return this.setup();
			}).then(() => {
				return this.trigger("init", this);
			}).then(() => {
				resolve();
			});
		});

	}


	// -------------------------------------------------------------------------

	/**
	 * Init on initComponent.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 *
	 * @return  {Promise}		Promise.
	 */
	/*
	__initPadOnInitComponent(sender, e, ex)
	{

		// Init plugins
		if (this._options["plugins"])
		{
			Object.keys(this._options["plugins"]).forEach((pluginName) => {
				this.addPlugin(pluginName, this._options["plugins"][pluginName]);
			});
		}

	}
	*/

	// -------------------------------------------------------------------------

	/**
     * Init on append template.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 *
	 * @return  {Promise}		Promise.
     */
	__initOnAppendTemplate(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			/*
			// Init plugins
			if (this._options["plugins"])
			{
				Object.keys(this._options["plugins"]).forEach((pluginName) => {
					this.addPlugin(pluginName, this._options["plugins"][pluginName]);
				});
			}
			*/

			let chain = Promise.resolve();

			//  Add components
			Object.keys(this._components).forEach((componentName) => {
				if ("class" in this._components[componentName])
				{
					chain = chain.then(() => {
						return this.addComponent(componentName, this._components[componentName]);
					});
				}
			});

			// Init HTML event handlers
			chain.then(() => {
				Object.keys(this._elements).forEach((elementName) => {
						this.initHtmlEvents(elementName);
				});

				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Call event handler.
	 *
	 * @param	{Object}		e						Event parameter.
	 */
	__callEventHandler(e)
	{

		return new Promise((resolve, reject) => {
			let listeners = ( this._bm_detail && this._bm_detail["listeners"] ? this._bm_detail["listeners"][e.type] : undefined );
			let stopPropagation = false;
			let chain = Promise.resolve();

			if (listeners)
			{
				let component = this._bm_detail["component"];

				for (let i = 0; i < listeners.length; i++)
				{
					chain = chain.then(() => {
						return (listeners[i]["handler"]).call(component, this, e, listeners[i]["options"]);
					});

					if (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"])
					{
						stopPropagation = true;
					}
				}
			}

			if (stopPropagation)
			{
				e.stopPropagation();
			}

			chain.then(() => {
				resolve();
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Call plugin's event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 *
	 * @return  {Promise}		Promise.
	 */
	__callPluginEventHandler(sender, e, ex)
	{

		return new Promise((resolve, rejfect) => {
			let promises = [];
			let eventName = ex.eventName.substr(1);

			Object.keys(this._plugins).forEach((pluginName) => {
				if (this._plugins[pluginName]["enabled"])
				{
					promises.push(this._plugins[pluginName].object[eventName](sender, e, ex));
				}
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the template is loaded.
	 *
	 * @return  {bool}			True if loaded.
	 */
	__isLoaded(templateName)
	{

		let isLoaded = false;

		if (templateName in this._templates && this._templates[templateName].html)
		{
			isLoaded = true;
		}

		return isLoaded

	}

}