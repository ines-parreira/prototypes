import { useMemo } from 'react'

import {
    Card,
    CheckBoxField,
    Elevation,
    Heading,
    ListItem,
    SelectField,
    Text,
} from '@gorgias/axiom'
import type { Integration } from '@gorgias/helpdesk-queries'
import { useListIntegrations } from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/constants'

import css from '../GorgiasChatIntegrationPreferences.less'

type EmailOption = {
    id: number
    label: string
    name: string
}

type Props = {
    linkedEmailIntegration: number | null
    sendChatTranscript: boolean
    sendCsat: boolean
    onLinkedEmailIntegrationChange: (value: number | null) => void
    onSendChatTranscriptChange: (value: boolean) => void
    onSendCsatChange: (value: boolean) => void
}

const toEmailOptions = (
    integrations: Integration[] | undefined,
): EmailOption[] =>
    integrations?.map((i) => {
        const address = (i.meta as { address?: string } | undefined)?.address
        const name = address ? `${i.name} <${address}>` : i.name
        return { id: i.id, label: name, name }
    }) ?? []

export const ChatShopperExperienceCard = ({
    linkedEmailIntegration,
    sendChatTranscript,
    sendCsat,
    onLinkedEmailIntegrationChange,
    onSendChatTranscriptChange,
    onSendCsatChange,
}: Props) => {
    const { data: emailData } = useListIntegrations({
        type: IntegrationType.Email,
    })
    const { data: gmailData } = useListIntegrations({
        type: IntegrationType.Gmail,
    })
    const { data: outlookData } = useListIntegrations({
        type: IntegrationType.Outlook,
    })

    const emailIntegrations = useMemo<EmailOption[]>(
        () => [
            ...toEmailOptions(emailData?.data?.data),
            ...toEmailOptions(gmailData?.data?.data),
            ...toEmailOptions(outlookData?.data?.data),
        ],
        [emailData, gmailData, outlookData],
    )

    const selectedEmail =
        emailIntegrations.find((opt) => opt.id === linkedEmailIntegration) ??
        undefined

    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Shopper experience</Heading>
                    <Text size="md">
                        Customize how customers experience chat after the
                        conversation.
                    </Text>
                </div>

                <div className={css.fieldSection}>
                    <div className={css.selectFieldGroup}>
                        <div className={css.selectWrapper}>
                            <SelectField<EmailOption>
                                label="Connect email"
                                placeholder="Select an email"
                                items={emailIntegrations}
                                value={selectedEmail}
                                onChange={(option) =>
                                    onLinkedEmailIntegrationChange(
                                        option?.id ?? null,
                                    )
                                }
                                maxHeight={200}
                            >
                                {(option) => (
                                    <ListItem
                                        id={option.id}
                                        label={option.label}
                                    />
                                )}
                            </SelectField>
                        </div>
                        <Text size="sm" className={css.caption}>
                            Select an email to send conversation transcripts,
                            offline confirmations, and satisfaction surveys.
                        </Text>
                    </div>

                    <CheckBoxField
                        label="Send conversation transcripts to customers"
                        caption="If a customer doesn't see your reply in chat, we'll automatically send them a transcript after 30 minutes."
                        value={sendChatTranscript}
                        onChange={onSendChatTranscriptChange}
                    />

                    <CheckBoxField
                        label="Send CSAT"
                        caption="Send a customer satisfaction survey after each conversation."
                        value={sendCsat}
                        onChange={onSendCsatChange}
                    />
                </div>
            </div>
        </Card>
    )
}
