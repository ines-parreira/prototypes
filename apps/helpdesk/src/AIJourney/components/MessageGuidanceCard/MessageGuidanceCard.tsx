import { useState } from 'react'

import { useController } from 'react-hook-form'

import {
    Box,
    Card,
    CardHeader,
    Text,
    TextAreaField,
    ToggleField,
} from '@gorgias/axiom'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import { useJourneyContext } from 'AIJourney/providers'

import css from './MessageGuidance.less'

const MESSAGE_GUIDANCE_MAX_LENGTH = 4000

type MessageGuidanceCardProps = {
    onReturningCustomerChange?: (value: boolean) => void
}

export const MessageGuidanceCard = ({
    onReturningCustomerChange,
}: MessageGuidanceCardProps) => {
    const [returningCustomer, setReturningCustomer] = useState(false)

    const { journeyData } = useJourneyContext()
    const isWelcomeFlow = journeyData?.type === JourneyTypeEnum.Welcome

    const {
        field: { value: messageGuidance, onChange: setMessageGuidance },
        fieldState: { error },
    } = useController({
        name: 'message_instructions',
        defaultValue: '',
        rules: { required: 'Please provide message guidance to continue.' },
    })

    const remainingChars = MESSAGE_GUIDANCE_MAX_LENGTH - messageGuidance.length

    const handleReturningCustomerChange = (value: boolean) => {
        setReturningCustomer(value)
        onReturningCustomerChange?.(value)
    }

    return (
        <Card width={680}>
            <Box flexDirection="column" gap="xxs">
                <CardHeader title="Message guidance" />
                <Text className={css.caption}>
                    Tell the AI how to write messages to your shoppers.
                </Text>
            </Box>
            {isWelcomeFlow && (
                <ToggleField
                    value={returningCustomer}
                    onChange={handleReturningCustomerChange}
                    label="Returning customer"
                />
            )}
            <TextAreaField
                placeholder="Describe tone, formatting, or what to include"
                maxLength={MESSAGE_GUIDANCE_MAX_LENGTH}
                caption={`${remainingChars} characters remaining`}
                error={error?.message}
                value={messageGuidance}
                onChange={setMessageGuidance}
                autoResize
                rows={8}
                maxRows={20}
            />
        </Card>
    )
}
