import { useCallback, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory } from 'react-router-dom'

import {
    Box,
    Button,
    ButtonGroup,
    ButtonGroupItem,
    Heading,
    Icon,
    Image,
    Text,
} from '@gorgias/axiom'

import AiAgentLogoWhite from 'assets/img/ai-agent/ai-agent-logo-white.svg'
import AiAgentLogo from 'assets/img/ai-agent/ai-agent-logo.svg'
import SalesStrategyImage from 'assets/img/ai-agent/ai-agent_paywall_sales-strategy.png'
import { useTheme } from 'core/theme'
import { JtbdPicker } from 'pages/aiAgent/components/JtbdPicker/JtbdPicker'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import type { JtbdValue } from 'pages/aiAgent/utils/jtbd'
import { JTBD_QUERY_KEY } from 'pages/aiAgent/utils/jtbd'
import { assetsUrl } from 'utils'

const DESCRIPTIONS = [
    'Define how it responds to specific topics',
    'Test and refine conversations',
    'Preview the shopper experience before going live',
]

const SUPPORT_VIDEO_SRC = assetsUrl('/video/ai-agent_paywall_support.mp4')

const PREVIEW_OPTION = {
    Support: 'support',
    Sales: 'sales',
} as const
type PreviewOption = (typeof PREVIEW_OPTION)[keyof typeof PREVIEW_OPTION]

type Props = {
    shopName: string | undefined
}

export const V3AdminPaywall = ({ shopName }: Props) => {
    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomatePaywallVisited, {
            location: AIAgentPaywallFeatures.TrialSetup,
        })
    })

    return (
        <>
            <PaywallInfo shopName={shopName} />
            <PaywallPreview />
        </>
    )
}

const PaywallInfo = ({ shopName }: Props) => {
    const history = useHistory()
    const aiAgentNavigation = useAiAgentNavigation({ shopName: shopName ?? '' })

    const theme = useTheme()
    const isDarkTheme = theme.resolvedName === 'dark'
    const logoSrc = isDarkTheme ? AiAgentLogoWhite : AiAgentLogo

    const [showPicker, setShowPicker] = useState(false)

    const onStartSetup = useCallback(() => {
        setShowPicker(true)
    }, [])

    const onJtbdSelect = useCallback(
        (jtbd: JtbdValue) => {
            const path = shopName
                ? aiAgentNavigation.routes.onboardingWizardStep(
                      WizardStepEnum.TONE_OF_VOICE,
                  )
                : `/app/ai-agent/onboarding/${WizardStepEnum.TONE_OF_VOICE}`

            history.push({
                pathname: path,
                search: `?${JTBD_QUERY_KEY}=${jtbd}`,
            })
        },
        [history, aiAgentNavigation.routes, shopName],
    )

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
                {showPicker ? (
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
                            <Box>
                                <Button
                                    trailingSlot={<Icon name="arrow-right" />}
                                    onClick={onStartSetup}
                                >
                                    Start setup
                                </Button>
                            </Box>
                            <Text
                                variant="italic"
                                size="xs"
                                color="content-neutral-tertiary"
                            >
                                Set up and test for free. Your 2-week trial
                                starts only when AI Agent goes live for
                                shoppers.
                            </Text>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    )
}

const PaywallPreview = () => {
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
            <Box maxWidth={640}>
                {preview === PREVIEW_OPTION.Support ? (
                    <video
                        autoPlay
                        muted
                        playsInline
                        loop
                        src={SUPPORT_VIDEO_SRC}
                    />
                ) : (
                    <Image
                        src={SalesStrategyImage}
                        alt="Sales preview"
                        fallback="Sales preview"
                    />
                )}
            </Box>
        </Box>
    )
}
