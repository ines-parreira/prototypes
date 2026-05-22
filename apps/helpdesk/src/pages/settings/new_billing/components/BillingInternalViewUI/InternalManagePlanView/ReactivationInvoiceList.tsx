import { formatAmount } from '@repo/billing'

import { Banner, Box, Separator, Text } from '@gorgias/axiom'

import type { Invoice } from 'state/billing/types'

type ReactivationInvoiceListProps = {
    invoices: Invoice[]
    currency: string
}

export function ReactivationInvoiceList({
    invoices,
    currency,
}: ReactivationInvoiceListProps) {
    return (
        <Box flexDirection="column" gap="sm" w="100%">
            <Banner
                variant="inline"
                intent="warning"
                icon="warning-triangle"
                isClosable={false}
                description={
                    <Text wrap="wrap">
                        Here&apos;s a list of non-paid invoices in your current
                        term that may be invoiced when reactivating your
                        subscription.
                    </Text>
                }
            />
            <Text variant="bold">Invoices to pay</Text>
            <Box justifyContent="space-between">
                <Text size="xs" color="content-neutral-tertiary" variant="bold">
                    INVOICE
                </Text>
                <Box gap="md">
                    <Text
                        size="xs"
                        color="content-neutral-tertiary"
                        variant="bold"
                    >
                        TOTAL
                    </Text>
                    <Text
                        size="xs"
                        color="content-neutral-tertiary"
                        variant="bold"
                    >
                        PAID
                    </Text>
                    <Text
                        size="xs"
                        color="content-neutral-tertiary"
                        variant="bold"
                    >
                        DUE
                    </Text>
                    <Text
                        size="xs"
                        color="content-neutral-tertiary"
                        variant="bold"
                    >
                        STATUS
                    </Text>
                </Box>
            </Box>
            <Separator />
            {invoices.map((invoice, index) => (
                <Box key={invoice.id} flexDirection="column" gap="sm">
                    {index > 0 && <Separator variant="dashed" />}
                    <Box justifyContent="space-between" alignItems="center">
                        <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Text size="sm">{invoice.id}</Text>
                        </a>
                        <Box gap="md">
                            <Text size="sm">
                                {formatAmount(invoice.total / 100, currency)}
                            </Text>
                            <Text size="sm">
                                {formatAmount(
                                    invoice.amount_paid / 100,
                                    currency,
                                )}
                            </Text>
                            <Text size="sm">
                                {formatAmount(
                                    invoice.amount_due / 100,
                                    currency,
                                )}
                            </Text>
                            <Text
                                size="sm"
                                color={
                                    invoice.paid
                                        ? 'content-success-default'
                                        : 'content-neutral-secondary'
                                }
                            >
                                {invoice.paid ? 'Paid' : 'Unpaid'}
                            </Text>
                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
    )
}
