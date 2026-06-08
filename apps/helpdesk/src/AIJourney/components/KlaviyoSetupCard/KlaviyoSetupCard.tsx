import { useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import {
    Box,
    Button,
    Card,
    CardHeader,
    Heading,
    Text,
    TextAreaField,
    TextField,
} from '@gorgias/axiom'

import { copyToClipboard } from 'AIJourney/utils/copyToClipboard'

import css from './KlaviyoSetupCard.less'

type KlaviyoSetupCardProps = {
    webhookUrl?: string
    isV3Architecture?: boolean
}

const PAYLOAD_TEMPLATE = JSON.stringify(
    {
        phone_number: '{{ person.phone_number }}',
        email: "{{ person.email|default:'' }}",
        first_name: "{{ person.first_name|default:'' }}",
        last_name: "{{ person.last_name|default:'' }}",
        accepts_marketing: "{{ person|lookup:'Accepts Marketing'|default:'' }}",
        sms_consent_method:
            "{{ person|lookup:'$sms_consent_method'|default:'' }}",
        shopify_customer_id: "{{ event.extra.customer.id|default:'' }}",
        order_id: "{{ event.extra.id|default:'' }}",
        checkout_url: "{{ event.extra.checkout_url|default:'' }}",
        cart_token: "{{ event.extra.token|default:'' }}",
        checkout_id: "{{ event.extra.checkout_id|default:'' }}",
        checkout_token: "{{ event.extra.checkout_token|default:'' }}",
        webhook_id: "{{ event.extra.webhook_id|default:'' }}",
        webhook_topic: "{{ event.extra.webhook_topic|default:'' }}",
        opted_in_to_sms_order_updates:
            "{{ event.OptedInToSmsOrderUpdates|default:'' }}",
    },
    null,
    2,
)

const KlavyioCardContent = ({
    isV3Architecture,
    webhookUrl,
}: {
    isV3Architecture?: boolean
    webhookUrl?: string
}) => {
    const [copiedField, setCopiedField] = useState<'url' | 'payload' | null>(
        null,
    )

    const handleCopy = async (text: string, field: 'url' | 'payload') => {
        const succeeded = await copyToClipboard(text)
        if (!succeeded) return
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), Duration.millis(1500))
    }

    return (
        <>
            <Box flexDirection="column" gap="sm">
                <Text variant="bold">URL</Text>
                <Box
                    alignItems={isV3Architecture ? 'flex-end' : 'center'}
                    gap="sm"
                    flexDirection={isV3Architecture ? 'column' : 'row'}
                >
                    <TextField
                        value={webhookUrl ?? ''}
                        onChange={() => {}}
                        isReadOnly
                        className={css.monoInput}
                    />
                    <Button
                        size="sm"
                        variant="secondary"
                        leadingSlot="copy"
                        onClick={() => handleCopy(webhookUrl ?? '', 'url')}
                    >
                        {copiedField === 'url' ? 'Copied!' : 'Copy'}
                    </Button>
                </Box>
            </Box>

            <Box flexDirection="column" gap="sm">
                <Text variant="bold">Payload template</Text>
                <Box flexDirection="column" gap="xs">
                    <Text size="sm">
                        Paste this JSON body into Klaviyo&apos;s webhook
                        configuration.
                    </Text>
                    {!isV3Architecture && (
                        <Text size="sm" className={css.secondary}>
                            Event fields (order_id, checkout_url, etc.) will be
                            empty string for list/segment-triggered flows — only
                            profile fields populate in that case.
                        </Text>
                    )}
                </Box>
                <Box flexDirection="column" gap="xs">
                    <TextAreaField
                        value={PAYLOAD_TEMPLATE}
                        onChange={() => {}}
                        rows={10}
                        autoResize={isV3Architecture}
                        isReadOnly
                        className={css.monoTextArea}
                    />
                    <Box justifyContent="flex-end">
                        <Button
                            size="sm"
                            variant="secondary"
                            leadingSlot="copy"
                            onClick={() =>
                                handleCopy(PAYLOAD_TEMPLATE, 'payload')
                            }
                        >
                            {copiedField === 'payload' ? 'Copied!' : 'Copy'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export const KlaviyoSetupCard = ({
    webhookUrl,
    isV3Architecture = false,
}: KlaviyoSetupCardProps) => {
    if (isV3Architecture) {
        if (!webhookUrl) {
            return (
                <div className={css.emptyState}>
                    <Text size="md" variant="bold" align="center">
                        Activate the flow
                        <br />
                        to generate your webhook
                    </Text>
                    <Text
                        align="center"
                        size="sm"
                        color="var(--content-neutral-secondary)"
                    >
                        The URL and JSON body will appear here once the flow is
                        live. Copy them into Klaviyo to start triggering this
                        flow.
                    </Text>
                </div>
            )
        }
        return (
            <Box flexDirection="column" gap="sm" padding="md" paddingTop="lg">
                <Heading>Webhook</Heading>
                <KlavyioCardContent
                    isV3Architecture={isV3Architecture}
                    webhookUrl={webhookUrl}
                />
            </Box>
        )
    }

    return (
        <Card gap="lg" width={isV3Architecture ? undefined : 680}>
            <CardHeader title="Klaviyo setup" />

            <KlavyioCardContent webhookUrl={webhookUrl} />
        </Card>
    )
}
