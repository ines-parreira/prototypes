import { FailedFlag, Flag } from '../types'

export function isErrorFlag(flag: Flag): flag is FailedFlag {
    return Array.isArray(flag) && flag[0] === 'failed'
}
