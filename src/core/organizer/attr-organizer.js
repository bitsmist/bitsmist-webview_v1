// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Attribute organizer class
// =============================================================================

export default class AttrOrganizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		let events = {
			"afterStart": AttrOrganizer.onDoOrganize,
			"afterAppend": AttrOrganizer.onDoOrganize,
			"afterSpecLoad": AttrOrganizer.onDoOrganize,
			"beforeOpen": AttrOrganizer.onDoOrganize,
			"afterOpen": AttrOrganizer.onDoOrganize,
			"beforeClose": AttrOrganizer.onDoOrganize,
			"afterClose": AttrOrganizer.onDoOrganize,
			"doRefresh": AttrOrganizer.onDoOrganize,
		};

		let attrs = settings["attrs"];
		if (attrs)
		{
			Object.keys(attrs).forEach((eventName) => {
				if (events[eventName])
				{
					component.addEventHandler(component, eventName, events[eventName], {"attrs":attrs[eventName]}, component);
				}
			});
		}

		return Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear.
	 *
	 * @param	{Component}		component			Component.
	 */
	static clear(component)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		conditions			Event name.
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(conditions, component)
	{

		let ret = false;

		if (conditions == "*" || conditions == "beforeStart" || conditions == "afterSpecLoad")
		{
			ret = true;
		}

		return ret;

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	/**
	 * DoOrganize event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	static onDoOrganize(sender, e, ex)
	{

		let component = ex.target;
		let settings = ex.options["attrs"];

		return AttrOrganizer._initAttr(component, settings);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Init attributes.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static _initAttr(component, settings)
	{

		if (settings)
		{
			Object.keys(settings).forEach((key) => {
				switch (key)
				{
					case "style":
						Object.keys(settings[key]).forEach((styleName) => {
							component.style[styleName] = settings[key][styleName];
						});
						break;
					default:
						component.setAttribute(key, settings[key]);

						/*
						if (key.substr(0, 1) == "-")
						{
							let attrs = settings[key].split(" ");
							for (let i = 0; i < attrs.length; i++)
							{
								console.log("@@@removing attr", component.name, key, attrs[i]);
								component.removeAttribute(key, attrs[i]);
							}
						}
						else
						{
							console.log("@@@settings attr", component.name, key, settings[key]);
							component.setAttribute(key, settings[key]);
						}
						*/
						break;
				}
			});
		}

		return Promise.resolve();

	}

}
