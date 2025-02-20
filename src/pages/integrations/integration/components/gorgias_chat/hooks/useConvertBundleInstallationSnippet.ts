import {isProduction, isStaging} from 'utils/environment'

const CONVERT_BUNDLE_PRODUCTION_URL =
    process.env.CONVERT_BUNDLE_PRODUCTION_URL ??
    'https://bundle.dyn-rev.app/loader.js'
const CONVERT_BUNDLE_STAGING_URL =
    process.env.CONVERT_BUNDLE_STAGING_URL ??
    'https://bundle-staging.dyn-rev.app/loader.js'
const CONVERT_BUNDLE_DEVELOPMENT_URL =
    process.env.CONVERT_BUNDLE_DEVELOPMENT_URL ??
    'https://bundle-<your-name>.eu.ngrok.io/loader.js'

export const useConvertBundleInstallationSnippet = () => {
    const url = isProduction()
        ? CONVERT_BUNDLE_PRODUCTION_URL
        : isStaging()
          ? CONVERT_BUNDLE_STAGING_URL
          : CONVERT_BUNDLE_DEVELOPMENT_URL
    return (
        '<!--Bundle Start-->\n' +
        `<script src="${url}" async></script>` +
        '\n<!--Bundle End-->'
    )
}
