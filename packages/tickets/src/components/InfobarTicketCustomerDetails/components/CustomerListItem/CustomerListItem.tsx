import { Box, Button, Card, Heading, Icon, Tag, Text } from '@gorgias/axiom'
import type { TicketCustomerChannel } from '@gorgias/helpdesk-queries'
import type { Customer } from '@gorgias/helpdesk-types'

import { formatPhoneNumberInternational } from '../../../../utils/validation'
import { useCustomerChannels } from '../../../InfobarCustomerFields/hooks'

export interface CustomerListItemProps {
    customer: Customer
    isDuplicate?: boolean
    onSetCustomer: (customer: Customer) => void
    onPreviewCustomer: (customer: Customer) => void
}

export function CustomerListItem({
    customer,
    isDuplicate,
    onSetCustomer,
    onPreviewCustomer,
}: CustomerListItemProps) {
    const customerDisplayName = customer.name || `Customer #${customer.id}`
    const { emailChannels, phoneChannels } = useCustomerChannels(
        customer?.channels as TicketCustomerChannel[],
    )

    return (
        <Card padding="sm">
            <Box flexDirection="column" gap="xxxs">
                <Box justifyContent="space-between">
                    <Heading size="sm">{customerDisplayName}</Heading>
                    {isDuplicate && <Tag color="grey">Potential duplicate</Tag>}
                </Box>
                <Box flexDirection="column" gap="xxxs">
                    {emailChannels[0] && (
                        <Box gap="xxxs" alignItems="center">
                            <Icon name="comm-mail" />
                            <Text size="sm">{emailChannels[0].address}</Text>
                        </Box>
                    )}
                    {phoneChannels[0]?.address && (
                        <Box gap="xxxs" alignItems="center">
                            <Icon name="comm-phone" />
                            <Text size="sm">
                                {formatPhoneNumberInternational(
                                    phoneChannels[0].address,
                                )}
                            </Text>
                        </Box>
                    )}
                </Box>
                <Box gap="xxxs" marginTop="xxxs">
                    <Button size="sm" variant="secondary">
                        Merge
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onSetCustomer(customer)}
                    >
                        Set as customer
                    </Button>
                    <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() => onPreviewCustomer(customer)}
                    >
                        View details
                    </Button>
                </Box>
            </Box>
        </Card>
    )
}
