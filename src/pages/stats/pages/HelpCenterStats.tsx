import React from 'react'
import classnames from 'classnames'
import StatsPage from '../StatsPage'
import DashboardSection from '../DashboardSection'
import css from '../SupportPerformanceOverview.less'
import useAppSelector from '../../../hooks/useAppSelector'
import {getTimezone} from '../../../state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from '../revenue/constants/components'

const PAGE_TITLE_HELP_CENTER = 'Help Center'

export const HelpCenterStats = () => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    return (
        <div className="full-width">
            <StatsPage title={PAGE_TITLE_HELP_CENTER} filters={<div></div>}>
                <DashboardSection title="Overview">Content</DashboardSection>
                <DashboardSection title="Performance">Content</DashboardSection>
                <DashboardSection title="Help Center searches">
                    Content
                </DashboardSection>
                {userTimezone && (
                    <div
                        className={classnames(
                            css.pageFooter,
                            'caption-regular'
                        )}
                    >
                        Analytics are using {userTimezone} timezone
                    </div>
                )}
            </StatsPage>
        </div>
    )
}
