import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum Role {
    ADMIN = 'admin',
    HR = 'hr',
    EMPLOYEE = 'emploeer'
}
@Schema({ timestamps: true })
export class User {
    @Prop({required: true})
    username: string;

    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({
        enum: Role,
        default: Role.HR
    })
    role: Role;
}
export const UserSchema = SchemaFactory.createForClass(User);

