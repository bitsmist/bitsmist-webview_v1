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
//	Form class
// =============================================================================

export default class Form extends Pad
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(componentName, options)
	{

		super(componentName, options);
		this.target;
		this.item = {};

		// Init system event handlers
		this.listener.addEventHandler("_clone", this.__initFormOnClone);

	};

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Build form.
	 *
	 * @param	{Object}		items				Items to fill elements.
	 *
	 * @return  {Promise}		Promise.
	 */
	build(items)
	{

		return this._callClones("openModal", [items]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Validate form.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	valiate(options)
	{

		return this._callClones("validate", [options]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Submit form.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	submit(options)
	{

		return this._callClones("submit", [options]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Get fields value.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	getFields(options)
	{

		return this._callClones("getFields", [options]);

	}

	// -------------------------------------------------------------------------
	//  Privates (Bind to clone)
	// -------------------------------------------------------------------------

	/**
	 * Init after clone completed.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__initFormOnClone(sender, e, ex)
	{

		// extend clone
		ex.clone.cancelSubmit = false;
		ex.clone.build= this.__build.bind(ex.clone);
		ex.clone.fill = this.__fill.bind(ex.clone);
		ex.clone.clear= this.__clear.bind(ex.clone);
		ex.clone.validate = this.__validate.bind(ex.clone);
		ex.clone.submit= this.__submit.bind(ex.clone);
		ex.clone.getFields= this.__getFields.bind(ex.clone);
		ex.clone.__autoLoadData = this.__autoLoadData.bind(ex.clone);

		// default keys
		let defaultKeys = this.getOption("defaultKeys");
		if (defaultKeys)
		{
			this.listener.addHtmlEventHandler(ex.clone.element, "keyup", this.__defaultKey, {"clone":ex.clone, "options":defaultKeys});
		}

		// default buttons
		let defaultButtons = this.getOption("defaultButtons");
		if (defaultButtons)
		{
			let initElements = (options, handler) => {
				if (options)
				{
					let elements = ex.clone.element.querySelectorAll(options["rootNode"]);
					elements.forEach((element) => {
						this.listener.addHtmlEventHandler(element, "click", handler, {"clone":ex.clone, "options":options});
					});
				}
			};

			initElements(defaultButtons["submit"], this.__defaultSubmit);
			initElements(defaultButtons["cancel"], this.__defaultCancel);
			initElements(defaultButtons["clear"], this.__defaultClear);
		}

	}

	// -------------------------------------------------------------------------
	//  Privates (Bind to elemnt)
	// -------------------------------------------------------------------------

	/**
	 * Default key event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__defaultKey(sender, e, ex)
	{

		let key = e.key.toLowerCase()
		if (ex.options.submit && key == ex.options.submit.key)
		{
			this.__defaultSubmit(sender, e, {"clone":ex.clone, "options":ex.options.submit});
		}
		else if (ex.options.cancel && key == ex.options.cancel.key)
		{
			this.__defaultCancel(sender, e, {"clone":ex.clone, "options":ex.options.cancel});
		}
		else if (ex.options.clear && key == ex.options.clear.key)
		{
			this.__defaultClear(sender, e, {"clone":ex.clone, "options":ex.options.clear});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Default submit.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__defaultSubmit(sender, e, ex)
	{

		let clone = ex.clone;
		ex.clone.submit().then(() => {
			// Modal result
			if (clone.isModal)
			{
				clone.modalResult["result"] = true;
			}

			// Auto close
			if (ex["options"]["autoClose"])
			{
				clone.close();
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Default cancel.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__defaultCancel(sender, e, ex)
	{

		let clone = ex["clone"];
		clone.close();

	}

	// -------------------------------------------------------------------------

	/**
	 * Default clear.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__defaultClear(sender, e, ex)
	{

		let clone = ex.clone;
		let target;

		if (ex.options.target)
		{
			target = sender.getAttribute(ex.options.target);
		}

		clone.clear(target);

	}

	// -------------------------------------------------------------------------
	//  Privates (Bind to clone)
	// -------------------------------------------------------------------------

	/**
     * Build the form.
	 *
	 * @param	{Object}			items				Form values.
     */
	__build(items)
	{

		Object.keys(items).forEach((key) => {
			FormUtil.buildFields(this.element, key, items[key]);
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Fill the form.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	__fill(options)
	{

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this.parent );
			delete options["sender"];

			// Clear fields
			if (this.parent.getOption("autoClear"))
			{
				this.clear();
			}

			this.parent.listener.trigger("target", sender, {"clone":this}).then(() => {
				return this.parent.listener.trigger("beforeFetch", sender, {"clone":this});
			}).then(() => {
				// Auto load data
				if (this.parent.getOption("autoLoad"))
				{
					return this.__autoLoadData();
				}
			}).then(() => {
				return this.parent.listener.trigger("fetch", sender, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("format", sender, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("beforeFill", sender, {"clone":this});
			}).then(() => {
				FormUtil.setFields(this.element, this.parent.item, this.parent.container["masters"]);
				return this.parent.listener.trigger("fill", sender, {"clone":this});
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Clear the form.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @param	{string}		target				Target.
     */
	__clear(target)
	{

		return FormUtil.clearFields(this.element, target);

	}

	// -------------------------------------------------------------------------

	/**
     * Validate.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	__validate(options)
	{

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this.parent );
			delete options["sender"];

			this.parent.listener.trigger("beforeValidate", sender, {"clone":this}).then(() => {
				let ret = true;
				let form = this.element.querySelector("form");

				if (this.parent.getOption("autoValidate"))
				{
					if (form && form.reportValidity)
					{
						ret = form.reportValidity();
					}
					else
					{
						ret = FormUtil.reportValidity(this.element);
					}
				}

				if (!ret)
				{
					this.cancelSubmit = true;
				}
				return this.parent.listener.trigger("validate", sender, {"clone":this});
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Submit the form.
	 *
	 * @return  {Promise}		Promise.
     */
	__submit(options)
	{

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this.parent );
			delete options["sender"];
			this.cancelSubmit = false;
			this.parent.item = this.getFields();

			this.parent.listener.trigger("formatSubmit", sender, {"clone":this}).then(() => {
				return this.validate();
			}).then(() => {
				return this.parent.listener.trigger("beforeSubmit", sender, {"clone":this});
			}).then(() => {
				if (!this.cancelSubmit)
				{
					return this.parent.listener.trigger("submit", sender, {"clone":this});
				}
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Get the form values.
	 *
	 * @return  {array}			Form values.
     */
	__getFields()
	{

		return FormUtil.getFields(this.element);

	}

	// -------------------------------------------------------------------------

	/**
     * Load data via API.
	 *
	 * @return  {Promise}		Promise.
     */
	__autoLoadData()
	{

		return new Promise((resolve, reject) => {
			this.parent.resource.getItem(this.parent.target).then((data) => {
				this.parent.item = data["data"][0];
				resolve();
			});
		});

	}

}
