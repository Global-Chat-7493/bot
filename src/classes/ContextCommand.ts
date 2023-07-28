import { Role } from "./Roles";
import { ContextMenuCommandType, PermissionResolvable, Permissions } from "discord.js";

export default class {
    public name: string;
    public type: ContextMenuCommandType;
    public default_member_permissions: Permissions;
    public botPermissions: PermissionResolvable[];
    public requiredRoles: Role[];
    public cooldown: number;
    public enabled: boolean;
    public allowWhileBanned: boolean;
    public staffOnly: boolean;
    public deferReply: boolean;
    public ephemeral: boolean;
    public execute: Function;
}
