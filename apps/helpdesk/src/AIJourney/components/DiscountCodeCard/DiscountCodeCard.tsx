import { useEffect } from 'react'

import { useFormContext, useWatch } from 'react-hook-form'

import { Box, Card, CardHeader, Skeleton } from '@gorgias/axiom'

import {
    EnableDiscountCode,
    MaxDiscountCode,
    MessageWithDiscountCode,
} from 'AIJourney/formFields'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'

export const DiscountCodeCard = ({ isFormReady }: { isFormReady: boolean }) => {
    const { control, setValue } = useFormContext<SetupFormValues>()
    const isDiscountEnabled = useWatch({ control, name: 'offer_discount' })
    const maxFollowUpMessages = useWatch({
        control,
        name: 'max_follow_up_messages',
    })

    const shouldRenderMessageWithDiscountCode = maxFollowUpMessages !== 1

    useEffect(() => {
        if (!shouldRenderMessageWithDiscountCode) {
            setValue('discount_code_message_threshold', 1)
        }
    }, [shouldRenderMessageWithDiscountCode, setValue])

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton width={680} height={200} />
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
