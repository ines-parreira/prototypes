import React, {useState} from 'react'
import classNames from 'classnames'
import {EmailMigrationOutboundVerification} from 'models/integration/types'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import Button from 'pages/common/components/button/Button'
import Card from 'pages/stats/Card'
import IconButton from 'pages/common/components/button/IconButton'
import EmailVerificationStatusLabel, {
    EmailVerificationStatus,
} from '../EmailVerificationStatusLabel'
import DeleteVerificationModal from '../DeleteVerificationModal'
import {
    computeDomainSingleSenderVerificationStatus,
    getSingleSenderUnverifiedIntegrations,
    getSubmittedIncompleteVerifications,
    listAddressDetailsInline,
} from './utils'
import SingleSenderVerificationTable from './SingleSenderVerificationTable'
import SingleSenderVerificationFormModal from './SingleSenderVerificationFormModal'

import css from './MigrationDomainList.less'

type Props = {
    verification: EmailMigrationOutboundVerification
    onVerificationMethodSwitch: (name: string) => void
}

export default function SingleSenderVerificationAccordionItem({
    verification,
    onVerificationMethodSwitch,
}: Props) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false)

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

    const handleConfirmBulkDelete = () => {
        // TODO
    }

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
                                <div>
                                    {listAddressDetailsInline(
                                        submittedVerifications[0]
                                    )}
                                </div>
                                <IconButton
                                    fillStyle="ghost"
                                    intent="destructive"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                >
                                    delete
                                </IconButton>
                            </div>
                        ) : (
                            <div className={css.addressSubmission}>
                                <div>
                                    Submit your business’s mailing address to
                                    verify the emails.
                                </div>
                                <Button
                                    onClick={() => {
                                        setIsFormModalOpen(true)
                                    }}
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
            <SingleSenderVerificationFormModal
                isOpen={isFormModalOpen}
                setIsOpen={setIsFormModalOpen}
                onConfirm={() => {
                    // TODO
                }}
            />
            <DeleteVerificationModal
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                onConfirm={handleConfirmBulkDelete}
            >
                Deleting verification will remove it for{' '}
                <strong>all email addresses</strong> associated with this
                domain.
            </DeleteVerificationModal>
        </>
    )
}
