import { useEffect } from 'react'

import { useFormContext, useWatch } from 'react-hook-form'

import {
    Box,
    Card,
    CardHeader,
    Icon,
    Skeleton,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import {
    EnableDiscountCode,
    MaxDiscountCode,
    MessageWithDiscountCode,
} from 'AIJourney/formFields'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'

type Props = {
    isFormReady: boolean
    isV3Architecture?: boolean
}

export const DiscountCodeCard = ({
    isFormReady,
    isV3Architecture = false,
}: Props) => {
    const { control, setValue } = useFormContext<SetupFormValues>()

    const isDiscountEnabled = useWatch({ control, name: 'offer_discount' })
    const maxFollowUpMessages = useWatch({
        control,
        name: 'max_follow_up_messages',
    })

    const shouldRenderMessageWithDiscountCode = (maxFollowUpMessages ?? 1) !== 1

    useEffect(() => {
        if (!shouldRenderMessageWithDiscountCode) {
            setValue('discount_code_message_threshold', 1)
        }
    }, [shouldRenderMessageWithDiscountCode, setValue])

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton
                    width={isV3Architecture ? undefined : 680}
                    height={200}
                />
            </Box>
        )
    }

    if (isV3Architecture) {
        return (
            <Box flexDirection="column" gap="xs" width="100%">
                <Box flexDirection="row" alignItems="center" gap="xxs">
                    <EnableDiscountCode label="Offer discount" />
                    <span>
                        <Tooltip delay={0} trigger={<Icon name="info" />}>
                            <TooltipContent title="Add a discount amount or code, and choose which message offers it." />
                        </Tooltip>
                    </span>
                </Box>
                {isDiscountEnabled && (
                    <Box flexDirection="column" gap="sm" width="100%">
                        <MaxDiscountCode fullWidth />
                        {shouldRenderMessageWithDiscountCode && (
                            <MessageWithDiscountCode isV3Architecture />
                        )}
                    </Box>
                )}
            </Box>
        )
    }

    return (
        <Card width={680}>
            <Box
                width="100%"
                justifyContent="space-between"
                alignItems="center"
            >
                <CardHeader title="Discount code" />
                <EnableDiscountCode />
            </Box>
            {isDiscountEnabled && (
                <>
                    <MaxDiscountCode />
                    {shouldRenderMessageWithDiscountCode && (
                        <MessageWithDiscountCode />
                    )}
                </>
            )}
        </Card>
    )
}
