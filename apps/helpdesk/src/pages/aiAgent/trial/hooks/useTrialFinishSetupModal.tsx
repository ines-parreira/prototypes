import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import type { TrialFinishSetupModalProps } from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

const ENGAGEMENT_TOOLS = {
    icon: '',
    title: 'Turn on customer engagement tools',
    description:
        'Proactively engage with visitors and instantly drive meaningful conversations.',
    benefit: 'Brands that enable this see 15% more sales',
}

const DISCOUNT_STRATEGY = {
    icon: '',
    title: 'Set up discount strategy',
    description: 'Offer smart discounts to maximize conversions.',
    benefit: 'Reduce cart abandonment with timely offers',
}

export const TEXTS = {
    [TrialType.ShoppingAssistant]: {
        onboarded: {
            features: [
                {
                    icon: 'check',
                    title: 'Shopping Assistant features are now live!',
                    description:
                        'All features are unlocked, so you can start seeing impact today.',
                    isCompleted: true,
                },
                ENGAGEMENT_TOOLS,
                DISCOUNT_STRATEGY,
            ],
            content:
                'Just two simple steps to increase conversions and make the most of your trial.',
            ctaLabel: 'Finish setup',
        },
        'not-onboarded': {
            features: [
                {
                    icon: '',
                    title: 'Select and configure channels',
                    description:
                        "Select the channels you want to use, so your AI Agent is ready to respond to customers when you're ready to launch it.",
                },
                ENGAGEMENT_TOOLS,
                DISCOUNT_STRATEGY,
            ],
            content:
                'Get started in just a few simple steps and make the most of your trial. Don’t worry, you can adjust everything anytime in settings.',
            ctaLabel: 'Get Started',
        },
    },
    [TrialType.AiAgent]: {
        features: [
            {
                icon: '',
                title: 'Select and configure channels',
                description:
                    "Select the channels you want to use, so your AI Agent is ready to respond to customers when you're ready to launch it.",
            },
            ENGAGEMENT_TOOLS,
            DISCOUNT_STRATEGY,
        ],
        content:
            'Get started in just a few simple steps and make the most of your trial. Don’t worry, you can adjust everything anytime in settings.',
        ctaLabel: 'Get Started',
    },
}

export type UseTrialFinishSetupModalProps = {
    trialType: TrialType
    isOnboarded: boolean | undefined
    storeName?: string
}

export type UseTrialFinishSetupModalReturn = Pick<
    TrialFinishSetupModalProps,
    | 'title'
    | 'subtitle'
    | 'content'
    | 'primaryAction'
    | 'isOpen'
    | 'onClose'
    | 'features'
>

export const useTrialFinishSetupModal = ({
    trialType,
    isOnboarded,
    storeName,
}: UseTrialFinishSetupModalProps): UseTrialFinishSetupModalReturn => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeActivations } = useStoreActivations({ storeName })
    const isExpandingTrialExperienceMilestone2Enabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceMilestone2,
        false,
    )

    const { isTrialFinishSetupModalOpen, closeTrialFinishSetupModal } =
        useShoppingAssistantTrialFlow({
            accountDomain,
            storeActivations,
            trialType,
            isOnboarded,
        })

    return useMemo((): UseTrialFinishSetupModalReturn => {
        const getTrialTexts = () => {
            if (trialType === TrialType.AiAgent) {
                return TEXTS[trialType]
            }

            if (!isExpandingTrialExperienceMilestone2Enabled) {
                return TEXTS[trialType]['onboarded']
            }

            const type = isOnboarded === true ? 'onboarded' : 'not-onboarded'
            return TEXTS[trialType][type]
        }

        const trialTexts = getTrialTexts()

        const getTitleSuffix = () => {
            if (
                isExpandingTrialExperienceMilestone2Enabled &&
                isOnboarded === false &&
                trialType === TrialType.ShoppingAssistant
            ) {
                return 'after onboarding.'
            }

            return 'now.'
        }

        return {
            title: (
                <>
                    Ready. Set. Grow. <br />
                    Your 14-day trial starts <br />
                    {getTitleSuffix()}
                </>
            ),
            subtitle: "Let's unlock its full potential.",
            content: trialTexts.content,
            primaryAction: {
                label: trialTexts.ctaLabel,
                onClick: closeTrialFinishSetupModal,
            },
            isOpen: isTrialFinishSetupModalOpen,
            onClose: closeTrialFinishSetupModal,
            features: trialTexts.features,
        }
    }, [
        closeTrialFinishSetupModal,
        isTrialFinishSetupModalOpen,
        trialType,
        isOnboarded,
        isExpandingTrialExperienceMilestone2Enabled,
    ])
}
