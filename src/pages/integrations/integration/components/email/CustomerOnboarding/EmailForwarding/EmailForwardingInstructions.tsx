import React from 'react'

import classNames from 'classnames'

import IconLink from 'core/ui/components/IconLink'
import css from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailForwarding/EmailIntegrationForwardingSetupForm.less'

const EmailForwardingInstructions = ({ email }: { email: string }) => {
    return (
        <div className={css.forwardInstructionsWrapper}>
            <ol>
                <li>Copy your above Gorgias forwarding address.</li>
                <li>
                    In a new tab, sign in to your{' '}
                    <span className={css.bolds}>{email}</span> mailbox and find
                    the settings for email forwarding. Add the copied Gorgias
                    email as a forwarding address.
                </li>
                <li>
                    Save your changes to verify your set up. You&apos;ll receive
                    an activation email as a new ticket in your Gorgias inbox.
                </li>
            </ol>
            <IconLink
                className={classNames(css.linkBtn, 'pb-4 pl-4 text-grey-5')}
                href="https://link.gorgias.com/121af4"
                icon="open_in_new"
                content="Need More Help?"
                iconPosition="suffix"
            />
        </div>
    )
}

export default EmailForwardingInstructions
