import React from 'react'

import {Link} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import LinkButton from 'pages/common/components/button/LinkButton'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'

import {SUPPORT_EMAIL} from './constants'
import css from './EmailDomainCreationFailure.less'

export default function EmailDomainCreationFailure() {
    return (
        <>
            <FormSection
                title="There was an issue processing your request"
                description="The DNS records needed for domain verification are still pending from your provider. These records are required for the domain verification process. Please contact support for assistance."
            />
            <div className={css.buttonsGroup}>
                <Link to="/app/settings/channels/email">
                    <Button intent="secondary">Close</Button>
                </Link>
                <LinkButton intent="primary" href={`mailto:${SUPPORT_EMAIL}`}>
                    Contact support
                </LinkButton>
            </div>
        </>
    )
}
