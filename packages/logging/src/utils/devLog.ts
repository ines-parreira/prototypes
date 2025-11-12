import { isProduction } from '@repo/utils'

/**
 * Console log info only on dev environment
 */
export const devLog = (...args: Array<unknown>) => {
    if (!isProduction()) {
        // eslint-disable-next-line no-console
        console.log(...args)
    }
}
