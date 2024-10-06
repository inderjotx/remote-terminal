"use server"

export async function createContainer() {

    const res = await fetch(`${process.env.BACKEND_URL}/container/create`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })

    if (!res.ok) {
        throw new Error("Failed to create container")
    }

    const data = await res.json()
    return data
}