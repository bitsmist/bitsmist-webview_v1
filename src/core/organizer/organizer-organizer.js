// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Component from "../component";
import Organizer from "./organizer";
import OrganizerStore from "../store/organizer-store";
import SettingOrganizer from "./setting-organizer";
import Util from "../util/util";

// =============================================================================
//	Organizer organizer class
// =============================================================================

export default class OrganizerOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit()
	{

		// Add properties
		Object.defineProperty(Component.prototype, "organizers", {
			get() { return this._organizers; },
		});

		// Add methods
		Component.prototype.callOrganizers = function(condition, settings) { return OrganizerOrganizer._callOrganizers(this, condition, settings); }
		Component.prototype.initOrganizers = function(settings) { return OrganizerOrganizer._initOrganizers(this, settings); }

		// Init vars
		OrganizerOrganizer.__organizers = new OrganizerStore();
		Object.defineProperty(OrganizerOrganizer, "organizers", {
			get() { return OrganizerOrganizer.__organizers; },
		});

	}

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

		let targets = {};
		let chain = Promise.resolve();

		// List new organizers
		let organizers = settings["organizers"];
		if (organizers)
		{
			Object.keys(organizers).forEach((key) => {
				if (
					Util.safeGet(organizers[key], "settings.attach") &&
					!component._organizers[key] &&
					OrganizerOrganizer.__organizers.get(key)
				)
				{
					targets[key] = OrganizerOrganizer.__organizers.items[key];
				}
			});
		}

		// List new organizers from settings keyword
		Object.keys(settings).forEach((key) => {
			let organizerInfo = OrganizerOrganizer.__organizers.getOrganizerInfoByTargetWords(key);
			if (organizerInfo)
			{
				if (!component._organizers[organizerInfo.name])
				{
					targets[organizerInfo.name] = organizerInfo.object;
				}
			}
		});

		// Add and init new organizers
		OrganizerOrganizer._sortItems(targets).forEach((key) => {
			chain = chain.then(() => {
				component._organizers[key] = Object.assign({}, OrganizerOrganizer.__organizers.items[key], Util.safeGet(settings, "organizers." + key));
				return component._organizers[key].object.init("*", component, settings);
			});
		});

		return chain.then(() => {
			return settings;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear.
	 *
	 * @param	{Component}		component			Component.
	 */
	static clear(component)
	{

		component._organizers = {};

	}

	// ------------------------------------------------------------------------
	//  Protected
	// ------------------------------------------------------------------------

	/**
	 * Call organizers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _initOrganizers(component, settings)
	{

		// Init
		component._organizers = {};

		return Promise.resolve().then(() => {
			// Init setting organizer
			return SettingOrganizer.init("*", component, settings);
		}).then(() => {
			// Add organizers
			return OrganizerOrganizer.organize("*", component, settings);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Call organizers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _callOrganizers(component, conditions, settings)
	{

		return Promise.resolve().then(() => {
			// Load settings
			if (SettingOrganizer.isTarget(conditions))
			{
				return SettingOrganizer.organize(conditions, component, settings);
			}
			else
			{
				return settings;
			}
		}).then((newSettings) => {
			// Add organizers
			return OrganizerOrganizer.organize("*", component, newSettings);
		}).then((newSettings) => {
			// Call organizers
			let chain = Promise.resolve(settings);
			OrganizerOrganizer._sortItems(component._organizers).forEach((key) => {
				if (component._organizers[key].object.isTarget(conditions, component._organizers[key], component))
				{
					chain = chain.then((newSettings) => {
						return component._organizers[key].object.organize(conditions, component, newSettings);
					});
				}
			});

			return chain;
		});

	}

	// ------------------------------------------------------------------------

	/**
	 * Sort item keys.
	 *
	 * @param	{Object}		observerInfo		Observer info.
	 *
	 * @return  {Array}			Sorted keys.
	 */
	static _sortItems(organizers)
	{

		return Object.keys(organizers).sort((a,b) => {
			return organizers[a]["order"] - organizers[b]["order"];
		})

	}

}
