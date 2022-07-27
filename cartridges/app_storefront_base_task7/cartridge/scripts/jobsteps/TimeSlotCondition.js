/**
* Tests the time slot condition and returns a SUSPEND if the test failed; OK otherwise.
*/

var Status = require('dw/system/Status');
var Calendar = require('dw/util/Calendar');
var System = require('dw/system/System');
var Site = require('dw/system/Site');

/**
 * Tests the time slot condition and returns a SUSPEND if the test failed; OK otherwise.
 *
 * @param {object} args Job Configuration
 * @returns {dw.system.Status} Job Status
 */
function testTimeSlot(args) {
	var startTime = args.startTime;
	var endTime = args.endTime;
	var withinMode = args.mode === 'WITHIN';
	var useSiteTimeZone = args.timezone === 'SITE';

	var startCalendar;
	var endCalendar;

	var nowCalendar = System.getCalendar();

	if (useSiteTimeZone) {
		nowCalendar = Site.getCurrent().getCalendar();
	}

	startCalendar = new Calendar(startTime);
	startCalendar.setTimeZone(nowCalendar.getTimeZone());

	endCalendar = new Calendar(endTime);
	endCalendar.setTimeZone(nowCalendar.getTimeZone());

	if (useSiteTimeZone) {
		// Interpret the entered hours+minutes in the Site's Time Zone
		startCalendar.set(Calendar.HOUR_OF_DAY, startTime.getHours());
		startCalendar.set(Calendar.MINUTE, startTime.getMinutes());

		endCalendar.set(Calendar.HOUR_OF_DAY, endTime.getHours());
		endCalendar.set(Calendar.MINUTE, endTime.getMinutes());
	}

	if (startCalendar.after(endCalendar)) {
		// Overnight time slot
		endCalendar.add(Calendar.HOUR_OF_DAY, 24);
	}

	var withinTimeSlot = startCalendar.before(nowCalendar) && endCalendar.after(nowCalendar);

	// default exit code
	var exitStatusCode = 'OK';

	// suspend if: ourside slot & mode "within" or inside slot and mode "not within"
	if (withinTimeSlot === withinMode) {
		exitStatusCode = 'SUSPEND';
	}

	return new Status(Status.OK, exitStatusCode);
}

/*
 * Job exposed methods
 */
exports.testTimeSlot = testTimeSlot;
