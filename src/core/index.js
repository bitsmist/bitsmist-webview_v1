// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// Global variables

import Globals from './globals';
window.BITSMIST.v1.Globals = Globals;

// Component

import Component from './component';
window.BITSMIST.v1.Component = Component;

// Organizer

import SettingOrganizer from './organizer/setting-organizer';
Globals.organizers.set("SettingOrganizer", {"object":SettingOrganizer, "order": 100});
window.BITSMIST.v1.SettingOrganizer = SettingOrganizer;

import OrganizerOrganizer from './organizer/organizer-organizer';
Globals.organizers.set("OrganizerOrganizer", {"object":OrganizerOrganizer, "order": 110});
window.BITSMIST.v1.OrganizerOrganizer = OrganizerOrganizer;

import StateOrganizer from './organizer/state-organizer';
Globals.organizers.set("StateOrganizer", {"object":StateOrganizer, "targets":"waitFor", "order": 120});
window.BITSMIST.v1.StateOrganizer = StateOrganizer;

import AttrOrganizer from './organizer/attr-organizer';
Globals.organizers.set("AttrOrganizer", {"object":AttrOrganizer, "targets":"attrs", "order": 130});
window.BITSMIST.v1.AttrOrganizer = AttrOrganizer;

import ComponentOrganizer from './organizer/component-organizer';
Globals.organizers.set("ComponentOrganizer", {"object":ComponentOrganizer, "targets":"components", "order": 140});
window.BITSMIST.v1.ComponentOrganizer = ComponentOrganizer;

import ElementOrganizer from './organizer/element-organizer';
Globals.organizers.set("ElementOrganizer", {"object":ElementOrganizer, "targets":"elements", "order": 150});
window.BITSMIST.v1.ElementOrganizer = ElementOrganizer;

import EventOrganizer from './organizer/event-organizer';
Globals.organizers.set("EventOrganizer", {"object":EventOrganizer, "targets":"events", "order": 160});
window.BITSMIST.v1.EventOrganizer = EventOrganizer;

import ServiceOrganizer from './organizer/service-organizer';
Globals.organizers.set("ServiceOrganizer", {"object":ServiceOrganizer, "targets":"services", "order": 170});
window.BITSMIST.v1.ServiceOrganizer = ServiceOrganizer;

import TemplateOrganizer from './organizer/template-organizer';
Globals.organizers.set("TemplateOrganizer", {"object":TemplateOrganizer, "targets":"templates", "order": 180});
window.BITSMIST.v1.TemplateOrganizer = TemplateOrganizer;

// Pad

import Pad from './pad';
window.BITSMIST.v1.Pad = Pad;

// Store

import Store from './store/store';
window.BITSMIST.v1.Store = Store;

import ObserverStore from './store/observer-store';
window.BITSMIST.v1.ObserverStore = ObserverStore;

import OrganizerStore from './store/organizer-store';

// Tag loader

import TagLoader from './tagloader';
window.BITSMIST.v1.TagLoader = TagLoader;

// Util

import AjaxUtil from './util/ajax-util';
window.BITSMIST.v1.AjaxUtil = AjaxUtil;

import ClassUtil from './util/class-util';
window.BITSMIST.v1.ClassUtil = ClassUtil;

import Util from './util/util';
window.BITSMIST.v1.Util = Util;
