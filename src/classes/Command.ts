import { Role } from "./Roles";
import { ApplicationCommandOptionData, PermissionResolvable, Permissions } from "discord.js";

export default class Command {
    public name: string;
    public description: string;
    public options: ApplicationCommandOptionData[];
    public default_member_permissions: Permissions;
    public botPermissions: PermissionResolvable[];
    public requiredRoles: Role[];
    public cooldown: number;
    public enabled: boolean;
    public allowWhileBanned: boolean;
    public guildOnly: boolean;
    public deferReply: boolean;
    public ephemeral: boolean;
    public execute: Function;
}
