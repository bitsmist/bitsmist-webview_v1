// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Clone class
// =============================================================================

export default class Clone
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object			options				Options for the component.
     */
	constructor(id, element, rootNode, parent)
	{

		this.id = id;
		this.element = element;
		this.rootNode = rootNode;
		this.parent = parent;

		this.modalOptions;
		this.modalResult;
		this.modalPromise;
		this.isModal = false;
		this.isOpen = false;

		// Init HTML elments' event handlers
		Object.keys(this.parent.elements).forEach((elementName) => {
				this.initHtmlEvents(elementName, {"clone":this});
		});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Open the clone.
	 *
	 * @return  {Promise}		Promise.
	 */
	open()
	{

		return new Promise((resolve, reject) => {
			console.debug(`Clone.open(): Opening clone. id=${this.id}`);

			if (this.isOpen)
			{
				resolve();
				return;
			}

			Promise.resolve().then(() => {
				if (this.parent.getOption("autoRefresh"))
				{
					return this.refresh();
				}
			}).then(() => {
				return this.parent.listener.trigger("_beforeOpen", this, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("beforeOpen", this, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("open", this, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("_open", this, {"clone":this});
			}).then(() => {
				this.__initOnOpen();
				console.debug(`Component.open(): Opened clone. id=${this.id}`);
				this.isOpen = true;
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Open modal.
	 *
	 * @param	{array}			options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	openModal(options)
	{

		console.debug(`Clone.openModal(): Opening clone. id=${this.id}`);

		return new Promise((resolve, reject) => {
			if (this.isOpen)
			{
				resolve();
				return;
			}

			if (options)
			{
				this.parent.options = Object.assign(this.parent.options, options);
			}
			this.isModal = true;
			this.modalResult = {"result":false};
			this.modalOptions = options;
			this.modalPromise = { "resolve": resolve, "reject": reject };
			this.open();
			this.isOpen = true;
		});

	}


	// -------------------------------------------------------------------------

	/**
	 * Close the clone.
	 *
	 * @return  {Promise}		Promise.
	 */
	close()
	{

		return new Promise((resolve, reject) => {
			console.debug(`Clone.close(): Closing clone. id=${this.id}`);

			if (!this.isOpen)
			{
				resolve();
				return;
			}

			Promise.resolve().then(() => {
				return this.parent.listener.trigger("_beforeClose", this, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("beforeClose", this, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("close", this, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("_close", this, {"clone":this});
			}).then(() => {
				console.debug(`Component.close(): Closed clone. id=${this.id}`);
				if (this.isModal)
				{
					this.modalPromise.resolve(this.modalResult);
				}
				this.__initOnClose();
				this.isOpen = false;
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh the clone.
	 *
	 * @return  {Promise}		Promise.
	 */
	refresh()
	{

		console.debug(`Clone.refresh(): Refreshing clone. id=${this.id}`);

		return new Promise((resolve, reject) => {
			this.parent.listener.trigger("_beforeRefresh", this, {"clone":this}).then(() => {
				return this.parent.listener.trigger("beforeRefresh", this, {"clone":this});
			}).then(() => {
				if (this.parent.getOption("autoFill"))
				{
					return this.fill();
				}
			}).then(() => {
				return this.parent.listener.trigger("refresh", this, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("_refresh", this, {"clone":this});
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply settings
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	setup(settings)
	{

		return new Promise((resolve, reject) => {
			let options = {"clone":this, "currentSettings":settings["currentSettings"], "newSettings":settings["newSettings"]};
			this.parent.listener.trigger("formatSettings", this, {"clone":this}).then(() => {
				return this.parent.listener.trigger("validateSettings", this, options);
			}).then(() => {
				return this.parent.listener.trigger("beforeSetup", this, options);
			}).then(() => {
				return this.parent.listener.trigger("setup", this, options);
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Init component's html element's event handler.
	 *
	 * @param	{String}		elementName			Element name.
	 * @param	{Options}		options				Options.
     */
	initHtmlEvents(elementName, options)
	{

		let elements;
		let rootElement = this.element;

		if (elementName == "_self")
		{
			elements = [rootElement];
		}
		else if (this.parent.elements && this.parent.elements[elementName] && "rootNode" in this.parent.elements[elementName])
		{
			elements = rootElement.querySelectorAll(this.parent.elements[elementName]["rootNode"]);
		}
		else
		{
			elements = rootElement.querySelectorAll("#" + elementName);
		}

		for (let i = 0; i < elements.length; i++)
		{
			if (this.parent.elements[elementName]["events"])
			{
				Object.keys(this.parent.elements[elementName]["events"]).forEach((eventName) => {
					// Merge options
					options = Object.assign({}, this.parent.elements[elementName]["events"][eventName], options);

					this.parent.listener.addHtmlEventHandler(elements[i], eventName, this.parent.elements[elementName]["events"][eventName]["handler"], options);
				});
			}
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// ------------------------------------------------------------------------

	/**
     * Initialization of clone on open().
     */
	__initOnOpen()
	{

		// Auto focus
		if (this.parent.getOption("autoFocus"))
		{
			let element = this.element.querySelector(this.parent.getOption("autoFocus"));
			if (element)
			{
				element.focus();
			}

		}

		// Css
		let css = (this.parent.events["open"] && this.parent.events["open"]["css"] ? this.parent.events["open"]["css"] : undefined );
		if (css)
		{
			Object.assign(this.element.style, css);
		}

	}

	// -------------------------------------------------------------------------

	/**
     * Initialization of clone on close().
     */
	__initOnClose()
	{

		// Css
		let css = (this.parent.events && this.parent.events["close"] && this.parent.events["close"]["css"] ? this.parent.events["close"]["css"] : undefined );
		if (css)
		{
			Object.assign(this.element.style, css);
		}

	}

}
