import type { ReactNode } from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import type {
    CampaignJourneyConfigurationApiDTO,
    JourneyApiDTO,
    JourneyConfigurationApiDTO,
    JourneyDetailApiDTO,
    PostPurchaseJourneyConfigurationApiDTO,
    WelcomeFlowConfigurationApiDTO,
    WinbackJourneyConfigurationApiDTO,
} from '@gorgias/convert-client'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import { MAX_WAIT_TIME } from 'AIJourney/constants'
import { useAIJourneyProductList } from 'AIJourney/hooks'
import {
    useJourneyData,
    useJourneys,
    useUpdateJourney,
} from 'AIJourney/queries'
import type { Product } from 'constants/integrations/types/shopify'
import useAppSelector from 'hooks/useAppSelector'
import { useSubscribeToEvent } from 'pages/aiAgent/PlaygroundV2/contexts/EventsContext'
import type { AIJourneySettings } from 'pages/aiAgent/PlaygroundV2/types'
import { PlaygroundEvent } from 'pages/aiAgent/PlaygroundV2/types'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

export const AI_JOURNEY_DEFAULT_STATE: AIJourneySettings = {
    journeyId: '',
    selectedProduct: null,
    totalFollowUp: 1,
    includedAudienceListIds: [],
    includeProductImage: true,
    includeDiscountCode: true,
    discountCodeValue: 0,
    discountCodeMessageIdx: 1,
    excludedAudienceListIds: [],
    outboundMessageInstructions: '',
    inactiveDays: 30,
    cooldownPeriod: 30,
    targetOrderStatus: 'order_placed',
    postPurchaseWaitInMinutes: 1,
    waitTimeMinutes: 1,
    mediaUrls: undefined,
    returningCustomer: false,
}

const journeySettingsMapper = {
    totalFollowUp: 'max_follow_up_messages',
    includeProductImage: 'include_image',
    includeDiscountCode: 'offer_discount',
    discountCodeValue: 'max_discount_percent',
    discountCodeMessageIdx: 'discount_code_message_threshold',
    includedAudienceListIds: 'included_audience_list_ids',
    excludedAudienceListIds: 'excluded_audience_list_ids',
    inactiveDays: 'inactive_days',
    cooldownPeriod: 'cooldown_days',
    targetOrderStatus: 'target_order_status',
    postPurchaseWaitInMinutes: 'post_purchase_wait_minutes',
    waitTimeMinutes: 'wait_time_minutes',
    mediaUrls: 'media_urls',
} as const

function buildJourneyConfig(
    state: AIJourneySettings,
):
    | JourneyConfigurationApiDTO
    | WinbackJourneyConfigurationApiDTO
    | PostPurchaseJourneyConfigurationApiDTO
    | WelcomeFlowConfigurationApiDTO {
    return {
        [journeySettingsMapper.totalFollowUp]: state.totalFollowUp,
        [journeySettingsMapper.includeProductImage]: state.includeProductImage,
        [journeySettingsMapper.includeDiscountCode]: state.includeDiscountCode,
        [journeySettingsMapper.discountCodeValue]: state.discountCodeValue,
        [journeySettingsMapper.discountCodeMessageIdx]:
            state.discountCodeMessageIdx,
        [journeySettingsMapper.inactiveDays]: state.inactiveDays,
        [journeySettingsMapper.cooldownPeriod]: state.cooldownPeriod,
        [journeySettingsMapper.targetOrderStatus]: state.targetOrderStatus,
        [journeySettingsMapper.postPurchaseWaitInMinutes]:
            state.postPurchaseWaitInMinutes,
        [journeySettingsMapper.waitTimeMinutes]: state.waitTimeMinutes,
    }
}

function parseJourneyConfig(
    journeyData: JourneyDetailApiDTO,
): Partial<AIJourneySettings> {
    const { configuration: config } = journeyData
    // treat win-back specific configurations
    const winbackConfig =
        journeyData.type === JourneyTypeEnum.WinBack
            ? (config as WinbackJourneyConfigurationApiDTO)
            : null

    // treat post purchase specific configurations
    const postPurchaseConfig =
        journeyData.type === JourneyTypeEnum.PostPurchase
            ? (config as PostPurchaseJourneyConfigurationApiDTO)
            : null

    // treat welcome specific configurations
    const welcomeConfig =
        journeyData.type === JourneyTypeEnum.Welcome
            ? (config as WelcomeFlowConfigurationApiDTO)
            : null

    // treat campaigns specific configurations
    const campaignConfig =
        journeyData.type === JourneyTypeEnum.Campaign
            ? (config as CampaignJourneyConfigurationApiDTO)
            : null

    return {
        totalFollowUp: config[journeySettingsMapper.totalFollowUp] ?? undefined,
        includeProductImage: config[journeySettingsMapper.includeProductImage],
        includeDiscountCode: config[journeySettingsMapper.includeDiscountCode],
        discountCodeValue:
            config[journeySettingsMapper.discountCodeValue] ?? undefined,
        discountCodeMessageIdx:
            config[journeySettingsMapper.discountCodeMessageIdx] ?? undefined,
        includedAudienceListIds:
            journeyData[journeySettingsMapper.includedAudienceListIds] ??
            undefined,
        excludedAudienceListIds:
            journeyData[journeySettingsMapper.excludedAudienceListIds] ??
            undefined,
        inactiveDays:
            winbackConfig?.[journeySettingsMapper.inactiveDays] ?? undefined,
        cooldownPeriod:
            winbackConfig?.[journeySettingsMapper.cooldownPeriod] ?? undefined,
        targetOrderStatus:
            postPurchaseConfig?.[journeySettingsMapper.targetOrderStatus] ??
            undefined,
        postPurchaseWaitInMinutes:
            postPurchaseConfig?.[
                journeySettingsMapper.postPurchaseWaitInMinutes
            ] ?? undefined,
        waitTimeMinutes:
            welcomeConfig?.[journeySettingsMapper.waitTimeMinutes] ?? undefined,
        mediaUrls:
            campaignConfig?.[journeySettingsMapper.mediaUrls] ?? undefined,
    }
}

type AIJourneyContextValue = {
    shopifyIntegration:
        | ReturnType<typeof getShopifyIntegrationsSortedByName>[number]
        | undefined
    flows: JourneyApiDTO[]
    campaigns: JourneyApiDTO[]
    shopName: string
    isLoadingJourneys: boolean
    aiJourneySettings: AIJourneySettings
    setAIJourneySettings: (settings: Partial<AIJourneySettings>) => void
    resetAIJourneySettings: () => void
    saveAIJourneySettings: () => Promise<void>
    isLoadingJourneyData: boolean
    isSavingJourneyData: boolean
    followUpMessagesSent: number
    setFollowUpMessagesSent: React.Dispatch<React.SetStateAction<number>>
    currentJourney: JourneyApiDTO | undefined
    journeyConfiguration: JourneyConfigurationApiDTO | undefined
    productList: Product[]
    isLoadingProducts: boolean
    hasInvalidFields: boolean
}

const AIJourneyContext = createContext<AIJourneyContextValue | undefined>(
    undefined,
)

export const useAIJourneyContext = () => {
    const context = useContext(AIJourneyContext)
    if (!context) {
        throw new Error(
            'useAIJourneyContext must be used within AIJourneyProvider',
        )
    }
    return context
}

type AIJourneyProviderProps = {
    children: ReactNode
    shopName: string
}

const WrappedAIJourneyProvider = ({
    children,
    shopName,
}: AIJourneyProviderProps) => {
    const shopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )

    const shopifyIntegration = useMemo(
        () =>
            shopifyIntegrations.find(
                (integration) => integration.name === shopName,
            ),
        [shopifyIntegrations, shopName],
    )

    const { data: aggregatedJourneys, isLoading: areJourneysLoading } =
        useJourneys(shopifyIntegration?.id, [], {
            enabled: !!shopifyIntegration?.id,
        })

    const flows = aggregatedJourneys?.filter(
        (f) => f.type !== JourneyTypeEnum.Campaign,
    )

    const campaigns = aggregatedJourneys?.filter(
        (c) => c.type === JourneyTypeEnum.Campaign,
    )

    const [localSettings, setLocalSettings] = useState<
        Partial<AIJourneySettings>
    >({})

    const { productList, isLoading: isLoadingProducts } =
        useAIJourneyProductList({
            integrationId: shopifyIntegration?.id,
        })

    useEffect(() => {
        if (
            flows &&
            flows.length > 0 &&
            !localSettings.journeyId &&
            !areJourneysLoading
        ) {
            const filteredFlows = flows.filter(
                (f) =>
                    [
                        JourneyTypeEnum.CartAbandoned.toString(),
                        JourneyTypeEnum.Campaign.toString(),
                        JourneyTypeEnum.SessionAbandoned.toString(),
                        JourneyTypeEnum.PostPurchase.toString(),
                    ].indexOf(f.type) > -1,
            )
            if (filteredFlows.length > 0) {
                setLocalSettings((prev) => ({
                    ...prev,
                    journeyId: filteredFlows[0].id,
                }))
            }
        } else if (
            campaigns &&
            campaigns.length > 0 &&
            !localSettings.journeyId &&
            !areJourneysLoading
        ) {
            setLocalSettings((prev) => ({
                ...prev,
                journeyId: campaigns[0].id,
            }))
        }
    }, [flows, campaigns, localSettings.journeyId, areJourneysLoading])

    useEffect(() => {
        if (
            productList.length > 0 &&
            !localSettings.selectedProduct &&
            !isLoadingProducts
        ) {
            setLocalSettings((prev) => ({
                ...prev,
                selectedProduct: productList[0],
            }))
        }
    }, [productList, localSettings.selectedProduct, isLoadingProducts])

    const currentJourney = useMemo(
        () =>
            aggregatedJourneys?.find(
                (j: JourneyApiDTO) => j.id === localSettings.journeyId,
            ),
        [localSettings.journeyId, aggregatedJourneys],
    )

    const { data: journeyData, isLoading: isLoadingJourneyData } =
        useJourneyData(currentJourney?.id, {
            enabled:
                currentJourney && !!shopifyIntegration && !!currentJourney?.id,
        })

    const [followUpMessagesSent, setFollowUpMessagesSent] = useState<number>(0)

    const parsedJourneySettings = useMemo(() => {
        if (!journeyData) {
            return {}
        }

        const { configuration } = journeyData

        const configSettings =
            journeyData && configuration ? parseJourneyConfig(journeyData) : {}

        return {
            ...configSettings,
            ...(journeyData.message_instructions && {
                outboundMessageInstructions: journeyData.message_instructions,
            }),
        }
    }, [journeyData])

    const journeyConfiguration = useMemo(() => {
        return journeyData?.configuration
    }, [journeyData])

    const aiJourneySettings = useMemo<AIJourneySettings>(() => {
        return {
            ...AI_JOURNEY_DEFAULT_STATE,
            ...parsedJourneySettings,
            ...localSettings,
        }
    }, [parsedJourneySettings, localSettings])

    const { mutateAsync, isLoading: isSavingJourneyData } = useUpdateJourney()

    const resetAIJourneySettings = useCallback(() => {
        setLocalSettings({})
    }, [])

    const saveAIJourneySettings = useCallback(async () => {
        if (currentJourney) {
            const journeyConfigs = buildJourneyConfig(aiJourneySettings)

            await mutateAsync({
                params: {
                    state: currentJourney.state,
                    message_instructions:
                        aiJourneySettings.outboundMessageInstructions,
                    included_audience_list_ids:
                        aiJourneySettings.includedAudienceListIds,
                    excluded_audience_list_ids:
                        aiJourneySettings.excludedAudienceListIds,
                },
                journeyId: currentJourney.id,
                journeyConfigs,
            })
        }
    }, [currentJourney, mutateAsync, aiJourneySettings])

    const setAIJourneySettings = useCallback(
        (newSettings: Partial<AIJourneySettings>) => {
            setLocalSettings((prev) => ({
                ...prev,
                ...newSettings,
            }))
        },
        [],
    )

    const resetFollowUpMessagesSent = useCallback(() => {
        setFollowUpMessagesSent(0)
    }, [])

    useSubscribeToEvent(
        PlaygroundEvent.RESET_CONVERSATION,
        resetFollowUpMessagesSent,
    )

    const hasInvalidFields = useMemo(() => {
        const isPostPurchase =
            currentJourney?.type === JourneyTypeEnum.PostPurchase
        const isWelcome = currentJourney?.type === JourneyTypeEnum.Welcome

        if (!isPostPurchase && !isWelcome) {
            return false
        }

        if (isPostPurchase) {
            if (
                aiJourneySettings.postPurchaseWaitInMinutes === undefined ||
                isNaN(aiJourneySettings.postPurchaseWaitInMinutes)
            )
                return true
            return aiJourneySettings.postPurchaseWaitInMinutes > MAX_WAIT_TIME
        } else if (isWelcome) {
            if (
                aiJourneySettings.waitTimeMinutes === undefined ||
                isNaN(aiJourneySettings.waitTimeMinutes)
            )
                return true
            return aiJourneySettings.waitTimeMinutes > MAX_WAIT_TIME
        }
        return false
    }, [
        currentJourney?.type,
        aiJourneySettings.postPurchaseWaitInMinutes,
        aiJourneySettings.waitTimeMinutes,
    ])

    const contextValue = useMemo(
        () => ({
            shopifyIntegration,
            flows: flows || [],
            campaigns: campaigns || [],
            shopName,
            isLoadingJourneys: shopifyIntegration?.id
                ? areJourneysLoading
                : false,
            aiJourneySettings,
            setAIJourneySettings,
            resetAIJourneySettings,
            saveAIJourneySettings,
            isLoadingJourneyData,
            isSavingJourneyData,
            followUpMessagesSent,
            setFollowUpMessagesSent,
            currentJourney,
            journeyConfiguration,
            productList,
            isLoadingProducts,
            hasInvalidFields,
        }),
        [
            shopifyIntegration,
            flows,
            campaigns,
            shopName,
            areJourneysLoading,
            aiJourneySettings,
            setAIJourneySettings,
            resetAIJourneySettings,
            saveAIJourneySettings,
            isLoadingJourneyData,
            isSavingJourneyData,
            followUpMessagesSent,
            setFollowUpMessagesSent,
            currentJourney,
            journeyConfiguration,
            productList,
            isLoadingProducts,
            hasInvalidFields,
        ],
    )

    return (
        <AIJourneyContext.Provider value={contextValue}>
            {children}
        </AIJourneyContext.Provider>
    )
}

export const AIJourneyProvider = ({
    children,
    ...props
}: AIJourneyProviderProps) => {
    return (
        <WrappedAIJourneyProvider {...props}>
            {children}
        </WrappedAIJourneyProvider>
    )
}
