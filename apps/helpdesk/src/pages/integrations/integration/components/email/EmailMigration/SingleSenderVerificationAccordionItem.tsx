import classNames from 'classnames'

import { Card } from '@gorgias/analytics-ui-kit'
import { Button } from '@gorgias/axiom'

import {
    EmailMigrationOutboundVerification,
    EmailMigrationOutboundVerificationStatus,
    EmailMigrationSenderVerificationIntegration,
} from 'models/integration/types'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import EmailVerificationStatusLabel from '../EmailVerificationStatusLabel'
import SingleSenderVerificationTable from './SingleSenderVerificationTable'
import {
    computeDomainSingleSenderVerificationStatus,
    getSingleSenderUnverifiedIntegrations,
    getSubmittedIncompleteVerifications,
    listAddressDetailsInline,
} from './utils'

import css from './MigrationDomainList.less'

type Props = {
    verification: EmailMigrationOutboundVerification
    onVerificationMethodSwitch: (name: string) => void
    onBulkSubmitClick: (
        unverifiedIntegrations: EmailMigrationSenderVerificationIntegration[],
    ) => void
    refreshMigrationData: () => void
}

export default function SingleSenderVerificationAccordionItem({
    verification,
    onVerificationMethodSwitch,
    onBulkSubmitClick,
    refreshMigrationData,
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

    if (
        verification.status ===
        EmailMigrationOutboundVerificationStatus.Verified
    ) {
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
                                    submittedVerifications[0],
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
                                            unverifiedIntegrations,
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
                            refreshMigrationData={refreshMigrationData}
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
