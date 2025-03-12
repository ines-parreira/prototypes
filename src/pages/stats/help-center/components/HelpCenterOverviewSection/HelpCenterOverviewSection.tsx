import React from 'react'

import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import DashboardSection from 'pages/stats/DashboardSection'
import {
    HelpCenterChart,
    HelpCenterReportConfig,
} from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'

// import TipsToggle from 'pages/stats/TipsToggle'

const HelpCenterOverviewSection = () => {
    // FIXME: uncomment it as soon as the documentation article links are ready
    // const onTipsToggleClick = () => {
    //     setIsTipsVisible(!isTipVisible)
    // }

    return (
        <DashboardSection
            title="Overview"
            titleExtra={
                null
                // FIXME: uncomment it as soon as the documentation article links are ready
                // <TipsToggle
                //     isVisible={isTipVisible}
                //     onClick={onTipsToggleClick}
                // />
            }
        >
            <DashboardGridCell size={6}>
                <DashboardComponent
                    chart={HelpCenterChart.ArticleViewsTrendCard}
                    config={HelpCenterReportConfig}
                />
            </DashboardGridCell>
            <DashboardGridCell size={6}>
                <DashboardComponent
                    chart={HelpCenterChart.SearchesTrendCard}
                    config={HelpCenterReportConfig}
                />
            </DashboardGridCell>
        </DashboardSection>
    )
}

export default HelpCenterOverviewSection
