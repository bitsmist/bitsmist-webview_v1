// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Util from '../util/util';

// =============================================================================
//	Component initializer class
// =============================================================================

export default class ComponentInitializer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, settings)
	{

		let chain = Promise.resolve();

		if (settings)
		{
			Object.keys(settings).forEach((componentName) => {
				chain = chain.then(() => {
					return ComponentInitializer.addComponent(component, componentName, settings[componentName]);
				});
			});
		}

		return chain;

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
	static addComponent(component, componentName, options)
	{

		return new Promise((resolve, reject) => {
			let path = Util.concatPath([component._settings.get("system.appBaseUrl", ""), component._settings.get("system.componentPath", ""), ( "path" in options ? options["path"] : "")]);
			let splitComponent = ( "splitComponent" in options ? options["splitComponent"] : component._settings.get("system.splitComponent", false) );
			let className = ( "className" in options ? options["className"] : componentName );

			Promise.resolve().then(() => {
				// Load component
				return component.loadComponent(className, path, {"splitComponent":splitComponent});
			}).then(() => {
				// Insert tag
				if (options["rootNode"] && !component._components[componentName])
				{
					let root = document.querySelector(options["rootNode"]);
					if (!root)
					{
						throw new ReferenceError(`Root node does not exist when adding component ${componentName} to ${options["rootNode"]}. name=${component.name}`);
					}
					root.insertAdjacentHTML("afterbegin", options["tag"]);
					component._components[componentName] = root.children[0];
				}
			}).then(() => {
				resolve();
			});
		});

	}

}
