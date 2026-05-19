import { Controller, useFormContext } from 'react-hook-form'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    ListItem,
    SelectField,
    Text,
} from '@gorgias/axiom'

import { getOrdinalSuffix } from 'AIJourney/utils'

const LABEL = 'Message that includes the discount code'

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

export const MessageWithDiscountCode = ({
    isV3Architecture = false,
}: { isV3Architecture?: boolean } = {}) => {
    const { control, watch } = useFormContext()

    const maxFollowUpMessages = watch('max_follow_up_messages')

    if (isV3Architecture) {
        const options = Array.from({
            length: maxFollowUpMessages || 0,
        }).map((_, index) => {
            const value = index + 1
            return { id: value, label: `${getOrdinalSuffix(value)} message` }
        })

        return (
            <Controller
                name="discount_code_message_threshold"
                control={control}
                defaultValue={1}
                render={({ field }) => (
                    <SelectField
                        label={LABEL}
                        items={options}
                        value={
                            options.find((o) => o.id === (field.value ?? 1)) ??
                            options[0]
                        }
                        onChange={(option) =>
                            field.onChange(
                                (option as { id: number; label: string }).id,
                            )
                        }
                    >
                        {(option: { id: number; label: string }) => (
                            <ListItem key={option.id} label={option.label} />
                        )}
                    </SelectField>
                )}
            />
        )
    }

    return (
        <Box flexDirection="column" gap="xxs">
            <Text as="span" size="md" variant="medium">
                {LABEL}
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
