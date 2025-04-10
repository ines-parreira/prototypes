import StatsPage from 'pages/stats/common/layout/StatsPage'

export const PRODUCT_INSIGHTS_PAGE_TITLE = 'Product insights'

export const ProductInsightsPage = () => {
    return (
        <div className="full-width">
            <StatsPage title={PRODUCT_INSIGHTS_PAGE_TITLE}>
                {'some content'}
            </StatsPage>
        </div>
    )
}
