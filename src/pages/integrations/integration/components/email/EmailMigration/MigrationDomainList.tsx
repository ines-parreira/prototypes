import React from 'react'
import {useLocalStorage} from 'react-use'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Accordion from 'pages/common/components/accordion/Accordion'
import {
    EmailMigrationOutboundVerification,
    OutboundVerificationType,
} from 'models/integration/types'
import {FeatureFlagKey} from 'config/featureFlags'
import DomainVerificationAccordionItem from './DomainVerificationAccordionItem'

import SingleSenderVerificationAccordionItem from './SingleSenderVerificationAccordionItem'

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

    return (
        <Accordion>
            {domains.map((item) => {
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
                    />
                )
            })}
        </Accordion>
    )
}
