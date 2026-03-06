import { getEnvironment, GorgiasUIEnv } from '@repo/utils'

const privateBuckets: Record<GorgiasUIEnv, string> = {
    [GorgiasUIEnv.Development]: '//uploads.gorgi.us',
    [GorgiasUIEnv.Production]: '//uploads.gorgias.io',
    [GorgiasUIEnv.Staging]: '//uploads.gorgias.xyz',
}

/**
 * @deprecated use the @repo/utils version instead
 * @date 2026-03-02
 * @type migration to @repo/utils
 */
export default function isPrivateAsset(url: string) {
    const bucketUrl = privateBuckets[getEnvironment()]
    return url.includes(bucketUrl)
}
