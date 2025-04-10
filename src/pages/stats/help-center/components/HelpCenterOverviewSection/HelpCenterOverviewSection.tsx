import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import {
    HelpCenterChart,
    HelpCenterReportConfig,
} from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'

// import TipsToggle from 'pages/common/components/TipsToggle/TipsToggle'

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
