import { Controller, useFormContext } from 'react-hook-form'

import { Box, ButtonGroup, ButtonGroupItem, Text } from '@gorgias/axiom'

const MAX_NUMBER_OF_MESSAGES = 4

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

export const NumberOfMessages = () => {
    const { control } = useFormContext()

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
