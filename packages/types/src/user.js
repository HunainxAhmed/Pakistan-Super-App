"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationStatus = exports.AccountStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["OPERATIONS_MANAGER"] = "OPERATIONS_MANAGER";
    UserRole["FINANCE_MANAGER"] = "FINANCE_MANAGER";
    UserRole["SUPPORT_AGENT"] = "SUPPORT_AGENT";
    UserRole["RESTAURANT_MANAGER"] = "RESTAURANT_MANAGER";
    UserRole["SERVICE_CATEGORY_MANAGER"] = "SERVICE_CATEGORY_MANAGER";
    UserRole["PROVIDER"] = "PROVIDER";
    UserRole["DRIVER"] = "DRIVER";
    UserRole["DELIVERY_PARTNER"] = "DELIVERY_PARTNER";
    UserRole["MECHANIC"] = "MECHANIC";
    UserRole["TECHNICIAN"] = "TECHNICIAN";
    UserRole["CUSTOMER"] = "CUSTOMER";
})(UserRole || (exports.UserRole = UserRole = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["PENDING_VERIFICATION"] = "PENDING_VERIFICATION";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["BANNED"] = "BANNED";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    VerificationStatus["APPROVED"] = "APPROVED";
    VerificationStatus["REJECTED"] = "REJECTED";
    VerificationStatus["SUSPENDED"] = "SUSPENDED";
    VerificationStatus["EXPIRED"] = "EXPIRED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
