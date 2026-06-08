import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useFormContext } from 'react-hook-form'

import { Box, Button, Heading, ToggleField } from '@gorgias/axiom'
import type {
    CampaignJourneyConfigurationApiDTO,
    JourneyConfigurationApiDTO,
} from '@gorgias/convert-client'

import {
    PlaygroundPreview,
    TestGuidanceVariantSelect,
    TestingProductCard,
} from 'AIJourney/components'
import type { MessageInstructionsVariant } from 'AIJourney/components/MessageGuidanceCard/types'
import {
    CONTROL_SELECTION,
    getGuidanceInstructionsForSelection,
    resolveGuidanceSelection,
} from 'AIJourney/components/TestGuidanceVariantSelect/TestGuidanceVariantSelect'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import {
    useAiJourneyStoreConfiguration,
    useGeneratePlaygroundMessage,
    useLastSelectedProduct,
} from 'AIJourney/hooks'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'
import type { Image, Product } from 'constants/integrations/types/shopify'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

type Props = {
    onClose: () => void
    promptUnsavedChanges?: (callbacks?: { onClose?: () => void }) => void
}

const COLLAPSIBLE_COLUMN_WIDTH = '380px'

export const PreviewPanel = ({ onClose, promptUnsavedChanges }: Props) => {
    const { journeyData, journeyType, currentIntegration } = useJourneyContext()
    const { warpToCollapsibleColumn, setCollapsibleColumnWidthConfig } =
        useCollapsibleColumn()

    useEffect(() => {
        setCollapsibleColumnWidthConfig({ width: COLLAPSIBLE_COLUMN_WIDTH })
        return () => setCollapsibleColumnWidthConfig(undefined)
    }, [setCollapsibleColumnWidthConfig])
    const { watch, formState } = useFormContext<SetupFormValues>()
    const journeyMessageInstructions = watch('message_instructions')
    const isFormDirty = formState.isDirty

    const variants = (watch('variants') ?? []) as MessageInstructionsVariant[]
    const isAbTestEnabled = variants.length > 0
    const [guidanceSelection, setGuidanceSelection] =
        useState(CONTROL_SELECTION)
    const effectiveGuidanceSelection = resolveGuidanceSelection(
        guidanceSelection,
        variants,
        false,
    )
    const resolvedMessageInstructions = isAbTestEnabled
        ? getGuidanceInstructionsForSelection(
              effectiveGuidanceSelection,
              journeyMessageInstructions ?? '',
              variants,
          )
        : (journeyMessageInstructions ?? '')

    const { storeConfiguration } = useAiJourneyStoreConfiguration(
        currentIntegration?.id,
    )

    const { setLastSelectedProductId } = useLastSelectedProduct()
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [currentProductImage, setCurrentProductImage] =
        useState<Image | null>(null)
    const [returningCustomer, setReturningCustomer] = useState(false)

    const journeyParams = (journeyData?.configuration ?? undefined) as
        | JourneyConfigurationApiDTO
        | undefined

    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const isWelcome = journeyType === JOURNEY_TYPES.WELCOME
    const isWinBack = journeyType === JOURNEY_TYPES.WIN_BACK

    const campaignParams = isCampaign
        ? (journeyParams as CampaignJourneyConfigurationApiDTO)
        : null

    const campaignImage = useMemo(
        () => campaignParams?.media_urls?.[0] ?? undefined,
        [campaignParams?.media_urls],
    )

    const totalMessagesToBeGenerated = useMemo(
        () => (journeyParams?.max_follow_up_messages ?? 0) + 1,
        [journeyParams?.max_follow_up_messages],
    )

    const { handleGenerateMessages, playgroundMessages, isGeneratingMessages } =
        useGeneratePlaygroundMessage({
            journey: journeyData,
            currentIntegration,
            journeyParams,
            journeyType,
            selectedProduct,
            totalMessagesToBeGenerated,
            journeyMessageInstructions: resolvedMessageInstructions,
            returningCustomer,
            smsSenderIntegrationId:
                storeConfiguration?.sms_sender_integration_id,
            smsSenderNumber: storeConfiguration?.sms_sender_number,
            brandName: storeConfiguration?.brand_name,
        })

    const handleProductChange = useCallback(
        (product: Product) => {
            setSelectedProduct(product)
            setLastSelectedProductId(product.id)
        },
        [setLastSelectedProductId],
    )

    const generateMessages = useCallback(async () => {
        setCurrentProductImage(selectedProduct?.image ?? null)
        await handleGenerateMessages()
    }, [handleGenerateMessages, selectedProduct?.image])

    const isPreviewPendingSaveRef = useRef(false)

    const handleGenerateMessagesClick = useCallback(() => {
        if (!promptUnsavedChanges || !isFormDirty) {
            void generateMessages()
            return
        }
        if (isPreviewPendingSaveRef.current) return
        isPreviewPendingSaveRef.current = true
        promptUnsavedChanges({
            onClose: () => {
                isPreviewPendingSaveRef.current = false
            },
        })
    }, [promptUnsavedChanges, isFormDirty, generateMessages])

    useEffect(() => {
        if (isPreviewPendingSaveRef.current && !isFormDirty) {
            isPreviewPendingSaveRef.current = false
            void generateMessages()
        }
    }, [isFormDirty, generateMessages])

    const shouldRenderTestingProductCard =
        !isWelcome && !isCampaign && !isWinBack
    const shouldRenderTestConfiguration =
        shouldRenderTestingProductCard || isWelcome || isAbTestEnabled

    return warpToCollapsibleColumn(
        <>
            {shouldRenderTestConfiguration && (
                <Box flexDirection="column" gap="sm" padding="md">
                    <Box alignItems="center" justifyContent="space-between">
                        <Heading size="lg">Test configuration</Heading>
                        <Button
                            variant="tertiary"
                            icon="close"
                            aria-label="Close preview"
                            onClick={onClose}
                        />
                    </Box>
                    {shouldRenderTestingProductCard && (
                        <TestingProductCard
                            selectedProduct={selectedProduct ?? undefined}
                            onProductChange={handleProductChange}
                            isV3Architecture
                        />
                    )}
                    {isWelcome && (
                        <ToggleField
                            value={returningCustomer}
                            onChange={setReturningCustomer}
                            label="Returning customer"
                            aria-label="Returning customer"
                        />
                    )}
                    {isAbTestEnabled && (
                        <TestGuidanceVariantSelect
                            variants={variants}
                            value={effectiveGuidanceSelection}
                            onChange={setGuidanceSelection}
                            infoTooltip="Choose which guidance variant to preview."
                        />
                    )}
                </Box>
            )}
            <PlaygroundPreview
                content={playgroundMessages}
                includeImage={journeyParams?.include_image}
                isGeneratingMessages={isGeneratingMessages}
                selectedProductImage={currentProductImage}
                isCampaign={isCampaign}
                campaignImage={campaignImage}
                onGenerateMessages={handleGenerateMessagesClick}
                onClose={shouldRenderTestConfiguration ? undefined : onClose}
            />
        </>,
    )
}
