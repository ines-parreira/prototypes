import React from 'react'

import cn from 'classnames'

import { Tag } from '@gorgias/merchant-ui-kit'

import css from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboarding.less'
import SettingsSidebar from 'pages/settings/SettingsSidebar'

const EmailPreview = ({ displayName = '', emailAddress = '' }) => {
    return (
        <SettingsSidebar className={css.sidebar}>
            <div className={cn('full-width p-4 mt-12', css.formPreview)}>
                <h4 className="text-secondary text-center">Email preview</h4>

                <div className={css.card}>
                    <div className="flex align-baseline">
                        <i
                            className={cn(
                                'material-icons-outlined',
                                css.emailIcon,
                            )}
                        >
                            email
                        </i>{' '}
                        <p className="heading-subsection-semibold">
                            New message
                        </p>
                    </div>
                    <div className="flex flex-column full-width">
                        <div className={css.emailPreviewTagWrapper}>
                            <p>From </p>
                            <Tag
                                text={`${displayName || '<Display name> '}${displayName && emailAddress ? ' ' : ''}${emailAddress ? `(${emailAddress})` : '(<Email>)'}`}
                                color="blue"
                            />
                        </div>

                        <div className={css.emailPreviewTagWrapper}>
                            <p>To </p>
                            <Tag
                                text="Customer name (customer@email.com)"
                                color="black"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SettingsSidebar>
    )
}

export default EmailPreview
