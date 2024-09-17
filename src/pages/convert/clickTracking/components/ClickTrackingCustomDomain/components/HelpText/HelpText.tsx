import React from 'react'

import css from '../../ClickTrackingCustomDomain.less'

type Props = {
    isHidden: boolean
    domain: string
}

export const HelpText = ({isHidden, domain}: Props): JSX.Element | null => {
    if (isHidden) {
        return null
    }

    return (
        <>
            <div className={css.helpContainer}>
                <p>
                    Visit the admin console of your domain registrar (the
                    website you bought your domain from) and create or update a
                    CNAME so that it points to <code>{domain}</code>
                </p>
            </div>
        </>
    )
}
