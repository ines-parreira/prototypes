import React from 'react'
import {isEmpty} from 'lodash'
import classNames from 'classnames'
import {EmailMigrationOutboundVerification} from 'models/integration/types'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'

import EmailVerificationStatusLabel from '../EmailVerificationStatusLabel'
import css from './MigrationDomainList.less'
import {computeSingleSenderVerificationStatus} from './utils'

type Props = {
    verification: EmailMigrationOutboundVerification
    onVerificationMethodSwitch: (name: string) => void
}

export default function SingleSenderVerificationAccordionItem({
    verification,
    onVerificationMethodSwitch,
}: Props) {
    const handleSwitchMethod = (event: React.MouseEvent) => {
        event.preventDefault()
        onVerificationMethodSwitch(verification.name)
    }

    return (
        <AccordionItem
            id={verification.name}
            data-testid="single-sender-accordion-body"
        >
            <AccordionHeader>
                <div className={css.titleContainer}>
                    <div className={css.title}>
                        <i className={classNames('material-icons', css.icon)}>
                            email
                        </i>
                        <strong>
                            Emails associated with {verification.name}
                        </strong>
                    </div>
                    <EmailVerificationStatusLabel
                        status={computeSingleSenderVerificationStatus(
                            verification
                        )}
                    />
                </div>
            </AccordionHeader>
            <AccordionBody>
                <div>
                    {isEmpty(verification.domain) ? (
                        <p>empty</p>
                    ) : (
                        <p>non empty</p>
                    )}
                    <p className={css.switchMethod}>
                        Want to verify all emails using DNS records?{' '}
                        <a onClick={handleSwitchMethod} href="#">
                            Verify the domain instead
                        </a>
                    </p>
                </div>
            </AccordionBody>
        </AccordionItem>
    )
}
