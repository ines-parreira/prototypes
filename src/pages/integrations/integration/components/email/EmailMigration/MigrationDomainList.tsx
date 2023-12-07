import React, {useState} from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useLocalStorage} from 'react-use'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Accordion from 'pages/common/components/accordion/Accordion'
import {
    EmailMigrationOutboundVerification,
    EmailMigrationOutboundVerificationStatus,
    EmailMigrationSenderVerificationIntegration,
    OutboundVerificationType,
} from 'models/integration/types'
import {SenderInformation} from 'models/singleSenderVerification/types'
import {FeatureFlagKey} from 'config/featureFlags'
import useBulkCreateSingleSenderVerification from '../hooks/useBulkCreateSingleSenderVerification'
import DomainVerificationAccordionItem from './DomainVerificationAccordionItem'
import SingleSenderVerificationAccordionItem from './SingleSenderVerificationAccordionItem'
import SingleSenderVerificationFormModal from './SingleSenderVerificationFormModal'

type Props = {
    domains: EmailMigrationOutboundVerification[]
    refreshMigrationData: () => void
}

const MIGRATION_OUTBOUND_VERIFICATION_TYPE_KEY =
    'migration-selected-outbound-verification-type'

export default function MigrationDomainList({
    domains,
    refreshMigrationData,
}: Props) {
    const [isBulkSubmitFormModalOpen, setIsBulkSubmitFormModalOpen] =
        useState(false)
    const [integrationsToBulkSubmit, setIntegrationsToBulkSubmit] =
        useState<EmailMigrationSenderVerificationIntegration[]>()

    const {isLoading: isBulkSubmitLoading, bulkCreateSingleSenderVerification} =
        useBulkCreateSingleSenderVerification()

    const [
        selectedOutboundVerificationType,
        setSelectedOutboundVerificationType,
    ] = useLocalStorage<Record<string, OutboundVerificationType>>(
        MIGRATION_OUTBOUND_VERIFICATION_TYPE_KEY,
        {}
    )

    const singleSenderEnabled =
        useFlags()[FeatureFlagKey.SendgridMigrationSingleSender]

    const handleSwitchSelectedVerificationType = (name: string) => {
        setSelectedOutboundVerificationType({
            ...selectedOutboundVerificationType,
            [name]:
                selectedOutboundVerificationType?.[name] ===
                OutboundVerificationType.SingleSender
                    ? OutboundVerificationType.Domain
                    : OutboundVerificationType.SingleSender,
        })
    }

    const handleBulkSubmitConfirm = async (
        values: Omit<SenderInformation, 'email'>
    ) => {
        if (!integrationsToBulkSubmit) {
            return
        }

        await bulkCreateSingleSenderVerification(
            integrationsToBulkSubmit,
            values
        )
        setIsBulkSubmitFormModalOpen(false)
        refreshMigrationData()
    }

    const sortedDomains = domains.sort((a) => {
        return a.status === EmailMigrationOutboundVerificationStatus.Verified
            ? -1
            : 1
    })

    return (
        <>
            <Accordion>
                {sortedDomains.map((item) => {
                    const isDomainVerification =
                        selectedOutboundVerificationType?.[item.name] !==
                        OutboundVerificationType.SingleSender

                    return isDomainVerification || !singleSenderEnabled ? (
                        <DomainVerificationAccordionItem
                            key={item.name}
                            verification={item}
                            onVerificationMethodSwitch={
                                handleSwitchSelectedVerificationType
                            }
                            refreshMigrationData={refreshMigrationData}
                            isSingleSenderEnabled={singleSenderEnabled}
                        />
                    ) : (
                        <SingleSenderVerificationAccordionItem
                            key={item.name}
                            verification={item}
                            onVerificationMethodSwitch={
                                handleSwitchSelectedVerificationType
                            }
                            onBulkSubmitClick={(
                                integrations: EmailMigrationSenderVerificationIntegration[]
                            ) => {
                                setIsBulkSubmitFormModalOpen(true)
                                setIntegrationsToBulkSubmit(integrations)
                            }}
                            refreshMigrationData={refreshMigrationData}
                        />
                    )
                })}
            </Accordion>
            <SingleSenderVerificationFormModal
                isOpen={isBulkSubmitFormModalOpen}
                setIsOpen={setIsBulkSubmitFormModalOpen}
                onConfirm={handleBulkSubmitConfirm}
                isLoading={isBulkSubmitLoading}
            />
        </>
    )
}
