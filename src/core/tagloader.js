// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Component from './component';
import ClassUtil from './util/class-util';
import Util from './util/util';

// =============================================================================
//	Tag loader class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

import ComponentOrganizer from './organizer/component-organizer';

/**
 * Constructor.
 */
export default function TagLoader()
{

	// super()
	return Reflect.construct(Component, [], this.constructor);

}

ClassUtil.inherit(TagLoader, Component);
customElements.define("bm-tagloader", TagLoader);

// -----------------------------------------------------------------------------
//  Event handlers
// -----------------------------------------------------------------------------

/**
 * DOM content loaded event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 *
 * @return  {Promise}		Promise.
 */
TagLoader.prototype.onDOMContentLoaded= function(sender, e)
{

	let path = Util.concatPath([this._settings.get("system.appBaseUrl", ""), this._settings.get("system.componentPath", "")]);
	let splitComponent = this._settings.get("system.splitComponent", false);

	ComponentOrganizer.loadTags(document, path, {"splitComponent":splitComponent});

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start component.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
TagLoader.prototype.start = function(settings)
{

	// Init component settings
	settings = Object.assign({}, settings, {"name":"TagLoader", "autoSetup":false});

	// Start
	return BITSMIST.v1.Component.prototype.start.call(this, settings).then(() => {
		if (document.readyState !== 'loading')
		{
			this.onDOMContentLoaded();
		}
		else
		{
			window.addEventListener('DOMContentLoaded', this.onDOMContentLoaded.bind(this));
		}
	});

}
