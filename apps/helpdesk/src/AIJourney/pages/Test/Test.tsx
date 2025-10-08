import { useEffect, useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'

import {
    Button,
    FieldPresentation,
    PlaygroundPreview,
} from 'AIJourney/components'
import {
    useGeneratePlaygroundMessage,
    useJourneyUpdateHandler,
} from 'AIJourney/hooks'
import { useAIJourneyProductList } from 'AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList'
import { useJourneyContext } from 'AIJourney/providers'
import { Product } from 'constants/integrations/types/shopify'

import { ProductSelectField } from '../Activation/fields'
import { JourneyMessageInstructionsField } from '../Setup/fields'

import css from './Test.less'

export const Test = () => {
    const history = useHistory()

    const {
        journey: abandonedCartJourney,
        journeyData,
        currentIntegration,
        shopName,
        isLoading: isLoadingJourneyData,
    } = useJourneyContext()

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [journeyMessageInstructions, setJourneyMessageInstructions] =
        useState<string>(abandonedCartJourney?.message_instructions || '')

    const integrationId = currentIntegration?.id

    const { configuration: journeyParams } = journeyData || {}

    const totalMessagesToBeGenerated = useMemo(() => {
        return (journeyParams?.max_follow_up_messages ?? 0) + 1
    }, [journeyParams?.max_follow_up_messages])

    const { productList, isLoading: isLoadingProductsList } =
        useAIJourneyProductList({ integrationId })

    const handleProductSelectChange = (newValue: Product) => {
        setSelectedProduct(newValue)
    }

    const { handleGenerateMessages, playgroundMessages, isGeneratingMessages } =
        useGeneratePlaygroundMessage({
            abandonedCartJourney,
            currentIntegration,
            journeyParams,
            selectedProduct,
            totalMessagesToBeGenerated,
            journeyMessageInstructions,
        })

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        abandonedCartJourney,
    })

    useEffect(() => {
        if (abandonedCartJourney?.message_instructions) {
            setJourneyMessageInstructions(
                abandonedCartJourney.message_instructions,
            )
        }
    }, [abandonedCartJourney])

    useEffect(() => {
        if (productList.length > 0 && !selectedProduct) {
            setSelectedProduct(productList[0])
        }
    }, [productList, selectedProduct])

    const handleContinue = async () => {
        await handleUpdate({
            journeyState: abandonedCartJourney?.state || 'draft',
            journeyMessageInstructions,
        })
        history.push(`/app/ai-journey/${shopName}/activate`)
    }

    const isLoading = isLoadingJourneyData || isLoadingProductsList

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className={css.container}>
            <motion.div
                className={css.grid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={css.playgroundConfiguration}>
                    <div className={css.playgroundConfigurationFields}>
                        <FieldPresentation
                            name="Preview your abandoned cart messages"
                            description="See the messages your customers would receive if they left something in their cart."
                        />
                        <ProductSelectField
                            options={productList}
                            name="Select an abandoned product"
                            description={undefined}
                            onChange={handleProductSelectChange}
                        />
                        <JourneyMessageInstructionsField
                            description="Write guidelines for how the AI should text your shoppers"
                            hideInfoContent
                            name="Message guidance"
                            maxLength={4000}
                            onChange={setJourneyMessageInstructions}
                            optional
                            value={journeyMessageInstructions}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        label="Preview messages"
                        onClick={handleGenerateMessages}
                        isDisabled={isGeneratingMessages}
                    />
                </div>
                <div className={css.playgroundPreview}>
                    <PlaygroundPreview
                        content={playgroundMessages}
                        isGeneratingMessages={isGeneratingMessages}
                        includeImage={journeyParams?.include_image}
                        selectedProductImage={selectedProduct?.image}
                    />
                </div>
            </motion.div>
            <div className={css.buttonsContainer}>
                <Button
                    variant="link"
                    redirectLink={`/app/ai-journey/${shopName}/setup`}
                    label="Return"
                />
                <Button
                    label="Continue"
                    onClick={handleContinue}
                    isDisabled={false}
                />
            </div>
        </div>
    )
}
