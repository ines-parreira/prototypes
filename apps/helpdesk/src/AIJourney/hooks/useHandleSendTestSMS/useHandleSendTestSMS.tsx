import { useCallback } from 'react'

import { parsePhoneNumberWithError } from 'libphonenumber-js'

import { toast } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'
import type { Integration } from '@gorgias/helpdesk-types'

import { useTestSms } from 'AIJourney/queries'
import type { Product } from 'constants/integrations/types/shopify'

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
    const testSms = useTestSms()

    const handleTestSms = useCallback(async () => {
        try {
            if (!journeyData?.id || !testSmsNumber || !currentIntegration) {
                toast.error(
                    `Missing information: test number: ${testSmsNumber}, journeyID: ${journeyData?.id}, integrationId: ${currentIntegration?.id}`,
                )
                return
            }

            const { shop_domain: shopDomain } = currentIntegration.meta

            let phoneNumber: string
            try {
                const parsed = parsePhoneNumberWithError(testSmsNumber)
                phoneNumber = parsed.number
            } catch {
                toast.error('Invalid phone number format')
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

            toast.success('SMS sent successfully')
        } catch (error) {
            console.error(`Error sending test SMS: ${error}`)

            toast.error('Could not send test SMS')
        }
    }, [
        currentIntegration,
        journeyData,
        delaySendingSMSms,
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
