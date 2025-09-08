import { isProduction, isStaging } from 'utils/environment'

const CONVERT_BUNDLE_PRODUCTION_URL =
    process.env.CONVERT_BUNDLE_PRODUCTION_URL ??
    'https://bundle.9gtb.com/loader.js'
const CONVERT_BUNDLE_STAGING_URL =
    process.env.CONVERT_BUNDLE_STAGING_URL ??
    'https://bundle-staging.9gtb.com/loader.js'
const CONVERT_BUNDLE_DEVELOPMENT_URL =
    process.env.CONVERT_BUNDLE_DEVELOPMENT_URL ??
    'https://bundle-{your-name}.eu.ngrok.io/loader.js'

export const useConvertBundleInstallationSnippet = (bundleId?: string) => {
    const bundleLoaderUrl = isProduction()
        ? CONVERT_BUNDLE_PRODUCTION_URL
        : isStaging()
          ? CONVERT_BUNDLE_STAGING_URL
          : CONVERT_BUNDLE_DEVELOPMENT_URL

    const url = new URL(bundleLoaderUrl)
    if (bundleId) url.searchParams.append('g_cvt_id', bundleId)

    return (
        '<!--Bundle Start-->\n' +
        `<script src="${url.href}" async></script>` +
        '\n<!--Bundle End-->'
    )
}
