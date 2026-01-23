import { useMemo } from 'react'

import {
    Box,
    Button,
    ButtonSize,
    ButtonVariant,
    Card,
    Heading,
    IconName,
    OverlayContent,
} from '@gorgias/axiom'
import type { Customer, TicketCustomer } from '@gorgias/helpdesk-types'

import { InfobarCustomerFields } from '../../../../InfobarCustomerFields'

type CustomerPreviewProps = {
    customer: Customer | null | undefined
    onGoBack: () => void
    onClose: () => void
    onSetCustomer: (customer: Customer) => void
}

export function CustomerPreview({
    customer,
    onGoBack,
    onClose,
    onSetCustomer,
}: CustomerPreviewProps) {
    const customerDisplayName = useMemo(() => {
        return customer
            ? customer.name || `Customer #${customer.id}`
            : 'Unknown customer'
    }, [customer])

    if (!customer) {
        return null
    }

    return (
        <>
            <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingBottom="md"
            >
                <Box gap="xxxs" alignItems="center">
                    <Button
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Sm}
                        icon={IconName.ArrowLeft}
                        aria-label="Back to previous screen"
                        onClick={onGoBack}
                    />
                    <Heading size="sm">{customerDisplayName}</Heading>
                </Box>
                <Box gap="xxxs">
                    <Button variant="secondary">Merge</Button>
                    <Button
                        variant="secondary"
                        onClick={() => onSetCustomer(customer)}
                    >
                        Switch customer
                    </Button>
                    <Box alignSelf="flex-start">
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="close"
                            onClick={onClose}
                        />
                    </Box>
                </Box>
            </Box>

            <OverlayContent>
                <Card alignSelf="flex-start">
                    <InfobarCustomerFields
                        customer={customer as TicketCustomer}
                    />
                </Card>
            </OverlayContent>
        </>
    )
}
