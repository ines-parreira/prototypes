import { isProduction } from '@repo/utils'

export function assertNever(value: never): never {
    if (!isProduction()) {
        throw new Error(
            `Unhandled discriminated union member: ${JSON.stringify(value)}`,
        )
    }
    // Fail safe by returning null in production but forcing it to be never to get the type checking benefits
    return null as never
}
