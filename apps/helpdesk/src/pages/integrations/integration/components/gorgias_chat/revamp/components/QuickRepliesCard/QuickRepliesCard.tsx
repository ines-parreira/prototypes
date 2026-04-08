import {
    Box,
    Button,
    Card,
    Elevation,
    Heading,
    Icon,
    Text,
    TextField,
    ToggleField,
} from '@gorgias/axiom'

import {
    QUICK_REPLIES_MAX_ITEM_LENGTH,
    QUICK_REPLIES_MAX_ITEMS,
} from 'config/integrations/gorgias_chat'

import css from './QuickRepliesCard.less'

type QuickRepliesCardProps = {
    isEnabled: boolean
    replies: string[]
    onChange: (data: { enabled: boolean; replies: string[] }) => void
}

export function QuickRepliesCard({
    isEnabled,
    replies,
    onChange,
}: QuickRepliesCardProps) {
    const handleToggle = (enabled: boolean) => {
        onChange({ enabled, replies })
    }

    const handleReplyChange = (index: number, value: string) => {
        const updated = [...replies]
        updated[index] = value
        onChange({ enabled: isEnabled, replies: updated })
    }

    const handleAddReply = () => {
        if (replies.length >= QUICK_REPLIES_MAX_ITEMS) return
        onChange({ enabled: isEnabled, replies: [...replies, ''] })
    }

    const handleRemoveReply = (index: number) => {
        onChange({
            enabled: isEnabled,
            replies: replies.filter((_, i) => i !== index),
        })
    }

    return (
        <Card elevation={Elevation.Mid} p="md" className={css.card} gap="md">
            <Box flexDirection="column" gap="xxxs">
                <Box justifyContent="space-between" alignItems="center">
                    <Heading size="md">Quick replies</Heading>
                    <ToggleField
                        value={isEnabled}
                        onChange={handleToggle}
                        aria-label="Enable quick replies"
                    />
                </Box>
                <Text size="md" color="content-neutral-secondary">
                    When a customer opens the chat, select the quick replies the
                    customer can click on.
                </Text>
            </Box>

            {isEnabled && (
                <Box flexDirection="column" gap="xs">
                    <Box>
                        <Button
                            variant="secondary"
                            size="md"
                            leadingSlot={<Icon name="add-plus" />}
                            isDisabled={
                                replies.length >= QUICK_REPLIES_MAX_ITEMS
                            }
                            onClick={handleAddReply}
                        >
                            Add quick reply
                        </Button>
                    </Box>
                    {replies.map((reply, index) => (
                        <div key={index} className={css.replyRow}>
                            <div className={css.replyInput}>
                                <TextField
                                    value={reply}
                                    maxLength={QUICK_REPLIES_MAX_ITEM_LENGTH}
                                    placeholder={`Quick reply (max ${QUICK_REPLIES_MAX_ITEM_LENGTH} chars)`}
                                    onChange={(value) =>
                                        handleReplyChange(index, value)
                                    }
                                    aria-label={`Quick reply ${index + 1}`}
                                />
                            </div>
                            <Button
                                variant="tertiary"
                                size="sm"
                                icon="close"
                                aria-label={`Remove quick reply ${index + 1}`}
                                onClick={() => handleRemoveReply(index)}
                            />
                        </div>
                    ))}
                </Box>
            )}
        </Card>
    )
}
