import { useCallback } from 'react'

import { parsePhoneNumberWithError } from 'libphonenumber-js'

import { JourneyApiDTO } from '@gorgias/convert-client'
import { Integration } from '@gorgias/helpdesk-types'

import { useTestSms } from 'AIJourney/queries'
import { Product } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type useHandleSendTestSMSProps = {
    currentJourney: JourneyApiDTO | undefined
    selectedProduct: Product | null
    testSmsNumber: string | undefined
    currentIntegration?: Integration
    delaySendingSMSms?: number
}

export const useHandleSendTestSMS = ({
    currentJourney,
    selectedProduct,
    testSmsNumber,
    currentIntegration,
    delaySendingSMSms = 10_000,
}: useHandleSendTestSMSProps) => {
    const dispatch = useAppDispatch()

    const testSms = useTestSms()

    const handleTestSms = useCallback(async () => {
        try {
            if (!selectedProduct) {
                void dispatch(
                    notify({
                        message: 'Please select a product',
                        status: NotificationStatus.Error,
                    }),
                )
                return
            } else if (
                !currentJourney?.id ||
                !testSmsNumber ||
                !currentIntegration
            ) {
                void dispatch(
                    notify({
                        message: `Missing information: test number: ${testSmsNumber}, journeyID: ${currentJourney?.id}, integrationId: ${currentIntegration?.id}`,
                        status: NotificationStatus.Error,
                    }),
                )
                return
            }

            const { shop_domain: shopDomain } = currentIntegration.meta
            const { handle } = selectedProduct

            let phoneNumber: string
            try {
                const parsed = parsePhoneNumberWithError(testSmsNumber)
                phoneNumber = parsed.number
            } catch {
                void dispatch(
                    notify({
                        message: 'Invalid phone number format',
                        status: NotificationStatus.Error,
                    }),
                )
                return
            }

            await testSms.mutateAsync({
                phoneNumber,
                journeyId: currentJourney.id,
                product: {
                    product_id: String(selectedProduct.id),
                    variant_id: String(selectedProduct.variants[0].id),
                    price: Number(selectedProduct.variants[0].price),
                    url: `https://${shopDomain}/products/${handle}`,
                },
            })
            // Add a delay to allow the SMS to be sent
            await new Promise((resolve) =>
                setTimeout(resolve, delaySendingSMSms),
            )

            void dispatch(
                notify({
                    message: `SMS sent successfully`,
                    status: NotificationStatus.Success,
                }),
            )
        } catch (error) {
            console.error(`Error sending test SMS: ${error}`)

            void dispatch(
                notify({
                    message: `Could not send test SMS`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [
        currentIntegration,
        currentJourney,
        delaySendingSMSms,
        dispatch,
        testSms,
        testSmsNumber,
        selectedProduct,
    ])

    return {
        handleTestSms,
    }
}
