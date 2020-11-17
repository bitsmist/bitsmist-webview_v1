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
//	Service organizer class
// =============================================================================

export default class ServiceOrganizer
{

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	/**
	* Init service event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	* @param	{Object}		ex					Extra event info.
	*/
	static onInitService(sender, e, ex)
	{

		let settings = ex.options["settings"];
		let component = ex.options["component"];
		let handler = settings["events"][e.type]["handler"];
		let args = settings["events"][e.type]["args"];

		// Init wait info
		let waitInfo = {};
		if (settings["className"])
		{
			waitInfo["name"] = settings["className"];
		}
		else if (settings["rootNode"])
		{
			waitInfo["rootNode"] = settings["rootNode"];
		}
		waitInfo["status"] = "opened";

		component.waitFor([waitInfo]).then(() => {
			// Get component
			let service;
			if (settings["className"])
			{
				Object.keys(BITSMIST.v1.Globals.components.items).forEach((key) => {
					if (BITSMIST.v1.Globals.components.items[key].object.name == settings["className"])
					{
						service = BITSMIST.v1.Globals.components.items[key].object;
					}
				});
			}
			else
			{
				service = document.querySelector(services[serviceName]["rootNode"]);
			}

			// Call method
			service[handler].apply(service, args);
		});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(component, settings)
	{

		let services = settings["services"];
		if (services)
		{
			Object.keys(services).forEach((serviceName) => {
				Object.keys(services[serviceName]["events"]).forEach((eventName) => {
					component.addEventHandler(component, eventName, this.onInitService, {"component":component, "settings":services[serviceName]});
				});
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
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName)
	{

		let ret = false;

		if (eventName == "*" || eventName == "afterInitComponent" || eventName == "afterConnect")
		{
			ret = true;
		}

		return ret;

	}

}