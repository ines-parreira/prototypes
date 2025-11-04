import { useCallback, useEffect, useMemo } from 'react'

import {
    Banner,
    Button,
    ListItem,
    LoadingSpinner,
    SelectField,
    TextField,
    ToggleField,
} from '@gorgias/axiom'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import { useAIJourneyProductList } from 'AIJourney/hooks'
import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import TextArea from 'pages/common/forms/TextArea'

import css from './AIJourneySettings.less'

const getJourneyLabel = (journeyType: JourneyTypeEnum): string => {
    switch (journeyType) {
        case JourneyTypeEnum.CartAbandoned:
            return 'Cart Abandoned'
        case JourneyTypeEnum.SessionAbandoned:
            return 'Session Abandoned'
        default:
            return journeyType
    }
}

const FOLLOW_UP_OPTIONS: { id: number; label: string }[] = [1, 2, 3, 4, 5].map(
    (num) => ({
        id: num,
        label: num.toString(),
    }),
)

export const AIJourneySettings: React.FC = () => {
    const {
        shopifyIntegration,
        journeys,
        shopName,
        isLoadingJourneys,
        aiJourneySettings,
        setAIJourneySettings,
    } = useAIJourneyContext()

    const {
        selectedProduct,
        journeyType,
        totalFollowUp,
        includeDiscountCode,
        includeProductImage,
        outboundMessageInstructions,
        discountCodeMessageIdx,
        discountCodeValue,
    } = aiJourneySettings

    const products = useAIJourneyProductList({
        integrationId: shopifyIntegration,
    })

    const journeyOptions = useMemo(() => {
        return journeys.map((journey) => ({
            id: journey.type,
            label: getJourneyLabel(journey.type),
        }))
    }, [journeys])

    const aiJourneyStoreUrl = `/app/ai-journey/${shopName}`

    const productOptions = useMemo(() => {
        return products.productList.map((product) => ({
            id: product.id,
            label: product.title,
            img: product.image?.src,
            alt: product.image?.alt,
        }))
    }, [products.productList])

    const selectedJourneyOption = useMemo(() => {
        return journeyOptions.find((option) => option.id === journeyType)
    }, [journeyOptions, journeyType])

    const selectedProductOption = useMemo(() => {
        return productOptions.find(
            (option) => selectedProduct && option.id === selectedProduct.id,
        )
    }, [productOptions, selectedProduct])

    const getProductById = useCallback(
        (id: number) =>
            products.productList.find((product) => product.id === id),
        [products.productList],
    )

    useEffect(() => {
        if (productOptions.length > 0 && !selectedProduct) {
            const product = getProductById(productOptions[0].id) ?? null
            setAIJourneySettings({
                selectedProduct: product,
            })
        }
    }, [productOptions, getProductById, selectedProduct, setAIJourneySettings])

    if (isLoadingJourneys) {
        return <LoadingSpinner />
    }

    if (journeyOptions.length === 0) {
        return (
            <Banner
                type="warning"
                action={
                    <Button
                        variant="secondary"
                        as="a"
                        href={aiJourneyStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Configure journeys
                    </Button>
                }
            >
                <strong>No journeys configured.</strong> You need to configure
                at least one journey (Cart Abandoned or Session Abandoned)
                before you can test outbound messages.
            </Banner>
        )
    }

    return (
        <>
            <SelectField
                value={selectedJourneyOption}
                onChange={(value) => {
                    setAIJourneySettings({
                        journeyType: value.id,
                    })
                }}
                items={journeyOptions}
                label="Campaign / Flow"
            >
                {(option: (typeof journeyOptions)[number]) => (
                    <ListItem label={option.label} />
                )}
            </SelectField>
            <SelectField
                isSearchable
                value={selectedProductOption}
                onChange={(value) => {
                    const product = getProductById(value.id)
                    if (!product) return
                    setAIJourneySettings({
                        selectedProduct: product,
                    })
                }}
                items={productOptions}
                label="Product"
            >
                {(option: (typeof productOptions)[number]) => (
                    <ListItem
                        id={option.id}
                        label={option.label}
                        leadingSlot={
                            <img
                                width="24px"
                                height="24px"
                                src={option.img}
                                alt={option.alt || 'Product image'}
                            />
                        }
                    />
                )}
            </SelectField>
            <span>Message settings</span>
            <SelectField
                value={FOLLOW_UP_OPTIONS.find(
                    (option) => option.id === totalFollowUp,
                )}
                onChange={(value) => {
                    setAIJourneySettings({
                        totalFollowUp: value.id,
                    })
                }}
                items={FOLLOW_UP_OPTIONS}
                label="Total follow-up messages"
            >
                {(option: { id: number; label: string }) => (
                    <ListItem label={option.label} />
                )}
            </SelectField>
            <div className={css.toggleFieldsContainer}>
                <ToggleField
                    value={includeProductImage}
                    label="Include product image in first message"
                    onChange={(value) => {
                        setAIJourneySettings({
                            includeProductImage: value,
                        })
                    }}
                />
                <ToggleField
                    value={includeDiscountCode}
                    label="Include discount code"
                    onChange={(value) => {
                        setAIJourneySettings({
                            includeDiscountCode: value,
                        })
                    }}
                />
            </div>
            <div className={css.discountCodeField}>
                <TextField
                    label="Discount code value"
                    value={discountCodeValue.toString()}
                    onChange={(value) => {
                        if (value === '') {
                            setAIJourneySettings({
                                discountCodeValue: 0,
                            })
                        }
                        const numericValue = parseFloat(value)
                        if (isNaN(numericValue)) return
                        setAIJourneySettings({
                            discountCodeValue: numericValue,
                        })
                    }}
                    trailingSlot={<Button icon="percent" variant="tertiary" />}
                />
            </div>
            <div className={css.discountCodeMessageIdxField}>
                <SelectField
                    value={FOLLOW_UP_OPTIONS.find(
                        (option) => option.id === discountCodeMessageIdx,
                    )}
                    onChange={(value) => {
                        setAIJourneySettings({
                            discountCodeMessageIdx: value.id,
                        })
                    }}
                    items={FOLLOW_UP_OPTIONS.map((option) => ({
                        id: option.id,
                        label: `Message ${option.label}`,
                    }))}
                    label="In which message should the discount code be sent"
                >
                    {(option: { id: number; label: string }) => (
                        <ListItem label={option.label} />
                    )}
                </SelectField>
            </div>
            <TextArea
                className={css.messageInstructions}
                label="Message instructions"
                value={outboundMessageInstructions}
                onChange={(value) => {
                    setAIJourneySettings({
                        outboundMessageInstructions: value,
                    })
                }}
            />
        </>
    )
}
