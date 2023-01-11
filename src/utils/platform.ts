const platform =
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (navigator?.userAgentData?.platform as string) ||
    navigator?.platform ||
    'unknown'

export const isMacOs = platform.toLowerCase().includes('mac')

export default platform
