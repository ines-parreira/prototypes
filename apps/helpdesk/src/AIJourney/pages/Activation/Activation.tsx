import { useEffect, useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import { useHistory, useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'

import { Button } from 'AIJourney/components/Button/Button'
import { useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useIntegrations } from 'AIJourney/providers'
import { useJourneys, useTestSms } from 'AIJourney/queries'
import { isValidPhoneNumber } from 'AIJourney/utils'
import { Product } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import { useListProducts } from 'models/integration/queries'
import { IntegrationDataItem } from 'models/integration/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { ProductSelectField, TestSMSField } from './fields'

import css from './Activation.less'

type ActivationProps = {
    // Allow to override the delay for sending the SMS
    // This is useful for testing purposes
    delaySendingSMSms?: number
}
export const Activation = ({ delaySendingSMSms = 10_000 }: ActivationProps) => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()
    const dispatch = useAppDispatch()

    const [isVisible, setIsVisible] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [testSmsNumber, setTestSmsNumber] = useState('')

    const { currentIntegration, isLoading: isLoadingIntegrations } =
        useIntegrations(shopName)

    const testSms = useTestSms()

    const integrationId = useMemo(() => {
        return currentIntegration?.id
    }, [currentIntegration])

    const { data: merchantAiJourneys, isLoading: isLoadingJourneys } =
        useJourneys(integrationId, {
            enabled: !!integrationId,
        })

    const abandonedCartJourney = merchantAiJourneys?.find(
        (journey) => journey.type === 'cart_abandoned',
    )

    const { data: integrationItems, isLoading: isLoadingProductsList } =
        useListProducts(
            currentIntegration?.id ?? 0,
            !!currentIntegration?.id,
            { limit: 50 },
            { refetchOnWindowFocus: false, refetchOnMount: false },
        )

    const products = useMemo(() => {
        const data = integrationItems?.pages?.reduce(
            (acc, page) => [...acc, ...page.data.data],
            [] as IntegrationDataItem<Product>[],
        )
        return (data || [])
            .filter((item) => item.data.status === 'active')
            .filter((item) => !!item.data.image && !!item.data.title)
            .map((item) => item.data)
            .splice(0, 5) as Product[]
    }, [integrationItems])

    useEffect(() => {
        if (products.length > 0 && !selectedProduct) {
            setSelectedProduct(products[0])
        }
    }, [products, selectedProduct])

    const handleProductSelectChange = (newValue: Product) => {
        setSelectedProduct(newValue)
    }

    const handleTestSmsNumberChange = (newValue: string) => {
        setTestSmsNumber(newValue)
    }

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        currentIntegration,
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
            await handleUpdate()
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

    const shouldDisableButton = !selectedProduct || !isNumberValid

    const isLoading =
        isLoadingIntegrations || isLoadingProductsList || isLoadingJourneys

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
            <ProductSelectField
                options={products}
                onChange={handleProductSelectChange}
            />
            <TestSMSField
                value={testSmsNumber}
                onChange={handleTestSmsNumberChange}
                onActionClick={handleTestSms}
            />
            <div className={css.buttonsContainer}>
                <Button
                    variant="link"
                    redirectLink={`/app/ai-journey/${shopName}/conversation-setup`}
                    label="Back"
                />
                <Button
                    label="Continue"
                    onClick={handleContinue}
                    isDisabled={shouldDisableButton}
                />
            </div>
        </motion.div>
    )
}
