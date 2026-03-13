import { useCallback, useEffect, useMemo, useState } from 'react'

import { useFormContext, useWatch } from 'react-hook-form'

import { Box, LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'
import type { CampaignJourneyConfigurationApiDTO } from '@gorgias/convert-client'

import {
    MessageGuidanceCard,
    PlaygroundPreview,
    TestingProductCard,
} from 'AIJourney/components'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import {
    useGeneratePlaygroundMessage,
    useLastSelectedProduct,
} from 'AIJourney/hooks'
import { useAIJourneyProductList } from 'AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'
import type { Image, Product } from 'constants/integrations/types/shopify'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import css from './Preview.less'

export const Preview = () => {
    const {
        journeyData,
        journeyType,
        currentIntegration,
        isLoading: isLoadingJourneyData,
    } = useJourneyContext()

    const { warpToCollapsibleColumn, setIsCollapsibleColumnOpen } =
        useCollapsibleColumn()

    useEffect(() => {
        setIsCollapsibleColumnOpen(true)
        return () => setIsCollapsibleColumnOpen(false)
    }, [setIsCollapsibleColumnOpen])

    const { resolveProduct, setLastSelectedProductId } =
        useLastSelectedProduct()

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [currentProductImage, setCurrentProductImage] =
        useState<Image | null>()
    const [returningCustomer, setReturningCustomer] = useState(false)

    const { setValue } = useFormContext<SetupFormValues>()
    const journeyMessageInstructions = useWatch<
        SetupFormValues,
        'message_instructions'
    >({ name: 'message_instructions', defaultValue: '' })

    const integrationId = currentIntegration?.id

    const { configuration: journeyParams } = journeyData || {}

    const isCampaign = journeyData?.type === JOURNEY_TYPES.CAMPAIGN
    const isWelcome = journeyData?.type === JOURNEY_TYPES.WELCOME

    const campaignParams = isCampaign
        ? (journeyParams as CampaignJourneyConfigurationApiDTO)
        : null

    const campaignImage = useMemo(() => {
        return campaignParams?.media_urls?.[0] ?? undefined
    }, [campaignParams?.media_urls])

    const totalMessagesToBeGenerated = useMemo(() => {
        return (journeyParams?.max_follow_up_messages ?? 0) + 1
    }, [journeyParams?.max_follow_up_messages])

    const { productList, isLoading: isLoadingProductsList } =
        useAIJourneyProductList({ integrationId })

    useEffect(() => {
        if (!selectedProduct && productList.length > 0) {
            const resolved = resolveProduct(productList)
            if (resolved) setSelectedProduct(resolved)
        }
    }, [productList, selectedProduct, resolveProduct])

    const { handleGenerateMessages, playgroundMessages, isGeneratingMessages } =
        useGeneratePlaygroundMessage({
            journey: journeyData,
            currentIntegration,
            journeyParams,
            journeyType,
            selectedProduct,
            totalMessagesToBeGenerated,
            journeyMessageInstructions: journeyMessageInstructions ?? '',
            returningCustomer,
        })

    useEffect(() => {
        if (journeyData?.message_instructions) {
            setValue('message_instructions', journeyData.message_instructions)
        }
    }, [journeyData, setValue])

    const handleProductChange = useCallback(
        (product: Product) => {
            setSelectedProduct(product)
            setLastSelectedProductId(product.id)
        },
        [setLastSelectedProductId],
    )

    const handleGenerateMessagesClick = useCallback(async () => {
        setCurrentProductImage(selectedProduct?.image)
        await handleGenerateMessages()
    }, [handleGenerateMessages, selectedProduct?.image])

    const shouldRenderTestingProductCard = !isWelcome && !isCampaign

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

    return (
        <Box flexDirection="column" gap="lg">
            {shouldRenderTestingProductCard && (
                <TestingProductCard
                    selectedProduct={selectedProduct ?? undefined}
                    onProductChange={handleProductChange}
                />
            )}
            <MessageGuidanceCard
                onReturningCustomerChange={setReturningCustomer}
            />

            {warpToCollapsibleColumn(
                <PlaygroundPreview
                    content={playgroundMessages}
                    includeImage={journeyParams?.include_image}
                    isGeneratingMessages={isGeneratingMessages}
                    selectedProductImage={currentProductImage}
                    isCampaign={isCampaign}
                    campaignImage={campaignImage}
                    onGenerateMessages={handleGenerateMessagesClick}
                />,
            )}
        </Box>
    )
}
