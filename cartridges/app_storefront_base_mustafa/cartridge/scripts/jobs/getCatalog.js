'use strict';
​
/**
 * @description Calculates average product rating
 * @returns {integer} Average product rating
 */
function getCatalogProducts() {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var ProductMgr = require('dw/catalog/ProductMgr');

    var catalog = CatalogMgr.getCatalog('electronics-m-catalog');
}

exports.getCatalogProducts = getCatalogProducts;