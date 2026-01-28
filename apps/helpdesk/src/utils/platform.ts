/**
 * @deprecated use platform from @repo/utils
 * @date 2026-01-24
 * @type migration to @repo/utils
 */
const platform =
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (navigator?.userAgentData?.platform as string) ||
    navigator?.platform ||
    'unknown'

/**
 * @deprecated use platform from @repo/utils
 * @date 2026-01-24
 * @type migration to @repo/utils
 */
export const isMacOs = platform.toLowerCase().includes('mac')

export default platform
