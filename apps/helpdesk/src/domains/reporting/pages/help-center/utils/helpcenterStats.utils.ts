import { getAbsoluteUrl } from 'pages/settings/helpCenter/utils/helpCenter.utils'

export const getArticleUrl = ({
    slug,
    domain,
    locale,
}: {
    slug: string
    domain: string
    locale: string
}) => {
    const url = getAbsoluteUrl({ domain, locale })

    return `${url}${slug}`
}
