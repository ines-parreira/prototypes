import React, {memo} from 'react'
import {Route} from 'react-router-dom'

import {HelpCenter} from 'models/helpCenter/types'
import HelpCenterPreview from 'pages/settings/helpCenter/components/HelpCenterPreview/HelpCenterPreview'

import SelfServiceHelpCenterHomePage from './SelfServiceHelpCenterHomePage'
import {SELF_SERVICE_PREVIEW_ROUTES} from './constants'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterPreview = (props: Props) => {
    const {helpCenter} = props

    return (
        <HelpCenterPreview name={helpCenter.name}>
            <Route path={SELF_SERVICE_PREVIEW_ROUTES.HOME} exact>
                <SelfServiceHelpCenterHomePage {...props} />
            </Route>
        </HelpCenterPreview>
    )
}

export default memo(SelfServiceHelpCenterPreview)
