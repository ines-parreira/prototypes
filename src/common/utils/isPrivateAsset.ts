import { getEnvironment, GorgiasUIEnv } from 'utils/environment'

const privateBuckets: Record<GorgiasUIEnv, string> = {
    [GorgiasUIEnv.Development]: '//uploads.gorgi.us',
    [GorgiasUIEnv.Production]: '//uploads.gorgias.io',
    [GorgiasUIEnv.Staging]: '//uploads.gorgias.xyz',
}

export default function isPrivateAsset(url: string) {
    const bucketUrl = privateBuckets[getEnvironment()]
    return url.includes(bucketUrl)
}
