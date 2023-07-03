import React, {memo} from 'react'
import {Route, useLocation} from 'react-router-dom'

import {HelpCenter} from 'models/helpCenter/types'
import HelpCenterPreview from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreview'

import SelfServiceHelpCenterHomePage from './SelfServiceHelpCenterHomePage'
import SelfServiceHelpCenterOrdersPage from './SelfServiceHelpCenterOrdersPage'
import SelfServiceHelpCenterTrackPage from './SelfServiceHelpCenterTrackPage'
import SelfServiceHelpCenterTrackUnfulfillResponsePage from './SelfServiceHelpCenterTrackUnfulfillResponsePage'
import SelfServiceHelpCenterRequestSentPage from './SelfServiceHelpCenterRequestSentPage'
import SelfServiceHelpCenterReturnPortalPage from './SelfServiceHelpCenterReturnPortalPage'
import SelfServiceHelpCenterReportIssueReasonsPage from './SelfServiceHelpCenterReportIssueReasonsPage'
import SelfServiceHelpCenterReportIssuePage from './SelfServiceHelpCenterReportIssuePage'
import {SELF_SERVICE_PREVIEW_ROUTES} from './constants'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterPreview = (props: Props) => {
    const {helpCenter} = props
    const location = useLocation()

    return (
        <HelpCenterPreview name={helpCenter.name}>
            <React.Fragment key={location.key}>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.HOME} exact>
                    <SelfServiceHelpCenterHomePage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.ORDERS} exact>
                    <SelfServiceHelpCenterOrdersPage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.TRACK} exact>
                    <SelfServiceHelpCenterTrackPage {...props} />
                </Route>
                <Route
                    path={SELF_SERVICE_PREVIEW_ROUTES.TRACK_UNFULFILLED_MESSAGE}
                    exact
                >
                    <SelfServiceHelpCenterTrackUnfulfillResponsePage
                        {...props}
                    />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.RETURN} exact>
                    <SelfServiceHelpCenterRequestSentPage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.RETURN_PORTAL} exact>
                    <SelfServiceHelpCenterReturnPortalPage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.CANCEL} exact>
                    <SelfServiceHelpCenterRequestSentPage {...props} />
                </Route>
                <Route
                    path={SELF_SERVICE_PREVIEW_ROUTES.REPORT_ISSUE_REASONS}
                    exact
                >
                    <SelfServiceHelpCenterReportIssueReasonsPage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.REPORT_ISSUE} exact>
                    <SelfServiceHelpCenterReportIssuePage {...props} />
                </Route>
            </React.Fragment>
        </HelpCenterPreview>
    )
}

export default memo(SelfServiceHelpCenterPreview)
