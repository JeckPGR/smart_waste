"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryReportsDto = exports.UpdateStatusDto = exports.UpdateReportDto = exports.CreateReportDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
class CreateReportDto {
    description;
    latitude;
    longitude;
    address;
    category;
    aiConfidence;
    static _OPENAPI_METADATA_FACTORY() {
        return { description: { required: false, type: () => String }, latitude: { required: true, type: () => Number, minimum: -90, maximum: 90 }, longitude: { required: true, type: () => Number, minimum: -180, maximum: 180 }, address: { required: false, type: () => String }, category: { required: false, enum: ["ORGANIC", "PLASTIC", "PAPER"] }, aiConfidence: { required: false, type: () => Number, minimum: 0, maximum: 1 } };
    }
}
exports.CreateReportDto = CreateReportDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "latitude", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.WasteCategory),
    __metadata("design:type", String)
], CreateReportDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "aiConfidence", void 0);
class UpdateReportDto extends (0, swagger_1.PartialType)(CreateReportDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateReportDto = UpdateReportDto;
class UpdateStatusDto {
    status;
    note;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"] }, note: { required: false, type: () => String } };
    }
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ReportStatus),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "note", void 0);
class QueryReportsDto extends pagination_dto_1.PaginationDto {
    search;
    status;
    category;
    userId;
    dateFrom;
    dateTo;
    sortBy = 'createdAt';
    order = 'desc';
    static _OPENAPI_METADATA_FACTORY() {
        return { search: { required: false, type: () => String }, status: { required: false, enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"] }, category: { required: false, enum: ["ORGANIC", "PLASTIC", "PAPER"] }, userId: { required: false, type: () => String, format: "uuid" }, dateFrom: { required: false, type: () => String }, dateTo: { required: false, type: () => String }, sortBy: { required: true, default: "createdAt", enum: ["createdAt", "updatedAt", "status"], enum: ['createdAt', 'updatedAt', 'status'] }, order: { required: true, default: "desc", enum: ["asc", "desc"], enum: ['asc', 'desc'] } };
    }
}
exports.QueryReportsDto = QueryReportsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ReportStatus),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.WasteCategory),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "dateFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "dateTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['createdAt', 'updatedAt', 'status']),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], QueryReportsDto.prototype, "order", void 0);
//# sourceMappingURL=reports.dto.js.map