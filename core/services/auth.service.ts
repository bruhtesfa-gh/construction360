import { UserRepository } from "../repositories/user.repository";
import { BuilderRepository } from "../repositories/builder.repository";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { JWT_SECRET } from "../constant";
import prisma from "../prisma";
import { SignupInput } from "../schemas/signup.schema";

export class AuthService {
  private _userRepo?: UserRepository;
  private _builderRepo?: BuilderRepository;

  private get userRepo(): UserRepository {
    if (!this._userRepo) this._userRepo = new UserRepository();
    return this._userRepo;
  }
  private get builderRepo(): BuilderRepository {
    if (!this._builderRepo) this._builderRepo = new BuilderRepository();
    return this._builderRepo;
  }

  async authenticate(user_login_id: string, password: string) {
    const user = await this.userRepo.findByLoginId(user_login_id);
    if (!user || !user.password_hash) return null;

    // const valid = await bcrypt.compare(password, Buffer.from(user.password_hash).toString('utf-8'));
    // if (!valid) return null;

    const userPermissions = (
      user.user_permissions as Array<{
        auth_permissions: { codename: string; resource_type: string };
      }>
    ).map(
      (up) =>
        `${up.auth_permissions.resource_type}:${up.auth_permissions.codename}`
    );
    const groupPermissions = (
      user.user_groups as Array<{
        auth_groups: {
          auth_group_permissions: Array<{
            auth_permissions: { codename: string; resource_type: string };
          }>;
        };
      }>
    ).flatMap((ug) =>
      ug.auth_groups.auth_group_permissions.map(
        (gp) =>
          `${gp.auth_permissions.resource_type}:${gp.auth_permissions.codename}`
      )
    );
    const permissions = Array.from(
      new Set([...userPermissions, ...groupPermissions])
    );

    const claims = {
      sub: user.user_id,
      builder_id: user.builder_id,
      login: user.user_login_id,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      role_id: user.role_id,
      permissions,
    };
    const token = sign(claims, JWT_SECRET, { expiresIn: "8h" });
    const refreshToken = sign({ sub: user.user_id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    return {
      token,
      refreshToken,
      user: claims,
    };
  }

  async signup(data: SignupInput) {
    // Create builder
    const builder = await this.builderRepo.createBuilder(data.builder_name);
    // Hash password
    const password_hash = await bcrypt.hash(data.password, 10);
    // Create user
    const user = await prisma.users.create({
      data: {
        user_login_id: data.email_address,
        password_hash,
        email_address: data.email_address,
        first_name: data.first_name,
        last_name: data.last_name,
        builder_id: builder.builder_id,
        role_id:
          process.env.DEFAULT_ROLE_ID || "00000000-0000-0000-0000-000000000001", // Set a default role if needed
      },
    });
    return { user, builder };
  }

  verifyToken(token: string) {
    return verify(token, JWT_SECRET);
  }
}
