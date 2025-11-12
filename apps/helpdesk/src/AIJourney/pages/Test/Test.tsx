import { useEffect, useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'

import {
    Button,
    FieldPresentation,
    PlaygroundPreview,
} from 'AIJourney/components'
import { JOURNEY_TYPES } from 'AIJourney/constants'
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
        journeyData,
        journeyType,
        currentIntegration,
        shopName,
        isLoading: isLoadingJourneyData,
    } = useJourneyContext()

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [journeyMessageInstructions, setJourneyMessageInstructions] =
        useState<string>(journeyData?.message_instructions || '')

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
            journey: journeyData,
            currentIntegration,
            journeyParams,
            journeyType,
            selectedProduct,
            totalMessagesToBeGenerated,
            journeyMessageInstructions,
        })

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        journeyId: journeyData?.id,
    })

    useEffect(() => {
        if (journeyData?.message_instructions) {
            setJourneyMessageInstructions(journeyData.message_instructions)
        }
    }, [journeyData])

    useEffect(() => {
        if (productList.length > 0 && !selectedProduct) {
            setSelectedProduct(productList[0])
        }
    }, [productList, selectedProduct])

    const handleContinue = async () => {
        await handleUpdate({
            journeyState: journeyData?.state || 'draft',
            journeyMessageInstructions,
        })
        history.push(
            `/app/ai-journey/${shopName}/${journeyType}/activate/${journeyData?.id}`,
        )
    }

    const isLoading = isLoadingJourneyData || isLoadingProductsList

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

    const textContent = {
        [JOURNEY_TYPES.CART_ABANDONMENT]: {
            name: 'Preview your abandoned cart messages',
            description:
                'See the messages your customers would receive if they left something in their cart.',
        },
        [JOURNEY_TYPES.SESSION_ABANDONMENT]: {
            name: 'Preview your browse abandonment messages',
            description:
                'See the messages your customers would receive if they leave the product page without adding anything to their cart.',
        },
        [JOURNEY_TYPES.CAMPAIGN]: {
            name: 'Preview your campaign messages',
            description:
                'See the messages your customers would receive if they are part of this campaign.',
        },
        [JOURNEY_TYPES.WIN_BACK]: {
            name: 'Preview your win-back messages',
            description:
                'See the messages your customers would receive if they bought something from your store but haven’t returned in a while.',
        },
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
                            name={textContent[journeyType].name}
                            description={textContent[journeyType].description}
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
                    redirectLink={`/app/ai-journey/${shopName}/${journeyType}/setup/${journeyData.id}`}
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
