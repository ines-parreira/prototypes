import { useCallback } from 'react'

import { parsePhoneNumberWithError } from 'libphonenumber-js'

import type { JourneyApiDTO } from '@gorgias/convert-client'
import type { Integration } from '@gorgias/helpdesk-types'

import { useTestSms } from 'AIJourney/queries'
import type { Product } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type useHandleSendTestSMSProps = {
    journeyData: JourneyApiDTO | undefined
    selectedProduct: Product | null
    testSmsNumber: string | undefined
    currentIntegration?: Integration
    delaySendingSMSms?: number
    returningCustomer?: boolean
}

export const useHandleSendTestSMS = ({
    journeyData,
    selectedProduct,
    testSmsNumber,
    currentIntegration,
    delaySendingSMSms = 10_000,
    returningCustomer,
}: useHandleSendTestSMSProps) => {
    const dispatch = useAppDispatch()

    const testSms = useTestSms()

    const handleTestSms = useCallback(async () => {
        try {
            if (!journeyData?.id || !testSmsNumber || !currentIntegration) {
                void dispatch(
                    notify({
                        message: `Missing information: test number: ${testSmsNumber}, journeyID: ${journeyData?.id}, integrationId: ${currentIntegration?.id}`,
                        status: NotificationStatus.Error,
                    }),
                )
                return
            }

            const { shop_domain: shopDomain } = currentIntegration.meta

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

            const products = selectedProduct
                ? [
                      {
                          title: String(selectedProduct.title),
                          product_id: String(selectedProduct.id),
                          variant_id: String(selectedProduct.variants[0].id),
                          price: Number(selectedProduct.variants[0].price),
                          url: `https://${shopDomain}/products/${selectedProduct.handle}`,
                      },
                  ]
                : []

            await testSms.mutateAsync({
                phoneNumber,
                journeyId: journeyData.id,
                products,
                returningCustomer,
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
        journeyData,
        delaySendingSMSms,
        dispatch,
        testSms,
        testSmsNumber,
        selectedProduct,
        returningCustomer,
    ])

    return {
        handleTestSms,
        isLoading: testSms.isLoading,
    }
}
