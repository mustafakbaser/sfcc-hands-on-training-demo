'use strict';

var Calendar = require('dw/util/Calendar');
var Site = require('dw/system/Site');
var StringUtils = require('dw/util/StringUtils');

var DATE_FORMAT = 'yyyy-MM-dd';
var DATETIME_FORMAT_PATH = 'yyyy-MM-dd_HH-mm-ss-SSS';
var DATETIME_FORMAT_QUERY = "yyyy-MM-dd'T'hh:mm:ss";
var NOW_MINUS_MINUTES_REGEX = /_now_\s?-([0-9]+)/g; // Example: https://regex101.com/r/jYa91l/1
var TODAY_MINUS_HOURS_REGEX = /_today_\s?-([0-9]+)/g; // Example: https://regex101.com/r/H3ZGU4/1

/**
 * Returns true if the given {params} object contains a isDisabled property as true.
 * This will allows us to disable a step without removing it from the configuration
 *
 * @param {Object} params
 *
 * @return {Boolean}
 */
module.exports.isDisabled = function (params) {
    if (empty(params)) {
        return false;
    }

    return ['true', true].indexOf(params.IsDisabled) > -1;
};

/**
 * Replace some placeholders found in the given {str} by dynamic values
 * Available placeholders: see replacePlaceholders()
 *
 * @param {String} str
 *
 * @returns {String}
 */
module.exports.replaceQueryPlaceholders = function (str) {
    return replacePlaceholders(str, DATETIME_FORMAT_QUERY);
};

/**
 * Replace some placeholders found in the given {str} by dynamic values
 * Available placeholders: see replacePlaceholders()
 *
 * @param {String} str
 *
 * @returns {String}
 */
module.exports.replacePathPlaceholders = function (str) {
    return replacePlaceholders(str, DATETIME_FORMAT_PATH);
};

/**
 * Replace some placeholders found in the given {str} by dynamic values
 * Available placeholders:
 * _today_ -[0-9]+ : Will be the current date time minus xx hours, formatted with the date time format.
 * This regexp allows you to apply dynamic time within the past, for example:
 * "_today_ -1" will return the current time minus 1 hour
 * "_today_ -24" will return the current time minus 24 hours
 * ------------
 * _now_ -[0-9]+ : Will be the current date time minus xx minutes, formatted with the date time format.
 * This regexp allows you to apply dynamic time within the past, for example:
 * "_now_ -60" will return the current time minus 1 hour
 * "_now_ -1440" will return the current time minus 24 hours
 * ------------
 * _today_ : Will be the current date, formatted with the date format
 * ------------
 * _now_ : Will be the current date time, formatted with the date time format
 * ------------
 * _siteid_ : Will be the current site ID
 *
 * @param {String} str
 *
 * @returns {String}
 */
function replacePlaceholders(str, dateTimeFormat) {
    if (empty(str)) {
        return str;
    }

    var siteID = Site.getCurrent().getID();
    var calendar = new Calendar();

    if (str.match(TODAY_MINUS_HOURS_REGEX)) { // This check has to be executed before the "_today_" pattern, else the "_today_" pattern will take precedence on this one
        str = applyRegexOnString(str, TODAY_MINUS_HOURS_REGEX, Calendar.HOUR, DATE_FORMAT);
    }
    if (str.match(NOW_MINUS_MINUTES_REGEX)) { // This check has to be executed before the "_now_" pattern, else the "_now_" pattern will take precedence on this one
        str = applyRegexOnString(str, NOW_MINUS_MINUTES_REGEX, Calendar.MINUTE, dateTimeFormat);
    }
    if (str.indexOf('_today_') > -1) {
        str = str.replace(/_today_/, StringUtils.formatCalendar(calendar, DATE_FORMAT));
    }
    if (str.indexOf('_now_') > -1) {
        str = str.replace(/_now_/, StringUtils.formatCalendar(calendar, dateTimeFormat));
    }
    if (str.indexOf('_siteid_') > -1) {
        str = str.replace(/_siteid_/, siteID);
    }

    return str;
};

/**
 * Replace the matchings of the given {regex} on the given {str} by the calculated values
 *
 * @param {String} str The string on which to apply the regex to
 * @param {Regex} regex The regex to apply
 * @param {Number} unit The calendar unit to use
 * @param {String} format The format to use to format the calendar value
 */
function applyRegexOnString(str, regex, unit, format) {
    if (empty(str)) {
        return str;
    }

    var match;
    while ((match = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        var value = parseInt(match[1], 10);
        if (value !== NaN) {
            var calendar = new Calendar();
            calendar.add(unit, - value);
            str = str.replace(match[0], StringUtils.formatCalendar(calendar, format));
        }
    }

    return str;
}