import type { History, Location } from 'history'

/**
 * Updates the article ID in the URL path and preserves query parameters
 * @param location - Current location object from react-router
 * @param history - History object from react-router
 * @param articleType - Type of article (faq, guidance, etc.)
 * @param newArticleId - The new article ID to navigate to
 */
export function updateArticleIdInUrl(
    location: Location,
    history: History,
    articleType: 'faq' | 'guidance',
    newArticleId: number,
): void {
    const regex = new RegExp(`\\/${articleType}\\/\\d+`)
    const newPath = location.pathname.replace(
        regex,
        `/${articleType}/${newArticleId}`,
    )
    const params = new URLSearchParams(location.search)
    const queryString = params.toString()
    history.replace(queryString ? `${newPath}?${queryString}` : newPath)
}
