import {webhook} from "svix";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req) {
    const wh = new webhook(process.env.SVIX_CLERK_SECRET);
    const headerPayload = await headers()
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-timestamp": headerPayload.get("svix-timestamp"),
        "svix-signature": headerPayload.get("svix-signature"),
    } ;
    //Get payload

    const payload = await req.json();
    const body = JSON.stringify(payload);
    const {data, type} = wh.verify(body, svixHeaders);

    // prepare the user data
    const userData = {
        _id: data.id,
        name: data.first_name + " " + data.last_name,
        email: data.email_addresses[0].email_address,
        image: data.profile_image_url,
    };

    await connectDB();

    switch (type) {
        case "user.created":
            try {
                await User.create(userData);
            } catch (error) {
                console.error("Error creating user:", error);
            }
            break;
        case "user.updated":
            // Update existing user in the database
            try {
                await User.findByIdAndUpdate(data.id, userData);
            } catch (error) {
                console.error("Error updating user:", error);
            }
            break;

            case "user.deleted":
                // Update existing user in the database
                try {
                    await User.findByIdAndDelete(data.id);
                } catch (error) {
                    console.error("Error updating user:", error);
                }
                break;

        default:
            console.log(`Unhandled event type: ${type}`);
    }
    return NextRequest.json({message: "Event received"});

}