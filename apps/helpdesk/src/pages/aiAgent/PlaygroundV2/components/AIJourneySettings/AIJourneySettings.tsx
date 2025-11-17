import { useCallback, useMemo, useRef } from 'react'

import classNames from 'classnames'

import {
    LegacyBanner as Banner,
    Button,
    ListItem,
    LegacyLoadingSpinner as LoadingSpinner,
    Select,
    SelectField,
    SelectTrigger,
    TextField,
    ToggleField,
} from '@gorgias/axiom'
import { JourneyTypeEnum } from '@gorgias/convert-client'

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
        journeys,
        shopName,
        isLoadingJourneys,
        aiJourneySettings,
        setAIJourneySettings,
        productList,
    } = useAIJourneyContext()
    const inputRef = useRef<HTMLInputElement>(null)

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

    const journeyOptions = useMemo(() => {
        return journeys.map((journey) => ({
            id: journey.type,
            label: getJourneyLabel(journey.type),
        }))
    }, [journeys])

    const aiJourneyStoreUrl = `/app/ai-journey/${shopName}`

    const productOptions = useMemo(() => {
        return productList.map((product) => ({
            id: product.id,
            label: product.title,
            img: product.image?.src,
            alt: product.image?.alt,
        }))
    }, [productList])

    const selectedJourneyOption = useMemo(() => {
        return journeyOptions.find((option) => option.id === journeyType)
    }, [journeyOptions, journeyType])

    const selectedProductOption = useMemo(() => {
        return productOptions.find(
            (option) => selectedProduct && option.id === selectedProduct.id,
        )
    }, [productOptions, selectedProduct])

    const getProductById = useCallback(
        (id: number) => productList.find((product) => product.id === id),
        [productList],
    )

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

            <Select
                data-name="select-field"
                aria-label="Product"
                trigger={({ selectedText, isOpen }) => (
                    <SelectTrigger>
                        <TextField
                            inputRef={inputRef}
                            value={selectedText}
                            label="Product"
                            isFocused={isOpen}
                            leadingSlot={
                                <img
                                    className={css.selectedProductImage}
                                    src={selectedProduct?.image?.src || ''}
                                    alt="selected product"
                                />
                            }
                            trailingSlot={
                                isOpen
                                    ? 'arrow-chevron-up'
                                    : 'arrow-chevron-down'
                            }
                        />
                    </SelectTrigger>
                )}
                triggerRef={inputRef}
                items={productOptions}
                selectedItem={selectedProductOption}
                onSelect={(value) => {
                    const product = getProductById(value.id)
                    if (!product) return
                    setAIJourneySettings({
                        selectedProduct: product,
                    })
                }}
                isDisabled={false}
                isSearchable
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
            </Select>

            <span className={css.messageSettingsSeparator}>
                Message settings
            </span>
            <div
                className={classNames([
                    css.inputFieldWrapper,
                    css.followUpField,
                ])}
            >
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
                    label="Total number of messages to send"
                >
                    {(option: { id: number; label: string }) => (
                        <ListItem label={option.label} />
                    )}
                </SelectField>
            </div>
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
            <div
                className={classNames([
                    css.discountCodeField,
                    css.inputFieldWrapper,
                ])}
            >
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
            <div
                className={classNames([
                    css.discountCodeMessageIdxField,
                    css.inputFieldWrapper,
                ])}
            >
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
