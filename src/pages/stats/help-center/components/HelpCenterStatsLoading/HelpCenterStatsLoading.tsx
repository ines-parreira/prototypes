import React from 'react'
import StatsPage from 'pages/stats/StatsPage'
import Loader from 'pages/common/components/Loader/Loader'

type HelpCenterStatsLoadingProps = {
    title: string
}

const HelpCenterStatsLoading = ({title}: HelpCenterStatsLoadingProps) => (
    <div className="full-width">
        <StatsPage title={title} filters={<></>}>
            <Loader size="24px" data-testid="help-center-stats-loader" />
        </StatsPage>
    </div>
)

export default HelpCenterStatsLoading
