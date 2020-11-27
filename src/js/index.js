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

// Mixin

import EventMixin from './mixin/event-mixin';
import LoaderMixin from './mixin/loader-mixin';

// Organizer !!!Order matters!!!

import WaitforOrganizer from './organizer/waitfor-organizer';
Globals.organizers.set("WaitforOrganizer", {"object":WaitforOrganizer, "targets":"waitFor"});

import AttrOrganizer from './organizer/attr-organizer';
Globals.organizers.set("AttrOrganizer", {"object":AttrOrganizer, "targets":"attrs"});

import ComponentOrganizer from './organizer/component-organizer';
Globals.organizers.set("ComponentOrganizer", {"object":ComponentOrganizer, "targets":"components"});

import ElementOrganizer from './organizer/element-organizer';
Globals.organizers.set("ElementOrganizer", {"object":ElementOrganizer, "targets":"elements"});

import EventOrganizer from './organizer/event-organizer';
Globals.organizers.set("EventOrganizer", {"object":EventOrganizer, "targets":"events"});

import ServiceOrganizer from './organizer/service-organizer';
Globals.organizers.set("ServiceOrganizer", {"object":ServiceOrganizer, "targets":"services"});

import TemplateOrganizer from './organizer/template-organizer';
Globals.organizers.set("TemplateOrganizer", {"object":TemplateOrganizer, "targets":"templates"});

// Pad

import Pad from './pad';
window.BITSMIST.v1.Pad = Pad;

// Store

import Store from './store';
window.BITSMIST.v1.Store = Store;

// Util

import AjaxUtil from './util/ajax-util';
window.BITSMIST.v1.AjaxUtil = AjaxUtil;

import ClassUtil from './util/class-util';
window.BITSMIST.v1.ClassUtil = ClassUtil;

import Util from './util/util';
window.BITSMIST.v1.Util = Util;
