import React from 'react'

import cn from 'classnames'

import { Tag } from '@gorgias/axiom'

import css from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboarding.less'

const EmailPreview = ({ displayName = '', emailAddress = '' }) => {
    return (
        <>
            <h6 className={css.emailPreviewLabel}>Email preview</h6>

            <div className={cn('full-width mt-12', css.formPreview)}>
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
                                text={`${displayName || '<Display name> '}${displayName && emailAddress ? ' ' : ''}${emailAddress ? `(${emailAddress})` : '(<>)'}`}
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
        </>
    )
}

export default EmailPreview
