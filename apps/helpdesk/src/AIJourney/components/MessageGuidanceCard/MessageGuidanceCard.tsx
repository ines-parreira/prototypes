import { useState } from 'react'

import { isSessionImpersonated } from '@repo/activity-tracker/utils'
import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { useFieldArray, useWatch } from '@repo/forms'
import { useController } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

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

import { MessageGuidanceVariants } from './MessageGuidanceVariants'
import type { MessageInstructionsVariant } from './types'

import css from './MessageGuidance.less'

const MESSAGE_GUIDANCE_MAX_LENGTH = 4000
const NEW_VARIANT_DEFAULT_WEIGHT = 50

type MessageGuidanceCardProps = {
    onReturningCustomerChange?: (value: boolean) => void
    fullWidth?: boolean
    isV3Architecture?: boolean
}

export const MessageGuidanceCard = ({
    onReturningCustomerChange,
    fullWidth = false,
    isV3Architecture = false,
}: MessageGuidanceCardProps) => {
    const [returningCustomer, setReturningCustomer] = useState(false)

    const { journeyData } = useJourneyContext()
    const isWelcomeFlow = journeyData?.type === JourneyTypeEnum.Welcome

    const { value: isAbFlagOn, isLoading: isFlagLoading } = useFlagWithLoading(
        FeatureFlagKey.AiJourneyMessageInstructionsAbTesting,
        false,
    )
    const isAbTestVisible =
        isSessionImpersonated() || (!isFlagLoading && isAbFlagOn)

    const {
        field: { value: messageGuidance, onChange: setMessageGuidance },
        fieldState: { error },
    } = useController({
        name: 'message_instructions',
        defaultValue: '',
        rules: { required: 'Please provide message guidance to continue.' },
    })

    const { append, replace } = useFieldArray({ name: 'variants' })
    const variants = (useWatch({ name: 'variants' }) ??
        []) as MessageInstructionsVariant[]
    const isAbTestEnabled = variants.length > 0

    const remainingChars =
        MESSAGE_GUIDANCE_MAX_LENGTH - (messageGuidance ?? '').length

    const handleReturningCustomerChange = (value: boolean) => {
        setReturningCustomer(value)
        onReturningCustomerChange?.(value)
    }

    const handleAbTestToggle = (next: boolean) => {
        if (next && variants.length === 0) {
            append({
                id: uuidv4(),
                message_instructions: '',
                weight: NEW_VARIANT_DEFAULT_WEIGHT,
            })
        } else if (!next && variants.length > 0) {
            replace([])
        }
    }

    return (
        <Card width={fullWidth ? '100%' : 680}>
            <Box flexDirection="column" gap="xxs">
                <CardHeader title="Message guidance" />
                <Text className={css.caption}>
                    Tell the AI how to write messages to your shoppers.
                </Text>
            </Box>
            {isWelcomeFlow && !isV3Architecture && (
                <ToggleField
                    value={returningCustomer}
                    onChange={handleReturningCustomerChange}
                    label="Returning customer"
                />
            )}
            {isAbTestVisible && (
                <ToggleField
                    value={isAbTestEnabled}
                    onChange={handleAbTestToggle}
                    label="A/B test message guidance"
                />
            )}
            {isAbTestEnabled ? (
                <MessageGuidanceVariants />
            ) : (
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
            )}
        </Card>
    )
}
