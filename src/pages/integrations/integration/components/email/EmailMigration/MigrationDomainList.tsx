import React from 'react'
import {useLocalStorage} from 'react-use'
import Accordion from 'pages/common/components/accordion/Accordion'
import {
    EmailMigrationOutboundVerification,
    OutboundVerificationType,
} from 'models/integration/types'
import DomainVerificationAccordionItem from './DomainVerificationAccordionItem'

// import SingleSenderVerificationAccordionItem from './SingleSenderVerificationAccordionItem'

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
        // TODO remove expandedItem
        <Accordion defaultExpandedItem={domains[0]?.name}>
            {domains.map((item) => {
                // TODO uncomment when single sender verification is ready
                // const isDomainVerification =
                //     selectedOutboundVerificationType?.[item.name] !==
                //     OutboundVerificationType.SingleSender

                // return isDomainVerification ? (
                return (
                    <DomainVerificationAccordionItem
                        verification={item}
                        onVerificationMethodSwitch={
                            handleSwitchSelectedVerificationType
                        }
                        refreshMigrationData={refreshMigrationData}
                        key={item.name}
                    />
                )
                // ) : (
                //     <SingleSenderVerificationAccordionItem
                //         key={item.name}
                //         verification={item}
                //         onVerificationMethodSwitch={
                //             handleSwitchSelectedVerificationType
                //         }
                //     />
                // )
            })}
        </Accordion>
    )
}
