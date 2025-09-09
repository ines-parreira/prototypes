import { useEffect, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'
import { JourneyStatusEnum } from '@gorgias/convert-client'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { Button } from 'AIJourney/components/Button/Button'
import { FieldPresentation } from 'AIJourney/components/FieldPresentation/FieldPresentation'
import { useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useAIJourneyProductList } from 'AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList'
import { useJourneyContext } from 'AIJourney/providers'
import { useTestSms } from 'AIJourney/queries'
import { isValidPhoneNumber } from 'AIJourney/utils'
import { Product } from 'constants/integrations/types/shopify'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { ProductSelectField, TestSMSField } from './fields'

import css from './Activation.less'

const TEST_SMS_NUMBER_KEY = 'ai-journey-test-sms-number'

type ActivationProps = {
    // Allow to override the delay for sending the SMS
    // This is useful for testing purposes
    delaySendingSMSms?: number
}
export const Activation = ({ delaySendingSMSms = 10_000 }: ActivationProps) => {
    const history = useHistory()
    const dispatch = useAppDispatch()

    const [isVisible, setIsVisible] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [testSmsNumber, setTestSmsNumber] = useLocalStorage<string>(
        TEST_SMS_NUMBER_KEY,
        '',
    )

    const isAiJourneyPlaygroundEnabled = useFlag(
        FeatureFlagKey.AiJourneyPlaygroundEnabled,
    )

    const {
        journey: abandonedCartJourney,
        currentIntegration,
        shopName,
        isLoading: isLoadingJourneyData,
    } = useJourneyContext()

    const { data: currentUser } = useGetCurrentUser()
    const customerName = currentUser?.data?.name || 'John Doe'

    const testSms = useTestSms()

    const integrationId = currentIntegration?.id

    const { productList, isLoading: isLoadingProductsList } =
        useAIJourneyProductList({ integrationId })

    useEffect(() => {
        if (productList.length > 0 && !selectedProduct) {
            setSelectedProduct(productList[0])
        }
    }, [productList, selectedProduct])

    const handleProductSelectChange = (newValue: Product) => {
        setSelectedProduct(newValue)
    }

    const handleTestSmsNumberChange = (newValue: string) => {
        setTestSmsNumber(newValue)
    }

    const {
        handleUpdate,
        isLoading: isLoadingHandleUpdate,
        isSuccess: isSuccessHandleUpdate,
    } = useJourneyUpdateHandler({
        integrationId,
        abandonedCartJourney,
    })

    const handleTestSms = async () => {
        try {
            if (!selectedProduct) {
                void dispatch(
                    notify({
                        message: 'Please select a product',
                        status: NotificationStatus.Error,
                    }),
                )
                return
            } else if (!abandonedCartJourney?.id || !testSmsNumber) {
                void dispatch(
                    notify({
                        message: `Missing information: test number: ${testSmsNumber}, journeyID: ${abandonedCartJourney?.id}`,
                        status: NotificationStatus.Error,
                    }),
                )
                return
            }

            await testSms.mutateAsync({
                // TODO use generic phone number formatting
                phoneNumber: `+1${testSmsNumber.replace(/\D/g, '')}`,
                journeyId: abandonedCartJourney?.id,
                product: {
                    product_id: String(selectedProduct.id),
                    variant_id: String(selectedProduct.variants[0]?.id),
                    price: Number(selectedProduct.variants[0]?.price),
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
    }

    const handleContinue = async () => {
        try {
            await handleUpdate({
                journeyState: JourneyStatusEnum.Active,
                journeyMessageInstructions:
                    abandonedCartJourney?.message_instructions,
            })
            setIsVisible(false)
            setTimeout(() => {
                history.push(`/app/ai-journey/${shopName}/performance`)
            }, 700)
        } catch (error) {
            void dispatch(
                notify({
                    message: `Error updating journey: ${error}`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }

    const isNumberValid = isValidPhoneNumber(testSmsNumber)

    const shouldDisableButton =
        !selectedProduct ||
        !isNumberValid ||
        isLoadingHandleUpdate ||
        isSuccessHandleUpdate

    const isLoading = isLoadingJourneyData || isLoadingProductsList

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <motion.div
            className={css.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
        >
            <FieldPresentation
                name="Give your flow a test run before going live"
                description="Impersonate a customer and test the conversation with the agent on your phone."
            />
            <ProductSelectField
                options={productList}
                onChange={handleProductSelectChange}
                name="Customer scenario"
                description={`Customer ${customerName} has left their cart with the following product`}
            />
            <TestSMSField
                value={testSmsNumber}
                onChange={handleTestSmsNumberChange}
                onActionClick={handleTestSms}
            />
            <div className={css.buttonsContainer}>
                <Button
                    variant="link"
                    redirectLink={`/app/ai-journey/${shopName}/${isAiJourneyPlaygroundEnabled ? 'test' : 'conversation-setup'}`}
                    label="Back"
                />
                <Button
                    label="Activate"
                    onClick={handleContinue}
                    isDisabled={shouldDisableButton}
                />
            </div>
        </motion.div>
    )
}
