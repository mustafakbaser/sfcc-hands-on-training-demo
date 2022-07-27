const Status = require('dw/system/Status');
const Site = require('dw/system/Site');

const Calendar = require('dw/util/Calendar');
const StringUtils = require('dw/util/StringUtils');

const Order = require('dw/order/Order');
const OrderMgr = require('dw/order/OrderMgr');

const logger = require('dw/system/Logger').getLogger('cs.job.OrderGuard');

/**
 * Runs the OrderGuard checks
 * 
 * @param {object} args 
 * @returns {dw.system.Status}
 */
function run(args) {
    if(!args.MaximumAgeMinutes || args.MaximumAgeMinutes < 0) {
        // Precondition: Invalid value for Max Age
        throw new Error('Please enter a value for "MaximumAgeMinutes" parameter.');
    }

    if(args.orderPlacement !== true && args.orderPayment !== true && args.orderExport !== true) {
        // Precondition: Job running without any check enabled
        throw new Error('Please select at least one check to execute.');
    }

    if(args.startTime) {
        // Precondition: Check for startTime
        let startTime = parseTimeOfDay(args.startTime);

        let now = new Calendar();

        if(now.before(startTime)) {
            return new Status(Status.OK, null, 'Skipping execution because of Start Time.')
        }
    }

    if(args.endTime) {
        // Precondition: Check for endTime
        let endTime = parseTimeOfDay(args.endTime);

        let now = new Calendar();

        if(now.after(endTime)) {
            return new Status(Status.OK, null, 'Skipping execution because of End Time.')
        }
    }

    let minCreationDateTime = getFormattedTimestamp(args.MaximumAgeMinutes);

    if(args.orderPlacement === true) {
        let result = placedOrdersExist(minCreationDateTime);

        if(result === false) {
            return new Status(Status.ERROR, null, "No Orders placed since " + args.MaximumAgeMinutes + " minutes.");
        }
    }

    if(args.orderPayment === true) {
        let result = paidOrderExists(minCreationDateTime);

        if(result === false) {
            return new Status(Status.ERROR, null, "No orders marked as paid since " + args.MaximumAgeMinutes + " minutes.");
        }
    }

    if(args.orderExport === true) {
        let result = exportedOrderExists(minCreationDateTime);

        if(result === false) {
            return new Status(Status.ERROR, null, "No Orders exported since " + args.MaximumAgeMinutes + " minutes.");
        }
    }


    return new Status(Status.OK);
}


/**
 * Parses an input string containing the time of day and converts it to a Calendar
 * 
 * @param {String} timeString The string to parse in the format hh:mm:ss
 * @returns {dw.util.Calendar} A calendar representing the entered time 
 */
function parseTimeOfDay(timeString) {
    if(!timeString) {
        throw new Error('Missing value for parameter "timeString".');
    }

    let startTimeData = timeString.split(':');

    if(startTimeData.length !== 3) {
        throw new Error('Please provide the start/end time in the format "hh:mm:ss"');
    }

    let calendar = new Calendar();
    calendar.setTimeZone(Site.getCurrent().getTimezone()); //Apply current Site's timezone
    calendar.set(Calendar.HOUR_OF_DAY, startTimeData[0]);
    calendar.set(Calendar.MINUTE, startTimeData[1]);
    calendar.set(Calendar.SECOND, startTimeData[2]);

    logger.debug("Parsed input '" + timeString + '" to "' + StringUtils.formatCalendar(calendar, "yyyy-MM-dd'T'HH:mm:ss'+Z'") + '"');

    return calendar;
}


/**
 * Creates a timestamp that is {minutes} ago
 * Timestamp is returned as a formatted String that can be used for Queries.
 * 
 * @param {integer} minutes The amount of minutes
 * @returns {string} Formatted Timestamp
 */
function getFormattedTimestamp(minutes) {
    let lastUpdateTimestamp = new Calendar();
    lastUpdateTimestamp.add(Calendar.MINUTE, minutes * -1);

    return StringUtils.formatCalendar(lastUpdateTimestamp, "yyyy-MM-dd'T'HH:mm:ss'+Z'");
}


/**
 * Check for placed orders with a minimum creation date
 * 
 * @param {String} minTimeFormatted Formatted "minimum creation Date" timestamp to be used for Query
 * @returns {boolean} True if orders were found
 */
 function placedOrdersExist(minTimeFormatted) {
    let queryString = 'creationDate >= {0} AND (status = {1} OR status = {2})';
    let searchResult = OrderMgr.searchOrders(queryString, null, minTimeFormatted, Order.ORDER_STATUS_NEW, Order.ORDER_STATUS_OPEN);

    let result = (searchResult.getCount() > 0);

    searchResult.close();

    return result;
}


/**
 * Check for paid orders with a minimum creation date
 * 
 * @param {String} minTimeFormatted Formatted "minimum creation Date" timestamp to be used for Query
 * @returns {boolean} True if orders were found
 */
 function paidOrderExists(minTimeFormatted) {
    let queryString = 'creationDate >= {0} AND (paymentStatus = {1})';

    let searchResult = OrderMgr.searchOrders(queryString, null, minTimeFormatted, Order.PAYMENT_STATUS_PAID);
    let result = (searchResult.getCount() > 0);

    searchResult.close();

    return result;
}


/**
 * Check for exported orders with a minimum creation date
 * 
 * @param {String} minTimeFormatted Formatted "minimum creation Date" timestamp to be used for Query
 * @returns {boolean} True if orders were found
 */
function exportedOrderExists(minTimeFormatted) {
    let queryString = 'creationDate >= {0} AND (exportStatus = {1})';

    let searchResult = OrderMgr.searchOrders(queryString, null, minTimeFormatted, Order.EXPORT_STATUS_EXPORTED);
    let result = (searchResult.getCount() > 0);

    searchResult.close();

    return result;
}




module.exports.run = run;