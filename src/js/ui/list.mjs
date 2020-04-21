// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormUtil from '../util/form-util';
import Pad from './pad';

// =============================================================================
//	List class
// =============================================================================

export default class List extends Pad
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options.
     */
	constructor(componentName, options)
	{

		super(componentName, options);

		this.target;
		this.items;
		this.data;
		this.row;
		this.rows;
		this.parameters = {};

		// Init system event handlers
		this.listener.addEventHandler("_append", this.__initListOnAppend);
		this.listener.addEventHandler("_fill", this.__initListOnFill);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Clear list.
	 */
	clear()
	{

		this.row.element.innerHTML = "";

	}

	// -------------------------------------------------------------------------

	/**
	 * Fill list with data.
	 *
	 * @return  {Promise}		Promise.
	 */
	fill(options)
	{

		return new Promise((resolve, reject) => {
			this.rows = [];
			options = Object.assign({}, this.options, options);

			this.listener.trigger("target", this).then(() => {;
				return this.listener.trigger("beforeFetch", this);
			}).then(() => {
				// Auto load data
				if (options["autoLoad"])
				{
					return this.__autoLoadData();
				}
			}).then(() => {
				return this.listener.trigger("fetch", this);
			}).then(() => {
				return this.listener.trigger("beforeFill", this);
			}).then(() => {
				let chain = Promise.resolve();
				if (this.items)
				{
					let fragment = document.createDocumentFragment();
					for (let i = 0; i < this.items.length; i++)
					{
						chain = chain.then(() => {
							return this.__appendRow(fragment);
						});
					}
					chain.then(() => {
						if (options["autoClear"])
						{
							let newNode = this.row.element.cloneNode();
							newNode.appendChild(fragment);
							this.row.element.parentNode.replaceChild(newNode, this.row.element);
							this.row.element = newNode;
						}
						else
						{
							this.row.element.appendChild(fragment);
						}
					});
				}
				return chain;
			}).then(() => {
				return this.listener.trigger("_fill", this);
			}).then(() => {
				return this.listener.trigger("fill", this);
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Init after clone completed.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__initListOnAppend(sender, e, ex)
	{

		this.row = this.components[this.getOption("row")].object;
		this.row.element = this.element.querySelector(this.row.getOption("listRootNode"));

	}

	// -------------------------------------------------------------------------

	/**
	 * Init after filling completed.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__initListOnFill(sender, e, ex)
	{

		// Set HTML elements' event handlers after filling completed
		Object.keys(this.row.elements).forEach((elementName) => {
			this.row.initHtmlEvents(elementName);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Append a new row.
	 *
	 * @param	{HTMLElement}	rootNode				Root node to append a row.
	 *
	 * @return  {Promise}		Promise.
	 */
	__appendRow(rootNode)
	{

		return new Promise((resolve, reject) => {
			// Append row
			rootNode.appendChild(this.row.clone("", this.row.getOption("templateName")));
			let element = rootNode.lastElementChild;
			if (!element)
			{
				element = rootNode.childNodes[rootNode.childNodes.length - 1];
			}
			this.rows.push(element);
			let i = this.rows.length - 1;

			// Set click event handler
			if (this.row.events["click"])
			{
				this.row.listener.addHtmlEventHandler(element, "click", this.row.events["click"]["handler"], {"element":element});
			}

			// Call event handlers
			let chain = Promise.resolve();
			chain = chain.then(() => {
				return this.row.listener.trigger("formatRow", this, {"item":this.items[i], "no":i, "element":element});
			}).then(() => {
				return this.row.listener.trigger("beforeFillRow", this, {"item":this.items[i], "no":i, "element":element});
			}).then(() => {
				// Fill fields
				FormUtil.setFields(element, this.items[i], this.container["masters"]);
				return this.row.listener.trigger("fillRow", this, {"item":this.items[i], "no":i, "element":element});
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Load data via API when item is not specified in the options.
	 *
	 * @return  {Promise}		Promise.
     */
	__autoLoadData()
	{

		return new Promise((resolve, reject) => {
			this.resource.getList(this.target).then((data) => {
				this.data = data;
				this.items = data["data"];
				resolve();
			});
		});

	}

}
