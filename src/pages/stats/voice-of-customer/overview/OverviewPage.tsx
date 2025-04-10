import StatsPage from 'pages/stats/common/layout/StatsPage'

export const OVERVIEW_PAGE_TITLE = 'Overview'

export const OverviewPage = () => {
    return (
        <div className="full-width">
            <StatsPage title={OVERVIEW_PAGE_TITLE}>{'some content'}</StatsPage>
        </div>
    )
}
