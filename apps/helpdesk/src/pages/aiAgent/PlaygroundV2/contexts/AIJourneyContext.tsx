import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'

import {
    JourneyApiDTO,
    JourneyConfigurationApiDTO,
    JourneyTypeEnum,
} from '@gorgias/convert-client'

import {
    useJourneyData,
    useJourneys,
    useUpdateJourney,
} from 'AIJourney/queries'
import useAppSelector from 'hooks/useAppSelector'
import { AIJourneySettings } from 'pages/aiAgent/PlaygroundV2/types'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

export const AI_JOURNEY_DEFAULT_STATE: AIJourneySettings = {
    journeyType: JourneyTypeEnum.CartAbandoned,
    selectedProduct: null,
    totalFollowUp: 1,
    includeProductImage: true,
    includeDiscountCode: true,
    discountCodeValue: 10,
    discountCodeMessageIdx: 1,
    outboundMessageInstructions: '',
}

const journeySettingsMapper = {
    totalFollowUp: 'max_follow_up_messages',
    includeProductImage: 'include_image',
    includeDiscountCode: 'offer_discount',
    discountCodeValue: 'max_discount_percent',
    discountCodeMessageIdx: 'discount_code_message_threshold',
} as const

function buildJourneyConfig(
    state: AIJourneySettings,
): JourneyConfigurationApiDTO {
    return {
        [journeySettingsMapper.totalFollowUp]: state.totalFollowUp,
        [journeySettingsMapper.includeProductImage]: state.includeProductImage,
        [journeySettingsMapper.includeDiscountCode]: state.includeDiscountCode,
        [journeySettingsMapper.discountCodeValue]: state.discountCodeValue,
        [journeySettingsMapper.discountCodeMessageIdx]:
            state.discountCodeMessageIdx,
    }
}

function parseJourneyConfig(
    config: JourneyConfigurationApiDTO,
): Partial<AIJourneySettings> {
    return {
        totalFollowUp: config[journeySettingsMapper.totalFollowUp] ?? undefined,
        includeProductImage: config[journeySettingsMapper.includeProductImage],
        includeDiscountCode: config[journeySettingsMapper.includeDiscountCode],
        discountCodeValue:
            config[journeySettingsMapper.discountCodeValue] ?? undefined,
        discountCodeMessageIdx:
            config[journeySettingsMapper.discountCodeMessageIdx] ?? undefined,
    }
}

type AIJourneyContextValue = {
    shopifyIntegration: number | undefined
    journeys: JourneyApiDTO[]
    shopName: string
    isLoadingJourneys: boolean
    aiJourneySettings: AIJourneySettings
    setAIJourneySettings: (settings: Partial<AIJourneySettings>) => void
    resetAIJourneySettings: () => void
    saveAIJourneySettings: () => Promise<void>
    isLoadingJourneyData: boolean
    isSavingJourneyData: boolean
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

export const AIJourneyProvider = ({
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
            )?.id,
        [shopifyIntegrations, shopName],
    )

    const { data: journeys, isLoading: areJourneysLoading } = useJourneys(
        shopifyIntegration,
        [JourneyTypeEnum.CartAbandoned, JourneyTypeEnum.SessionAbandoned],
        {
            enabled: !!shopifyIntegration,
        },
    )

    const [localSettings, setLocalSettings] = useState<
        Partial<AIJourneySettings>
    >({})

    const currentJourney = useMemo(
        () =>
            journeys?.find(
                (j: JourneyApiDTO) =>
                    j.type === localSettings.journeyType?.replace('-', '_'),
            ),
        [localSettings.journeyType, journeys],
    )

    const { data: journeyData, isLoading: isLoadingJourneyData } =
        useJourneyData(currentJourney?.id, {
            enabled:
                currentJourney && !!shopifyIntegration && !!currentJourney?.id,
        })

    const journeyConfiguration = useMemo(() => {
        if (!journeyData) {
            return {}
        }

        const configSettings = journeyData.configuration
            ? parseJourneyConfig(journeyData.configuration)
            : {}

        return {
            ...configSettings,
            ...(journeyData.message_instructions && {
                outboundMessageInstructions: journeyData.message_instructions,
            }),
        }
    }, [journeyData])

    const aiJourneySettings = useMemo<AIJourneySettings>(() => {
        return {
            ...AI_JOURNEY_DEFAULT_STATE,
            ...journeyConfiguration,
            ...localSettings,
        }
    }, [journeyConfiguration, localSettings])

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

    const contextValue = useMemo(
        () => ({
            shopifyIntegration,
            journeys: journeys || [],
            shopName,
            isLoadingJourneys: areJourneysLoading,
            aiJourneySettings,
            setAIJourneySettings,
            resetAIJourneySettings,
            saveAIJourneySettings,
            isLoadingJourneyData,
            isSavingJourneyData,
        }),
        [
            shopifyIntegration,
            journeys,
            shopName,
            areJourneysLoading,
            aiJourneySettings,
            setAIJourneySettings,
            resetAIJourneySettings,
            saveAIJourneySettings,
            isLoadingJourneyData,
            isSavingJourneyData,
        ],
    )

    return (
        <AIJourneyContext.Provider value={contextValue}>
            {children}
        </AIJourneyContext.Provider>
    )
}
