import React from 'react'
import {Link} from 'react-router-dom'

import icon from 'assets/img/help-center/no-help-center-icon.png'
import Button from 'pages/common/components/button/Button'

import {HELP_CENTER_STATS_TEST_IDS} from '../../pages/tests/constants'
import css from './HelpCenterStatsEmptyState.less'

const HELP_CENTER_SETTINGS_PATH = '/app/settings/help-center'

type HelpCenterStatsEmptyStateProps = {
    helpCenterId?: number
}

export const HelpCenterStatsEmptyState = ({
    helpCenterId,
}: HelpCenterStatsEmptyStateProps) => (
    <div
        className={css.container}
        data-testid={HELP_CENTER_STATS_TEST_IDS.EMPTY_STATE}
    >
        <img src={icon} alt="No Help Center icon" />
        <div>
            <div className={css.content}>
                <p className="heading-section-semibold mb-0">
                    You don’t have a published Help Center.
                </p>
                <p className="mb-0">
                    Set your Help Center live in the “Publish” tab in your
                    settings to start getting insights.
                </p>
            </div>

            <Link
                to={
                    helpCenterId
                        ? `${HELP_CENTER_SETTINGS_PATH}/${helpCenterId}/publish-track`
                        : HELP_CENTER_SETTINGS_PATH
                }
            >
                <Button>Manage Help Center</Button>
            </Link>
        </div>
    </div>
)
