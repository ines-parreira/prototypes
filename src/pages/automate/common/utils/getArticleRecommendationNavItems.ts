export const getArticleRecommendationNavItems = (
    shopType: string,
    shopName: string
) => {
    const baseUrl = `/app/automation/${shopType}/${shopName}/article-recommendation`
    return [
        {
            route: baseUrl,
            title: 'Train',
            exact: true,
        },
        {
            route: `${baseUrl}/configuration`,
            title: 'Configuration',
            exact: true,
        },
    ]
}
