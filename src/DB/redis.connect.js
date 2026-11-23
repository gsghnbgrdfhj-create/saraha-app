import { createClient } from "redis"

export const redisclient = createClient({
    url: "redis://127.0.0.1:6379",
    database: 1
})

// export const redisclient = createClient({
//     username: 'default',
//     password: 'UetLmwS5TGfe4nFHZYgsCirmKNcMNtlO',
//     socket: {
//         host: 'keen-snow-lovely-86112.db.redis.io',
//         port: 11826
//     }
// })

redisclient.on("error", (err) => console.log("Redis client Error", err))
    .on("connect", () => console.log("Redis client connected"))
    .connect()
 