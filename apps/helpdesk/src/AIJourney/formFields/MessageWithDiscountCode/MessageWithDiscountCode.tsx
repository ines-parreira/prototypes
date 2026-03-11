import { Controller, useFormContext } from 'react-hook-form'

import { Box, ButtonGroup, ButtonGroupItem, Text } from '@gorgias/axiom'

import { getOrdinalSuffix } from 'AIJourney/utils'

const handleSelectionChange =
    (onChange: (value: number) => void) => (key: React.Key) => {
        const messageNumber = Number(key.toString().replace('button-', ''))
        onChange(messageNumber)
    }

const renderButtonGroup = (
    field: {
        value: number
        onChange: (value: number) => void
    },
    maxFollowUpMessages: any,
) => (
    <ButtonGroup
        selectedKey={`button-${field.value}`}
        onSelectionChange={handleSelectionChange(field.onChange)}
    >
        {Array.from({
            length: maxFollowUpMessages || 0,
        }).map((_, index) => {
            const messageNumber = index + 1
            return (
                <ButtonGroupItem
                    key={`button-${messageNumber}`}
                    id={`button-${messageNumber}`}
                >
                    {getOrdinalSuffix(messageNumber)} message
                </ButtonGroupItem>
            )
        })}
    </ButtonGroup>
)

export const MessageWithDiscountCode = () => {
    const { control, watch } = useFormContext()

    const maxFollowUpMessages = watch('max_follow_up_messages')

    return (
        <Box flexDirection="column" gap="xxs">
            <Text as="span" size="md" variant="medium">
                Message that includes the discount code
            </Text>
            <Controller
                name="discount_code_message_threshold"
                control={control}
                defaultValue={1}
                render={({ field }) =>
                    renderButtonGroup(field, maxFollowUpMessages)
                }
            />
        </Box>
    )
}
