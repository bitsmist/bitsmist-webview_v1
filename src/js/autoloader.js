// =============================================================================
/**
 * Bitsmist JS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from './util/ajax-util';
import ClassUtil from './util/class-util';
import Component from './component';
import Globals from './globals';

// =============================================================================
//	Auto loader class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function AutoLoader(settings)
{

	// super()
	settings = Object.assign({}, {"name":"AutoLoader", "templateName":"", "autoSetup":false}, settings);
	let _this = Reflect.construct(Component, [settings], this.constructor);

	_this.loadAll();

	return _this;

}

ClassUtil.inherit(AutoLoader, Component);
customElements.define("bm-autoloader", AutoLoader);

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Load scripts.
 *
 * @param	{Object}		settings			Options for the component.
 */
AutoLoader.prototype.loadAll = function()
{

	document.querySelectorAll("[data-autoload]").forEach((element) => {
		if (element.getAttribute("href"))
		{
			let url = element.getAttribute("href");
			return AjaxUtil.loadScript(url);
		}
		else
		{
			let className = ( element.getAttribute("data-classname") ? element.getAttribute("data-classname") : this.__getDefaultClassName(element.tagName) );
			let path = element.getAttribute("data-path");
			this._settings.items["components"][className] = {"path":path};
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Get a class name from tag name.
 *
 * @param	{String}		tagName				Tag name.
 *
 * @return  {String}		Class name.
 */
AutoLoader.prototype.__getDefaultClassName = function(tagName)
{

	let tag = tagName.split("-");
	let className = tag[0].charAt(0).toUpperCase() + tag[0].slice(1).toLowerCase() + tag[1].charAt(0).toUpperCase() + tag[1].slice(1).toLowerCase();

	return className;

}
