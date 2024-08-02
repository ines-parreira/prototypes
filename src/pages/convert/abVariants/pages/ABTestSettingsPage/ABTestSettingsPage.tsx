import React from 'react'
import {HeaderReturnButton} from 'pages/convert/common/components/HeaderReturnButton'

import css from './ABTestSettingsPage.less'

export const ABTestSettingsPage = () => {
    return (
        <div>
            <HeaderReturnButton
                backToHref={'/app/convert/4/campaigns'}
                title="Back to Campaigns list"
                className={css.backWrapper}
            />
        </div>
    )
}

export default ABTestSettingsPage
