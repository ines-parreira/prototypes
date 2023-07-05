import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import DashboardSection from './DashboardSection'
import StatsPage from './StatsPage'
import {LEARN_MORE_URL} from './SupportPerformanceOverview'

export const AGENTS_PAGE_TITLE = 'Agents'
export const AGENT_PERFORMANCE_SECTION_TITLE = 'Agent Performance'
export const AGENT_PERFORMANCE_LEGACY_PATH =
    '/app/stats/support-performance-agents-legacy'
export default function SupportPerformanceAgents() {
    const [isVersionBannerVisible, setIsVersionBannerVisible] = useState(true)

    return (
        <div className="full-width">
            {isVersionBannerVisible ? (
                <BannerNotification
                    actionHTML={
                        <Link to={AGENT_PERFORMANCE_LEGACY_PATH}>
                            <i className="material-icons">refresh</i> Switch To
                            Old Version
                        </Link>
                    }
                    closable
                    dismissible={false}
                    message={
                        <span>
                            Welcome to the new Agents Performance beta! The
                            metrics are computed in a new way to represent your
                            performance more accurately.{' '}
                            <a href={LEARN_MORE_URL}>Learn more.</a>
                        </span>
                    }
                    onClose={() => setIsVersionBannerVisible(false)}
                />
            ) : null}
            <StatsPage title={AGENTS_PAGE_TITLE} filters={<></>}>
                <DashboardSection title={AGENT_PERFORMANCE_SECTION_TITLE}>
                    <>...</>
                </DashboardSection>
            </StatsPage>
        </div>
    )
}
