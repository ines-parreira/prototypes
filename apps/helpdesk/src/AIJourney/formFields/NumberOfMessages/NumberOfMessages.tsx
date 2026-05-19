import { Controller, useFormContext } from 'react-hook-form'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    ListItem,
    SelectField,
    Text,
} from '@gorgias/axiom'

const MAX_NUMBER_OF_MESSAGES = 4

const followUpOptions = Array.from({ length: MAX_NUMBER_OF_MESSAGES }).map(
    (_, index) => {
        const value = index + 1
        return {
            id: value,
            label: `${value} ${value === 1 ? 'message' : 'messages'}`,
        }
    },
)

const NumberOfMessagesGroupItem = () =>
    Array.from({
        length: MAX_NUMBER_OF_MESSAGES,
    }).map((_, index) => {
        const messageNumber = index + 1
        return (
            <ButtonGroupItem
                key={`button-${messageNumber}`}
                id={`button-${messageNumber}`}
            >
                {`${messageNumber} ${messageNumber === 1 ? 'message' : 'messages'}`}
            </ButtonGroupItem>
        )
    })

const handleSelectionChange =
    (onChange: (value: number) => void) => (key: React.Key) => {
        const messageNumber = Number(key.toString().replace('button-', ''))
        onChange(messageNumber)
    }

const renderButtonGroup = (field: {
    value: number
    onChange: (value: number) => void
}) => (
    <ButtonGroup
        selectedKey={`button-${field.value}`}
        onSelectionChange={handleSelectionChange(field.onChange)}
    >
        <NumberOfMessagesGroupItem />
    </ButtonGroup>
)

export const NumberOfMessages = ({
    isV3Architecture = false,
}: { isV3Architecture?: boolean } = {}) => {
    const { control } = useFormContext()

    if (isV3Architecture) {
        return (
            <Controller
                name="max_follow_up_messages"
                control={control}
                render={({ field }) => (
                    <SelectField
                        label="Messages in this flow"
                        items={followUpOptions}
                        value={
                            followUpOptions.find(
                                (o) => o.id === (field.value ?? 1),
                            ) ?? followUpOptions[0]
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
                Messages in this flow
            </Text>
            <Controller
                name="max_follow_up_messages"
                control={control}
                render={({ field }) => renderButtonGroup(field)}
            />
        </Box>
    )
}
