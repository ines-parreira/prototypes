import React from 'react'

import settingsCss from 'pages/settings/settings.less'

import css from './Header.less'

export default function Header() {
    return (
        <div className={settingsCss.pageContainer}>
            <h1 className={css.heading}>Service level agreements</h1>
            <p className={css.infoText}>
                SLAs (service level agreements) are used to establish clear
                commitments between your support team and your customers by
                setting first response and reply timers to be hit.
            </p>
        </div>
    )
}
