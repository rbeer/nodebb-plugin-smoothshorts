'use strict';

class ServiceModule {
  constructor(serviceId) {
    this.serviceModule = require(`nodebb-plugin-shorturls-${serviceId}`);
    checkRequirements(this.serviceModule, serviceId);
  }

  requestShortUrl(longUrl) {
    return this.serviceModule.requestShortUrl(longUrl);
  }

  get name() {
    return this.serviceModule.name;
  }

  get info() {
    return this.serviceModule.info;
  }
}

function ImplementationError(missingField, serviceId) {
  let err = new Error(`Missing member '${missingField}' in service module '${serviceId}'! Skipping...`);
  err.code = 'EMISSMEMBER';
  return err;
};

function checkRequirements(serviceModule, serviceId) {
  let requiredFields = [ 'name', 'info', 'requestShortUrl' ];

  requiredFields.forEach((field) => {
    if (!serviceModule.hasOwnProperty(field)) {
      throw new ImplementationError(field, serviceId);
    }
  });

};

module.exports = ServiceModule;
