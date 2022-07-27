'use strict';
​
/**
 * @description Calculates average product rating
 * @returns {integer} Average product rating
 */
function generateProductFeed() {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var ProductMgr = require('dw/catalog/ProductMgr');

    var catalog = CatalogMgr.getCatalog('apparel-m-catalog');
}

exports.generateProductFeed = generateProductFeed;