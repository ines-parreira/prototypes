import React from 'react'
import classNames from 'classnames'
import {
    EmailMigrationOutboundVerification,
    EmailMigrationSenderVerificationIntegration,
} from 'models/integration/types'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import Button from 'pages/common/components/button/Button'
import Card from 'pages/stats/Card'
import EmailVerificationStatusLabel, {
    EmailVerificationStatus,
} from '../EmailVerificationStatusLabel'
import {
    computeDomainSingleSenderVerificationStatus,
    getSingleSenderUnverifiedIntegrations,
    getSubmittedIncompleteVerifications,
    listAddressDetailsInline,
} from './utils'
import SingleSenderVerificationTable from './SingleSenderVerificationTable'

import css from './MigrationDomainList.less'

type Props = {
    verification: EmailMigrationOutboundVerification
    onVerificationMethodSwitch: (name: string) => void
    onBulkSubmitClick: (
        unverifiedIntegrations: EmailMigrationSenderVerificationIntegration[]
    ) => void
}

export default function SingleSenderVerificationAccordionItem({
    verification,
    onVerificationMethodSwitch,
    onBulkSubmitClick,
}: Props) {
    const handleSwitchMethod = (event: React.MouseEvent) => {
        event.preventDefault()
        onVerificationMethodSwitch(verification.name)
    }

    const verificationStatus =
        computeDomainSingleSenderVerificationStatus(verification)
    const submittedVerifications =
        getSubmittedIncompleteVerifications(verification)
    const unverifiedIntegrations =
        getSingleSenderUnverifiedIntegrations(verification)

    const header = (
        <div className={css.titleContainer}>
            <div className={css.title}>
                <i className={classNames('material-icons', css.icon)}>email</i>
                <strong>Emails associated with {verification.name}</strong>
            </div>
            <EmailVerificationStatusLabel status={verificationStatus} />
        </div>
    )

    const hasSubmittedBulkVerification = !!submittedVerifications.length

    if (verificationStatus === EmailVerificationStatus.Success) {
        return <Card className={css.singleSenderVerifiedCard}>{header}</Card>
    }

    return (
        <>
            <AccordionItem id={verification.name}>
                <AccordionHeader>{header}</AccordionHeader>
                <AccordionBody>
                    <div>
                        {hasSubmittedBulkVerification ? (
                            <div className={css.addressSubmission}>
                                {listAddressDetailsInline(
                                    submittedVerifications[0]
                                )}
                            </div>
                        ) : (
                            <div className={css.addressSubmission}>
                                <div>
                                    Submit your business’s mailing address to
                                    verify the emails.
                                </div>
                                <Button
                                    onClick={() =>
                                        onBulkSubmitClick(
                                            unverifiedIntegrations
                                        )
                                    }
                                >
                                    Submit address
                                </Button>
                            </div>
                        )}
                        <SingleSenderVerificationTable
                            integrations={unverifiedIntegrations}
                            hasSubmittedBulkVerification={
                                hasSubmittedBulkVerification
                            }
                        />
                        <p className={css.switchMethod}>
                            Want to verify all emails using DNS records?{' '}
                            <a onClick={handleSwitchMethod} href="#">
                                Verify the domain instead
                            </a>
                        </p>
                    </div>
                </AccordionBody>
            </AccordionItem>
        </>
    )
}
