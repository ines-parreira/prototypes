import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    Heading,
    Icon,
    Image,
    Loader,
    Text,
} from '@gorgias/axiom'

import AiAgentLogoWhite from 'assets/img/ai-agent/ai-agent-logo-white.svg'
import AiAgentLogo from 'assets/img/ai-agent/ai-agent-logo.svg'
import SalesStrategyImage from 'assets/img/ai-agent/ai-agent_paywall_sales-strategy.png'
import { useTheme } from 'core/theme'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { JtbdPicker } from 'pages/aiAgent/components/JtbdPicker/JtbdPicker'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useNotifyAdmins } from 'pages/aiAgent/trial/hooks/useNotifyAdmins'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import {
    EXTERNAL_URLS,
    useTrialModalProps,
} from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import type { JtbdValue } from 'pages/aiAgent/utils/jtbd'
import { JTBD_QUERY_KEY } from 'pages/aiAgent/utils/jtbd'
import { hasAutomatePlanAboveGen6 } from 'pages/aiAgent/utils/trial.utils'
import { AutomateSubscriptionModal } from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import { assetsUrl } from 'utils'

import { useAiAgentCtas } from './useAiAgentPaywallCta'
import { useAiAgentWelcomePageV3SideEffects } from './useAiAgentWelcomePageV3SideEffects'

const SUPPORT_VIDEO_SRC = assetsUrl('/video/ai-agent_paywall_support.mp4')

const DESCRIPTIONS = [
    'Define how it responds to specific topics',
    'Test and refine conversations',
    'Preview the shopper experience before going live',
]

const PREVIEW_OPTION = {
    Support: 'support',
    Sales: 'sales',
} as const
type PreviewOption = (typeof PREVIEW_OPTION)[keyof typeof PREVIEW_OPTION]

type Props = {
    accountDomain: string
    shopType: string
    shopName: string
    storeConfiguration?: StoreConfiguration
}

export const AIAgentWelcomePageViewV3 = (props: Props) => {
    const trialAccess = useTrialAccess(props.shopName)

    if (trialAccess.isLoading || trialAccess.isOnboarded === undefined) {
        return (
            <Box
                alignItems="center"
                justifyContent="center"
                width="100%"
                height="100%"
            >
                <Loader size="sm" aria-label="Loading" />
            </Box>
        )
    }

    return <AIAgentWelcomePageViewV3Body {...props} />
}

const AIAgentWelcomePageViewV3Body = (props: Props) => {
    const trialAccess = useTrialAccess(props.shopName)

    const trialModalProps = useTrialModalProps({
        storeName: props.shopName,
    })

    const { storeActivations } = useStoreActivations({
        storeName: props.shopName,
        withChatIntegrationsStatus: true,
        withStoresKnowledgeStatus: true,
    })

    const trialFlow = useShoppingAssistantTrialFlow({
        accountDomain: props.accountDomain,
        storeActivations,
        trialType: trialAccess.trialType,
    })

    const { onCtaTransition, isOnUpdateOnboardingWizard } =
        useAiAgentWelcomePageV3SideEffects({
            shopName: props.shopName,
            storeConfiguration: props.storeConfiguration,
            isTrialFinishSetupModalOpen: trialFlow.isTrialFinishSetupModalOpen,
        })

    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const [showJtbdPicker, setShowJtbdPicker] = useState(false)

    const { isDisabled: isNotifyAdminDisabled } = useNotifyAdmins(
        props.shopName,
        trialAccess.trialType,
    )

    const isAiAgentTrial = trialAccess.trialType === TrialType.AiAgent
    const hasAutomate = !!trialAccess.currentAutomatePlan
    const canStartOnboarding =
        (trialAccess.hasCurrentStoreTrialExpired ||
            trialAccess.isTrialingSubscription ||
            hasAutomatePlanAboveGen6(trialAccess.currentAutomatePlan)) &&
        !trialAccess.isOnboarded

    const isDuringOrAfterTrial =
        trialAccess.hasCurrentStoreTrialStarted ||
        trialAccess.hasCurrentStoreTrialExpired ||
        trialAccess.hasCurrentStoreTrialOptedOut

    const learnMoreUrl = isAiAgentTrial
        ? EXTERNAL_URLS.AI_AGENT_TRIAL_LEARN_MORE_PAYWALL
        : EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE_PAYWALL

    const onOpenWizard = useCallback(() => {
        setShowJtbdPicker(true)
    }, [])

    const onJtbdSelect = useCallback(
        (jtbd: JtbdValue) => {
            onCtaTransition({ [JTBD_QUERY_KEY]: jtbd })
        },
        [onCtaTransition],
    )

    const { ctas, modals } = useAiAgentCtas({
        canStartOnboarding,
        hasAutomate,
        isDuringOrAfterTrial,
        canBookDemo: trialAccess.canBookDemo,
        canNotifyAdmin: trialAccess.canNotifyAdmin,
        canSeeTrial: trialAccess.canSeeTrialCTA,
        canSeeSubscribeNow: trialAccess.canSeeSubscribeNowCTA,
        isAdmin: trialAccess.isAdminUser,
        learnMoreUrl,
        isOnboarded: !!trialAccess.isOnboarded,
        onOpenWizard,
        onOpenSubscribeModal: () => setIsAutomationModalOpened(true),
        onOpenTrialRequestModal: trialFlow.openTrialRequestModal,
        onOpenUpgradePlanModal: trialFlow.openUpgradePlanModal,
        onCloseTrialRequestModal: trialFlow.closeTrialRequestModal,
        onCloseTrialFinishSetupModal: trialFlow.closeTrialFinishSetupModal,
        isNotifyAdminDisabled,
        trialModals: {
            isTrialRequestModalOpen: trialFlow.isTrialRequestModalOpen,
            trialRequestModal: trialModalProps.trialRequestModal,
            isTrialFinishSetupModalOpen: trialFlow.isTrialFinishSetupModalOpen,
            trialFinishSetupModal: trialModalProps.trialFinishSetupModal,
        },
        isOnUpdateOnboardingWizard,
    })

    return (
        <>
            <Box flexDirection="row" width="100%" height="100%">
                <PaywallInfo
                    showJtbdPicker={showJtbdPicker}
                    onJtbdSelect={onJtbdSelect}
                    ctas={ctas}
                />
                <PaywallPreview />
            </Box>
            {modals}
            <AutomateSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationModalOpened}
                onClose={() => setIsAutomationModalOpened(false)}
            />
        </>
    )
}

type PaywallInfoProps = {
    showJtbdPicker: boolean
    onJtbdSelect: (jtbd: JtbdValue) => void
    ctas: ReactNode
}

export const PaywallInfo = ({
    showJtbdPicker,
    onJtbdSelect,
    ctas,
}: PaywallInfoProps) => {
    const theme = useTheme()
    const isDarkTheme = theme.resolvedName === 'dark'
    const logoSrc = isDarkTheme ? AiAgentLogoWhite : AiAgentLogo

    return (
        <Box
            as="section"
            alignItems="center"
            justifyContent="center"
            paddingLeft="xxxl"
            paddingRight="xl"
            flex={1}
            maxWidth={576}
        >
            <Box flexDirection="column" gap="lg" width="100%">
                <Image
                    alt="AI Agent Logo"
                    src={logoSrc}
                    width={170}
                    fallback="AI Agent Logo"
                />
                {showJtbdPicker ? (
                    <JtbdPicker onSelect={onJtbdSelect} />
                ) : (
                    <>
                        <Box flexDirection="column" gap="md">
                            <Heading size="xxl">
                                Help shoppers browse, buy, and get support —
                                24/7
                            </Heading>
                            <Text color="content-neutral-secondary">
                                Set up AI Agent with confidence:
                            </Text>
                            <Box flexDirection="column" gap="xxxs">
                                {DESCRIPTIONS.map((description) => (
                                    <Box
                                        key={description}
                                        flexDirection="row"
                                        gap="xs"
                                        alignItems="center"
                                    >
                                        <Icon
                                            name="check"
                                            color="border-success-default"
                                        />
                                        <Text color="content-neutral-secondary">
                                            {description}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                        <Box flexDirection="column" gap="md">
                            {ctas}
                            <Text
                                size="sm"
                                variant="italic"
                                color="content-neutral-secondary"
                            >
                                Your 2-week trial starts only when AI Agent goes
                                live for shoppers.
                            </Text>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    )
}

export const PaywallPreview = () => {
    const [preview, setPreview] = useState<PreviewOption>(
        PREVIEW_OPTION.Support,
    )

    return (
        <Box
            as="section"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            paddingLeft="xxxl"
            paddingRight="xxxl"
            gap="lg"
            flex={1}
        >
            <Box flexDirection="column" alignItems="center" gap="sm">
                <Text size="xs" color="content-neutral-secondary">
                    AI Agent can handle:
                </Text>
                <ButtonGroup
                    selectedKey={preview}
                    onSelectionChange={(key) =>
                        setPreview(key as PreviewOption)
                    }
                >
                    <ButtonGroupItem id={PREVIEW_OPTION.Support}>
                        Support
                    </ButtonGroupItem>
                    <ButtonGroupItem id={PREVIEW_OPTION.Sales}>
                        Sales
                    </ButtonGroupItem>
                </ButtonGroup>
            </Box>
            <Box width="100%" maxWidth={640} height={544}>
                {preview === PREVIEW_OPTION.Support ? (
                    <video
                        autoPlay
                        muted
                        playsInline
                        loop
                        src={SUPPORT_VIDEO_SRC}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block',
                        }}
                    />
                ) : (
                    <Image
                        src={SalesStrategyImage}
                        alt="Sales preview"
                        fallback="Sales preview"
                        fit="contain"
                        width="100%"
                        height="100%"
                    />
                )}
            </Box>
        </Box>
    )
}
