import { useCallback, useEffect, useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'
import type { CampaignJourneyConfigurationApiDTO } from '@gorgias/convert-client'

import {
    Button,
    FieldPresentation,
    PlaygroundPreview,
    Switch,
} from 'AIJourney/components'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import {
    useGeneratePlaygroundMessage,
    useJourneyUpdateHandler,
} from 'AIJourney/hooks'
import { useAIJourneyProductList } from 'AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList'
import { useJourneyContext } from 'AIJourney/providers'
import type { Image, Product } from 'constants/integrations/types/shopify'

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
    const [error, setError] = useState<string | undefined>()
    const [currentProductImage, setCurrentProductImage] =
        useState<Image | null>()
    const [returningCustomer, setReturningCustomer] = useState(false)

    const [journeyMessageInstructions, setJourneyMessageInstructions] =
        useState<string>(journeyData?.message_instructions || '')

    const integrationId = currentIntegration?.id

    const { configuration: journeyParams } = journeyData || {}

    const isCampaign = journeyData?.type === JOURNEY_TYPES.CAMPAIGN

    const campaignParams = isCampaign
        ? (journeyParams as CampaignJourneyConfigurationApiDTO)
        : null

    const campaignImage = useMemo(() => {
        return campaignParams?.media_urls?.[0] ?? undefined
    }, [campaignParams?.media_urls])

    const totalMessagesToBeGenerated = useMemo(() => {
        return (journeyParams?.max_follow_up_messages ?? 0) + 1
    }, [journeyParams?.max_follow_up_messages])

    const areInstructionsMandatory = useMemo(() => {
        return journeyData?.type === JOURNEY_TYPES.CAMPAIGN
    }, [journeyData])

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
            returningCustomer,
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

    const handleInstructionsChange = useCallback(
        (value: string) => {
            setJourneyMessageInstructions(value)

            if (value) {
                setError(undefined)
            }
        },
        [setJourneyMessageInstructions, setError],
    )

    const handleGenerateMessagesClick = useCallback(async () => {
        if (areInstructionsMandatory && !journeyMessageInstructions) {
            setError('Please provide message guidance to continue.')
            return
        }
        setCurrentProductImage(selectedProduct?.image)
        setError(undefined)
        await handleGenerateMessages()
    }, [
        handleGenerateMessages,
        areInstructionsMandatory,
        journeyMessageInstructions,
        selectedProduct?.image,
    ])

    const handleContinue = useCallback(async () => {
        if (areInstructionsMandatory && !journeyMessageInstructions) {
            setError('Please provide message guidance to continue.')
            return
        }
        setError(undefined)
        await handleUpdate({
            journeyState: journeyData?.state || 'draft',
            journeyMessageInstructions,
        })
        history.push(
            `/app/ai-journey/${shopName}/${journeyType}/activate/${journeyData?.id}`,
        )
    }, [
        areInstructionsMandatory,
        journeyMessageInstructions,
        shopName,
        journeyType,
        journeyData,
        handleUpdate,
        history,
    ])

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

    const textContent: Record<
        JOURNEY_TYPES,
        { name: string; description: string; productSelect: string }
    > = {
        [JOURNEY_TYPES.CART_ABANDONMENT]: {
            name: 'Preview your abandoned cart messages',
            description:
                'See the messages your customers would receive if they left something in their cart.',
            productSelect: 'Select an abandoned product',
        },
        [JOURNEY_TYPES.SESSION_ABANDONMENT]: {
            name: 'Preview your browse abandonment messages',
            description:
                'See the messages your customers would receive if they leave the product page without adding anything to their cart.',
            productSelect: 'Select an abandoned product',
        },
        [JOURNEY_TYPES.CAMPAIGN]: {
            name: 'Preview your campaign messages',
            description:
                'See the messages your customers would receive if they are part of this campaign.',
            productSelect: '',
        },
        [JOURNEY_TYPES.WIN_BACK]: {
            name: 'Preview your win-back messages',
            description:
                'See the messages your customers would receive if they bought something from your store but haven’t returned in a while.',
            productSelect: 'Select a product to feature',
        },
        [JOURNEY_TYPES.WELCOME]: {
            name: 'Preview your welcome messages',
            description:
                'See the messages your customers would receive when they subscribe.',
            productSelect: '',
        },
        [JOURNEY_TYPES.POST_PURCHASE]: {
            name: 'Preview your post-purchase messages',
            description:
                'See the messages your customers would receive when they place an order.',
            productSelect: 'Select a product to feature',
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
                        {journeyData.type !== JOURNEY_TYPES.CAMPAIGN &&
                            journeyData.type !== JOURNEY_TYPES.WELCOME && (
                                <ProductSelectField
                                    options={productList}
                                    name={
                                        textContent[journeyType].productSelect
                                    }
                                    description={undefined}
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
                        <JourneyMessageInstructionsField
                            description="Write guidelines for how the AI should text your shoppers"
                            hideInfoContent
                            name="Message guidance"
                            maxLength={4000}
                            onChange={handleInstructionsChange}
                            optional={!areInstructionsMandatory}
                            error={error}
                            value={journeyMessageInstructions}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        label="Preview messages"
                        onClick={handleGenerateMessagesClick}
                        isDisabled={isGeneratingMessages}
                    />
                </div>
                <div className={css.playgroundPreview}>
                    <PlaygroundPreview
                        content={playgroundMessages}
                        isGeneratingMessages={isGeneratingMessages}
                        includeImage={journeyParams?.include_image}
                        selectedProductImage={currentProductImage}
                        campaignImage={campaignImage}
                        isCampaign={isCampaign}
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
