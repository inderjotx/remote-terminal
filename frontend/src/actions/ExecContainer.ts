"use server"
import { z } from "zod"

const execSchema = z.object({
    command: z.string().min(1),
    containerName: z.string().min(1)
})

export async function execContainer(formData: FormData) {


    const obj = {
        command: formData.get("command"),
        containerName: formData.get("containerName")
    }

    const parsed = execSchema.safeParse(obj)

    if (!parsed.success) {
        return {
            success: false,
            message: "Invalid Request",
            responseObject: parsed.error.message,
            statusCode: 400
        }
    }

    const { command, containerName } = parsed.data



    const res = await fetch(`${process.env.BACKEND_URL}/container/execute-command`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ command, containerName })
    })

    if (!res.ok) {
        throw new Error("Failed to fetch health check")
    }

    try {

        const data = await res.json()
        return data
    } catch (error) {
        console.log(res.body)
        console.log(error);
        return {
            success: false,
            message: "Failed to execute command",
            responseObject: error,
            statusCode: 500
        }
    }
}