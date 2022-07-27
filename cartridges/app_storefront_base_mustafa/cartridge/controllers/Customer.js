'user strict';


var server = require('server');


server.get('Show', function (req, res, next) {
  var CustomerMgr = require('dw/customer/CustomerMgr');
  var drivingLicence = req.querystring.q;

  var customer = CustomerMgr.queryProfile('custom.drivingLicence = {0}', drivingLicence);


  if(customer){
    res.json({
      customerNo: customer.customerNo,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      customerEmail: customer.email,
      customerDrivingLicense: customer.custom.drivingLicence
    })
  }
  else{
    res.setStatusCode(404);
    res.render('error/notFound');
  }
  next();
});  

module.exports = server.exports();