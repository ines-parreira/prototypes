import { useCallback, useEffect, useMemo } from 'react'
import type { RefObject } from 'react'

import classNames from 'classnames'

import {
    LegacyBanner as Banner,
    Button,
    ListItem,
    ListSection,
    LegacyLoadingSpinner as LoadingSpinner,
    NumberField,
    Select,
    SelectField,
    SelectTrigger,
    TextField,
    ToggleField,
} from '@gorgias/axiom'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import { MAX_WAIT_TIME } from 'AIJourney/constants'
import { AudienceSelect } from 'AIJourney/pages/Setup/fields/AudienceSelect/AudienceSelect'
import type {
    OrderStatus,
    OrderStatusOption,
} from 'AIJourney/types/AIJourneyTypes'
import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useEvents } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import { PlaygroundEvent } from 'pages/aiAgent/PlaygroundV2/types'
import TextArea from 'pages/common/forms/TextArea'

import css from './AIJourneySettings.less'

type Entry = { id: string; label: string }
type Section = {
    id: number
    name: string
    items: Entry[]
}

const getJourneyLabel = (journeyType: JourneyTypeEnum): string => {
    switch (journeyType) {
        case JourneyTypeEnum.CartAbandoned:
            return 'Cart Abandoned'
        case JourneyTypeEnum.SessionAbandoned:
            return 'Browse Abandoned'
        case JourneyTypeEnum.WinBack:
            return 'Win-back'
        case JourneyTypeEnum.PostPurchase:
            return 'Post Purchase'
        case JourneyTypeEnum.Welcome:
            return 'Welcome'
        default:
            return journeyType
    }
}

const MAX_DISCOUNT_VALUE = 100

const FOLLOW_UP_OPTIONS: { id: number; label: string }[] = [1, 2, 3, 4].map(
    (num) => ({
        id: num,
        label: num.toString(),
    }),
)

const INACTIVE_AND_COOLDOWN_DAYS_OPTIONS: { id: number; label: string }[] = [
    30, 60, 90,
].map((num) => ({
    id: num,
    label: `${num} days`,
}))

const ORDER_STATUS_OPTIONS: OrderStatusOption[] = [
    { value: 'order_placed', label: 'Order Placed' },
    { value: 'order_fulfilled', label: 'Order Fulfilled' },
]

export const AIJourneySettings: React.FC = () => {
    const {
        aiJourneySettings,
        campaigns,
        currentJourney,
        flows,
        isLoadingJourneys,
        setAIJourneySettings,
        shopName,
        productList,
    } = useAIJourneyContext()

    const { emit } = useEvents()

    const {
        selectedProduct,
        totalFollowUp,
        includedAudienceListIds,
        includeDiscountCode,
        includeProductImage,
        outboundMessageInstructions,
        discountCodeMessageIdx,
        discountCodeValue,
        excludedAudienceListIds,
        inactiveDays,
        cooldownPeriod,
        targetOrderStatus,
        postPurchaseWaitInMinutes,
        waitTimeMinutes,
    } = aiJourneySettings

    const isCampaign = currentJourney?.type === JourneyTypeEnum.Campaign
    const isWinBack = currentJourney?.type === JourneyTypeEnum.WinBack
    const isPostPurchase = currentJourney?.type === JourneyTypeEnum.PostPurchase
    const isWelcome = currentJourney?.type === JourneyTypeEnum.Welcome

    const flowsOptions = flows.map((journey) => ({
        id: journey.id,
        label: getJourneyLabel(journey.type),
    }))

    const campaignsOptions = campaigns.map((campaign) => ({
        id: campaign.id,
        label: campaign.campaign!.title,
    }))

    const journeyOptions: Section[] = useMemo(() => {
        const options = []

        if (flowsOptions.length > 0) {
            options.push({
                id: 1,
                items: [...flowsOptions],
                name: 'Flows',
            })
        }

        if (campaignsOptions.length > 0) {
            options.push({
                id: 2,
                items: [...campaignsOptions],
                name: 'Campaigns',
            })
        }

        return options
    }, [campaignsOptions, flowsOptions])

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
        return [...flowsOptions, ...campaignsOptions].find(
            (option) => option.id === currentJourney?.id,
        )
    }, [flowsOptions, campaignsOptions, currentJourney])

    const selectedProductOption = useMemo(() => {
        return productOptions.find(
            (option) => selectedProduct && option.id === selectedProduct.id,
        )
    }, [productOptions, selectedProduct])

    useEffect(() => {
        emit(PlaygroundEvent.RESET_CONVERSATION)
    }, [selectedJourneyOption?.id, emit])

    const getProductById = useCallback(
        (id: number) => productList.find((product) => product.id === id),
        [productList],
    )

    const handleDiscountField = (value: string) => {
        if (value === '') {
            setAIJourneySettings({
                discountCodeValue: 0,
            })
            return
        }
        const numericValue = parseFloat(value)
        if (isNaN(numericValue)) return
        setAIJourneySettings({
            discountCodeValue:
                numericValue > MAX_DISCOUNT_VALUE
                    ? MAX_DISCOUNT_VALUE
                    : numericValue,
        })
    }

    const handlePostPurchaseWaitTimeField = (value: number) => {
        setAIJourneySettings({
            postPurchaseWaitInMinutes: value,
        })
    }

    const handleFollowUpChange = (
        value: (typeof FOLLOW_UP_OPTIONS)[number],
    ) => {
        setAIJourneySettings({
            totalFollowUp: value.id - 1,
            discountCodeMessageIdx:
                value.id < discountCodeMessageIdx
                    ? value.id
                    : discountCodeMessageIdx,
        })
    }

    const handleWelcomeWaitTimeField = (value: number) => {
        setAIJourneySettings({
            waitTimeMinutes: value,
        })
    }

    const shouldRenderImageToggle = !isCampaign && !isWelcome

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
                at least one flow or campaign before you can test outbound
                messages.
            </Banner>
        )
    }

    return (
        <>
            <SelectField<Section>
                //@ts-ignore
                onChange={(value: Entry) => {
                    setAIJourneySettings({
                        journeyId: value.id,
                    })
                }}
                items={journeyOptions}
                label="Campaign / Flow"
                maxHeight={300}
                isSearchable
                //@ts-ignore
                value={selectedJourneyOption as Section}
            >
                {(section: Section) => (
                    <ListSection
                        name={section.name}
                        items={section.items}
                        id={section.id}
                    >
                        {(item) => (
                            <ListItem key={item.id} label={item.label} />
                        )}
                    </ListSection>
                )}
            </SelectField>

            {!isCampaign && (
                <Select
                    data-name="select-field"
                    aria-label="Product"
                    trigger={({ selectedText, isOpen, ref }) => (
                        <SelectTrigger>
                            <TextField
                                inputRef={ref as RefObject<HTMLInputElement>}
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
            )}

            <span className={css.messageSettingsSeparator}>
                Message settings
            </span>
            {!isCampaign && (
                <div
                    className={classNames([
                        css.inputFieldWrapper,
                        css.followUpField,
                    ])}
                >
                    <SelectField
                        value={FOLLOW_UP_OPTIONS.find(
                            (option) => option.id === totalFollowUp + 1,
                        )}
                        onChange={handleFollowUpChange}
                        items={FOLLOW_UP_OPTIONS}
                        label="Total number of messages to send"
                    >
                        {(option: { id: number; label: string }) => (
                            <ListItem label={option.label} />
                        )}
                    </SelectField>
                </div>
            )}
            <div className={css.toggleFieldsContainer}>
                {shouldRenderImageToggle && (
                    <ToggleField
                        value={includeProductImage}
                        label="Include product image in first message"
                        onChange={(value) => {
                            setAIJourneySettings({
                                includeProductImage: value,
                            })
                        }}
                    />
                )}
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
                    value={
                        discountCodeValue ? discountCodeValue.toString() : '0'
                    }
                    onChange={handleDiscountField}
                    trailingSlot={<Button icon="percent" variant="tertiary" />}
                />
            </div>

            {!isCampaign && (
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
                        onChange={(value: any) => {
                            setAIJourneySettings({
                                discountCodeMessageIdx: value.id,
                            })
                        }}
                        items={FOLLOW_UP_OPTIONS.slice(
                            0,
                            totalFollowUp + 1,
                        ).map((option) => ({
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
            )}

            {isWinBack && (
                <>
                    <div
                        className={classNames([
                            css.inactiveDaysField,
                            css.inputFieldWrapper,
                        ])}
                    >
                        <SelectField
                            value={INACTIVE_AND_COOLDOWN_DAYS_OPTIONS.find(
                                (option) => option.id === inactiveDays,
                            )}
                            onChange={(value: any) => {
                                setAIJourneySettings({
                                    inactiveDays: value.id,
                                })
                            }}
                            items={INACTIVE_AND_COOLDOWN_DAYS_OPTIONS}
                            label="Inactive days"
                        >
                            {(option: { id: number; label: string }) => (
                                <ListItem label={option.label} />
                            )}
                        </SelectField>
                    </div>
                    <div
                        className={classNames([
                            css.cooldownPeriodField,
                            css.inputFieldWrapper,
                        ])}
                    >
                        <SelectField
                            value={INACTIVE_AND_COOLDOWN_DAYS_OPTIONS.find(
                                (option) => option.id === cooldownPeriod,
                            )}
                            onChange={(value: any) => {
                                setAIJourneySettings({
                                    cooldownPeriod: value.id,
                                })
                            }}
                            items={INACTIVE_AND_COOLDOWN_DAYS_OPTIONS}
                            label="Cooldown period"
                        >
                            {(option: { id: number; label: string }) => (
                                <ListItem label={option.label} />
                            )}
                        </SelectField>
                    </div>
                </>
            )}

            {isPostPurchase && (
                <>
                    <div
                        className={classNames([
                            css.triggerEventField,
                            css.inputFieldWrapper,
                        ])}
                    >
                        <SelectField
                            value={ORDER_STATUS_OPTIONS.map((opt) => ({
                                id: opt.value,
                                label: opt.label,
                            })).find(
                                (option) => option.id === targetOrderStatus,
                            )}
                            onChange={(value: {
                                id: string
                                label: string
                            }) => {
                                setAIJourneySettings({
                                    targetOrderStatus: value.id as OrderStatus,
                                })
                            }}
                            items={ORDER_STATUS_OPTIONS.map((opt) => ({
                                id: opt.value,
                                label: opt.label,
                            }))}
                            label="Trigger event"
                        >
                            {(option: { id: string; label: string }) => (
                                <ListItem label={option.label} />
                            )}
                        </SelectField>
                    </div>
                    <div
                        className={classNames([
                            css.postPurchaseWaitField,
                            css.inputFieldWrapper,
                        ])}
                    >
                        <NumberField
                            label="Wait time after trigger (in minutes)"
                            isInvalid={
                                postPurchaseWaitInMinutes !== undefined &&
                                postPurchaseWaitInMinutes > MAX_WAIT_TIME
                            }
                            minValue={0}
                            value={postPurchaseWaitInMinutes}
                            onChange={handlePostPurchaseWaitTimeField}
                            error={
                                postPurchaseWaitInMinutes !== undefined &&
                                postPurchaseWaitInMinutes > MAX_WAIT_TIME
                                    ? `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`
                                    : undefined
                            }
                        />
                    </div>
                </>
            )}

            {isWelcome && (
                <div
                    className={classNames([
                        css.welcomeWaitField,
                        css.inputFieldWrapper,
                    ])}
                >
                    <NumberField
                        label="Wait time before trigger (in minutes)"
                        isInvalid={
                            waitTimeMinutes !== undefined &&
                            waitTimeMinutes > MAX_WAIT_TIME
                        }
                        minValue={0}
                        value={waitTimeMinutes}
                        onChange={handleWelcomeWaitTimeField}
                        error={
                            waitTimeMinutes !== undefined &&
                            waitTimeMinutes > MAX_WAIT_TIME
                                ? `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`
                                : undefined
                        }
                    />
                </div>
            )}

            {isCampaign && (
                <div className={css.audiencesContainer}>
                    <AudienceSelect
                        label="Audience to include"
                        value={includedAudienceListIds ?? []}
                        exclude={excludedAudienceListIds ?? []}
                        onChange={(value: string[]) => {
                            setAIJourneySettings({
                                includedAudienceListIds: value,
                            })
                        }}
                        required
                    />
                    <AudienceSelect
                        label="Audience to exclude"
                        value={excludedAudienceListIds ?? []}
                        exclude={includedAudienceListIds ?? []}
                        onChange={(value: string[]) => {
                            setAIJourneySettings({
                                excludedAudienceListIds: value,
                            })
                        }}
                    />
                </div>
            )}

            {isWelcome && (
                <ToggleField
                    value={aiJourneySettings.returningCustomer}
                    onChange={(value: boolean) => {
                        setAIJourneySettings({ returningCustomer: value })
                    }}
                    label="Returning customer"
                />
            )}

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
