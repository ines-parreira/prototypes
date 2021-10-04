import React from 'react'

import {isProduction} from '../../../../../../../utils/environment'

import css from '../../CustomDomain.less'

type Props = {
    isHidden: boolean
}

export const HelpText = ({isHidden}: Props): JSX.Element | null => {
    if (isHidden) {
        return null
    }

    const dns = isProduction()
        ? 'clients.gorgias.help'
        : 'clients.gorgias.rehab'

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
                    <code>{dns}</code>
                </p>
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://docs.gorgias.com/faq/how-to-setup-a-custom-domain-for-you-help-center"
                >
                    How do I do that?&nbsp;
                    <span className={css.infoIcon}>&#9432;</span>
                </a>
            </div>
        </>
    )
}
