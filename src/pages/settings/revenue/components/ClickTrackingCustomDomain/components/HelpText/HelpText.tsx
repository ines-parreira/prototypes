import React from 'react'

import css from '../../ClickTrackingCustomDomain.less'

type Props = {
    isHidden: boolean
}

export const HelpText = ({isHidden}: Props): JSX.Element | null => {
    if (isHidden) {
        return null
    }

    return (
        <>
            <div className={css.helpContainer} data-testid="domain-help">
                <p>
                    Visit the admin console of your domain registrar (the
                    website you bought your domain from) and create a CNAME
                    pointing to:
                </p>
                <p>
                    In your DNS manager, add a CNAME pointing to{' '}
                    <code>clients.gorgias.win</code>
                </p>
            </div>
        </>
    )
}
