"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const nodemailer = __importStar(require("nodemailer"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials, please check your email');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials, please check your password');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated, please contact the administrators');
        }
        const permissions = await this.usersService.getUserPermissions(user.id);
        const roles = user.userRoles.map((ur) => ur.role.name);
        console.log(`User warehouseId: ${user.warehouseId}`);
        const warehouse = user.warehouseId
            ? await this.usersService.getWarehouse(user.warehouseId)
            : null;
        console.log(`Fetched warehouse:`, warehouse);
        const payload = {
            sub: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles,
            permissions,
            warehouse,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles,
                permissions,
                warehouse,
            },
        };
    }
    async validateUser(payload) {
        return await this.usersService.findOne(payload.sub);
    }
    async forgotPassword(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            return { message: 'If your email exists, a reset link has been sent.' };
        }
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await this.usersService.update(user.id, user);
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@stock.com',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
<html>
  <body style="background: #f3f6fc; font-family: 'Segoe UI', Arial, sans-serif; padding: 0; margin: 0;">
    <table width="100%" style="max-width: 500px; margin: 48px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(60,72,180,0.10); overflow: hidden;">
      <tr>
        <td style="background: linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%); padding: 32px 0; text-align: center;">
          <span style="display: inline-block; margin-bottom: 10px;">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#fff"/>
              <text x="50%" y="55%" text-anchor="middle" fill="#6366f1" font-size="22" font-family="Segoe UI, Arial, sans-serif" font-weight="bold" dy=".3em">SM</text>
            </svg>
          </span>
          <h3 style="color: #fff; margin: 0; font-size: 2.2rem; font-family: 'Segoe UI', Arial, sans-serif; letter-spacing: 1px;">StockMe</h3>
        </td>
      </tr>
      <tr>
        <td style="padding: 40px 32px 32px 32px;">
          <h3 style="color: #222; margin-bottom: 16px; font-size: 1.35rem; font-weight: 600;">Reset Your Password</h3>
          <p style="color: #555; font-size: 1.05rem; margin-bottom: 28px; line-height: 1.6;">
            We received a request to reset your password for your <b>StockMe</b> account.<br>
            Click the button below to set a new password. This link expires in <b>1 hour</b>.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%); color: #fff; font-weight: 600; padding: 16px 38px; border-radius: 10px; text-decoration: none; font-size: 1.15rem; box-shadow: 0 2px 12px rgba(99,102,241,0.13); transition: background 0.2s; margin-bottom: 18px;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 0.98rem; margin-top: 36px; text-align: center;">
            If you did not request this, you can safely ignore this email.<br>
            For help, contact <a href="mailto:support@stockme.com" style="color: #6366f1; text-decoration: underline;">support@stockme.com</a>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background: #f3f6fc; color: #aaa; text-align: center; font-size: 0.95rem; padding: 22px;">
          &copy; ${new Date().getFullYear()} StockMe. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
</html>
`,
        });
        return { message: 'If your email exists, a reset link has been sent.' };
    }
    async resetPassword(dto) {
        const user = await this.usersService.findOneByResetToken(dto.token);
        if (!user ||
            !user.resetPasswordToken ||
            user.resetPasswordToken !== dto.token) {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new common_1.BadRequestException('Token expired');
        }
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await this.usersService.update(user.id, user);
        return { message: 'Password has been reset successfully.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map