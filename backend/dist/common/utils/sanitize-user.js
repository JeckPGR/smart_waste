"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = sanitizeUser;
function sanitizeUser(user) {
    const { password: _password, ...rest } = user;
    return rest;
}
//# sourceMappingURL=sanitize-user.js.map