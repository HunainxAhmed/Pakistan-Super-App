"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRequestStatus = exports.PricingModel = exports.ServiceCategorySlug = void 0;
var ServiceCategorySlug;
(function (ServiceCategorySlug) {
    ServiceCategorySlug["RIDE"] = "RIDE";
    ServiceCategorySlug["FOOD"] = "FOOD";
    ServiceCategorySlug["MECHANIC"] = "MECHANIC";
    ServiceCategorySlug["HOME_SERVICE"] = "HOME_SERVICE";
})(ServiceCategorySlug || (exports.ServiceCategorySlug = ServiceCategorySlug = {}));
var PricingModel;
(function (PricingModel) {
    PricingModel["DISTANCE_TIME"] = "DISTANCE_TIME";
    PricingModel["FIXED"] = "FIXED";
    PricingModel["HOURLY"] = "HOURLY";
    PricingModel["BARGAIN_INDRIVE"] = "BARGAIN_INDRIVE";
    PricingModel["QUOTE_BASED"] = "QUOTE_BASED";
})(PricingModel || (exports.PricingModel = PricingModel = {}));
var ServiceRequestStatus;
(function (ServiceRequestStatus) {
    ServiceRequestStatus["REQUESTED"] = "REQUESTED";
    ServiceRequestStatus["MATCHING"] = "MATCHING";
    ServiceRequestStatus["OFFERS_OPEN"] = "OFFERS_OPEN";
    ServiceRequestStatus["ACCEPTED"] = "ACCEPTED";
    ServiceRequestStatus["PROVIDER_EN_ROUTE"] = "PROVIDER_EN_ROUTE";
    ServiceRequestStatus["ARRIVED"] = "ARRIVED";
    ServiceRequestStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ServiceRequestStatus["COMPLETED"] = "COMPLETED";
    ServiceRequestStatus["CANCELLED"] = "CANCELLED";
    ServiceRequestStatus["DISPUTED"] = "DISPUTED";
})(ServiceRequestStatus || (exports.ServiceRequestStatus = ServiceRequestStatus = {}));
