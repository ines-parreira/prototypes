import { useMemo } from 'react'

import { sanitizeHtmlDefault } from '@repo/utils'

import { Box, Button, Card, Heading, Icon, Tag, Text } from '@gorgias/axiom'
import type { TicketCustomerChannel } from '@gorgias/helpdesk-queries'
import type {
    Customer,
    CustomerHighlightDataItem,
} from '@gorgias/helpdesk-types'

import { customerHighlightsTransform } from '../../../../utils/search/searchHelpers'
import { formatPhoneNumberInternational } from '../../../../utils/validation'
import { useCustomerChannels } from '../../../InfobarCustomerFields/hooks'

import css from './CustomerListItem.less'

export interface CustomerListItemProps {
    customer: Customer | CustomerHighlightDataItem
    isDuplicate?: boolean
    onSetCustomer: (customer: Customer) => void
    onPreviewCustomer: (customer: Customer) => void
}

function isCustomerWithHighlights(
    customer: Customer | CustomerHighlightDataItem,
): customer is CustomerHighlightDataItem {
    return 'highlights' in customer
}

export function CustomerListItem({
    customer,
    isDuplicate,
    onSetCustomer,
    onPreviewCustomer,
}: CustomerListItemProps) {
    const transformedCustomer = isCustomerWithHighlights(customer)
        ? customerHighlightsTransform(customer)
        : null

    const nonTransformedCustomer = customer as Customer

    const customerDisplayName = transformedCustomer
        ? transformedCustomer.name || `Customer #${transformedCustomer.id}`
        : nonTransformedCustomer.name ||
          `Customer #${nonTransformedCustomer.id}`

    const { emailChannels, phoneChannels } = useCustomerChannels(
        nonTransformedCustomer?.channels as TicketCustomerChannel[],
    )

    const emailToDisplay = transformedCustomer
        ? transformedCustomer.email
        : emailChannels[0]?.address

    const originalCustomer = useMemo(
        () =>
            (transformedCustomer
                ? (customer as CustomerHighlightDataItem).entity
                : customer) as Customer,
        [transformedCustomer, customer],
    )

    return (
        <Card padding="sm">
            <Box flexDirection="column" gap="xxxs" className={css.container}>
                <Box justifyContent="space-between">
                    <Heading size="sm">
                        <span
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtmlDefault(
                                    customerDisplayName,
                                ),
                            }}
                        />
                    </Heading>
                    {isDuplicate && <Tag color="grey">Potential duplicate</Tag>}
                </Box>
                <Box flexDirection="column" gap="xxxs">
                    {emailToDisplay && (
                        <Box gap="xxxs" alignItems="center">
                            <Icon name="comm-mail" />
                            <Text size="sm">
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHtmlDefault(
                                            emailToDisplay,
                                        ),
                                    }}
                                />
                            </Text>
                        </Box>
                    )}
                    {phoneChannels[0]?.address && (
                        <Box gap="xxxs" alignItems="center">
                            <Icon name="comm-phone" />
                            <Text size="sm">
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHtmlDefault(
                                            formatPhoneNumberInternational(
                                                phoneChannels[0]?.address,
                                            ),
                                        ),
                                    }}
                                />
                            </Text>
                        </Box>
                    )}
                    {transformedCustomer?.orderId && (
                        <Box gap="xxxs" alignItems="center">
                            <Icon name="shopping-bag" />
                            <Text size="sm">
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHtmlDefault(
                                            transformedCustomer.orderId,
                                        ),
                                    }}
                                />
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
                        onClick={() => onSetCustomer(originalCustomer)}
                    >
                        Switch customer
                    </Button>
                    <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() => onPreviewCustomer(originalCustomer)}
                    >
                        View details
                    </Button>
                </Box>
            </Box>
        </Card>
    )
}
