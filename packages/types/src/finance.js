"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionReferenceType = exports.LedgerTransactionType = exports.PaymentStatus = exports.PaymentMethod = void 0;
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["WALLET"] = "WALLET";
    PaymentMethod["JAZZCASH"] = "JAZZCASH";
    PaymentMethod["EASYPAISA"] = "EASYPAISA";
    PaymentMethod["BANK_CARD"] = "BANK_CARD";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["AUTHORIZED"] = "AUTHORIZED";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var LedgerTransactionType;
(function (LedgerTransactionType) {
    LedgerTransactionType["CREDIT"] = "CREDIT";
    LedgerTransactionType["DEBIT"] = "DEBIT";
})(LedgerTransactionType || (exports.LedgerTransactionType = LedgerTransactionType = {}));
var TransactionReferenceType;
(function (TransactionReferenceType) {
    TransactionReferenceType["RIDE_PAYMENT"] = "RIDE_PAYMENT";
    TransactionReferenceType["RIDE_EARNING"] = "RIDE_EARNING";
    TransactionReferenceType["MECHANIC_PAYMENT"] = "MECHANIC_PAYMENT";
    TransactionReferenceType["MECHANIC_EARNING"] = "MECHANIC_EARNING";
    TransactionReferenceType["HOME_SERVICE_PAYMENT"] = "HOME_SERVICE_PAYMENT";
    TransactionReferenceType["HOME_SERVICE_EARNING"] = "HOME_SERVICE_EARNING";
    TransactionReferenceType["COMMISSION_DEDUCTION"] = "COMMISSION_DEDUCTION";
    TransactionReferenceType["WALLET_TOPUP"] = "WALLET_TOPUP";
    TransactionReferenceType["WALLET_WITHDRAWAL"] = "WALLET_WITHDRAWAL";
    TransactionReferenceType["PROMOTIONAL_CREDIT"] = "PROMOTIONAL_CREDIT";
    TransactionReferenceType["REFUND"] = "REFUND";
})(TransactionReferenceType || (exports.TransactionReferenceType = TransactionReferenceType = {}));
