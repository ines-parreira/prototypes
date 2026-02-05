import { useEffect, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'
import { JourneyStatusEnum } from '@gorgias/convert-client'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { Button } from 'AIJourney/components/Button/Button'
import { FieldPresentation } from 'AIJourney/components/FieldPresentation/FieldPresentation'
import { Switch } from 'AIJourney/components/Switch/Switch'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import { useHandleSendTestSMS, useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useAIJourneyProductList } from 'AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList'
import { useJourneyContext } from 'AIJourney/providers'
import type { Product } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { ProductSelectField, TestSMSField } from './fields'

import css from './Activation.less'

const TEST_SMS_NUMBER_KEY = 'ai-journey-test-sms-number'

export const Activation = () => {
    const history = useHistory()
    const dispatch = useAppDispatch()

    const [isVisible, setIsVisible] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [testSmsNumber, setTestSmsNumber] = useLocalStorage<string>(
        TEST_SMS_NUMBER_KEY,
        '',
    )
    const [returningCustomer, setReturningCustomer] = useState(false)

    const {
        journeyData,
        currentIntegration,
        shopName,
        journeyType,
        isLoading: isLoadingJourneyData,
    } = useJourneyContext()

    const { data: currentUser } = useGetCurrentUser()
    const customerName = currentUser?.data?.name || 'John Doe'

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
        journeyId: journeyData?.id,
    })

    const { handleTestSms } = useHandleSendTestSMS({
        journeyData,
        selectedProduct,
        testSmsNumber,
        currentIntegration,
        returningCustomer,
    })

    const handleContinue = async () => {
        try {
            await handleUpdate({
                journeyState: JourneyStatusEnum.Active,
                journeyMessageInstructions: journeyData?.message_instructions,
            })
            setIsVisible(false)
            setTimeout(() => {
                if (journeyData?.type === JOURNEY_TYPES.CAMPAIGN) {
                    history.push(`/app/ai-journey/${shopName}/campaigns`)
                } else {
                    history.push(`/app/ai-journey/${shopName}/flows`)
                }
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

    const requiresProduct =
        journeyType === JOURNEY_TYPES.CART_ABANDONMENT ||
        journeyType === JOURNEY_TYPES.SESSION_ABANDONMENT ||
        journeyType === JOURNEY_TYPES.WIN_BACK

    const shouldDisableButton =
        (requiresProduct && !selectedProduct) ||
        isLoadingHandleUpdate ||
        isSuccessHandleUpdate

    const isLoading = isLoadingJourneyData || isLoadingProductsList

    const productSelectDescription = {
        [JOURNEY_TYPES.CART_ABANDONMENT]: {
            name: 'Select an abandoned product',
            description: `Customer ${customerName} has left their cart with the following product`,
        },
        [JOURNEY_TYPES.SESSION_ABANDONMENT]: {
            name: 'Select an abandoned product',
            description: `Customer ${customerName} has abandoned a page with the following product`,
        },
        [JOURNEY_TYPES.WIN_BACK]: {
            name: 'Select a product to feature',
            description: `Customer ${customerName} has not purchased in a while. Feature this product to entice them back.`,
        },
        [JOURNEY_TYPES.CAMPAIGN]: null,
        [JOURNEY_TYPES.WELCOME]: null,
        [JOURNEY_TYPES.POST_PURCHASE]: null,
    }

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (!journeyData) {
        return (
            <div className={css.container}>
                <p>Page not found.</p>
            </div>
        )
    }

    const description = productSelectDescription[journeyType]

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
            {description !== null && (
                <ProductSelectField
                    name={description.name}
                    description={description.description}
                    options={productList}
                    onChange={handleProductSelectChange}
                />
            )}
            {journeyData.type === JOURNEY_TYPES.WELCOME && (
                <div className={css.customerTypeField}>
                    <FieldPresentation name="Returning customer" />
                    <Switch
                        isChecked={returningCustomer}
                        onChange={() =>
                            setReturningCustomer(!returningCustomer)
                        }
                    />
                </div>
            )}
            <TestSMSField
                value={testSmsNumber}
                onChange={handleTestSmsNumberChange}
                onActionClick={handleTestSms}
            />
            <div className={css.buttonsContainer}>
                <Button
                    variant="link"
                    redirectLink={`/app/ai-journey/${shopName}/${journeyType}/test/${journeyData.id}`}
                    label="Return"
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
