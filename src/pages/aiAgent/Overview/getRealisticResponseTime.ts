// Inspired by https://github.com/mswjs/msw/blob/main/src/core/delay.ts

export const MIN_SERVER_RESPONSE_TIME = 100
export const MAX_SERVER_RESPONSE_TIME = 400

export const getRealisticResponseTime = (): number =>
    Math.floor(
        Math.random() * (MAX_SERVER_RESPONSE_TIME - MIN_SERVER_RESPONSE_TIME) +
            MIN_SERVER_RESPONSE_TIME
    )
