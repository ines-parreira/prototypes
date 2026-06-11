import { useCallback, useEffect, useState } from 'react'

import {
    Box,
    Button,
    CheckBoxField,
    Heading,
    Icon,
    Link,
    Modal,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useAiAgentUpgradePlan } from 'hooks/aiAgent/useAiAgentUpgradePlan'
import { useAppSelector } from 'hooks/useAppSelector'
import { useGetTrials } from 'models/aiAgent/queries'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import type { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import {
    hasTrialExpired,
    hasTrialOptedIn,
} from 'pages/aiAgent/trial/utils/utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

export type TrialActivationModalProps = {
    isOpen: boolean
    onClose: () => void
    onConfirm: (optedInForUpgrade?: boolean) => void
    trialType: TrialType
    newPlan: PlanDetails
    isLoading?: boolean
    isConfirmDisabled?: boolean
}

const DESCRIPTION_BY_TRIAL_TYPE: Record<TrialType, string> = {
    [TrialType.AiAgent]:
        "You've set it up and tested it — now let it start working for your shoppers. Your 14-day free trial begins the moment you activate.",
    [TrialType.ShoppingAssistant]:
        "You've set it up and tested it — now let it start working for your customers. Your 14-day free trial begins the moment you activate.",
}

const TODAY_DETAIL =
    'Your 14-day trial starts. All features are unlocked, so you can start seeing impact today.'

export const TrialActivationModal = ({
    isOpen,
    onClose,
    onConfirm,
    trialType,
    newPlan,
    isLoading = false,
    isConfirmDisabled = false,
}: TrialActivationModalProps) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { data: trials, isLoading: isTrialsLoading } =
        useGetTrials(accountDomain)
    const { data: upgradePlanData, isLoading: upgradePlanDataLoading } =
        useAiAgentUpgradePlan()

    const hasAnyOptedInTrial = !!trials?.some(
        (trial) => hasTrialOptedIn(trial) && !hasTrialExpired(trial),
    )

    const [isTermsManuallyChecked, setTermsManuallyChecked] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isTermsChecked = hasAnyOptedInTrial || isTermsManuallyChecked
    const isTermsDisabled = hasAnyOptedInTrial
    const isStartTrialPending = isLoading || isSubmitting

    useEffect(() => {
        if (!isOpen) {
            setTermsManuallyChecked(false)
            setIsSubmitting(false)
        }
    }, [isOpen])

    const hasUpgradePlan = !!upgradePlanData && !upgradePlanDataLoading
    const description = DESCRIPTION_BY_TRIAL_TYPE[trialType]

    const handleConfirm = useCallback(() => {
        if (isSubmitting) return
        setIsSubmitting(true)
        onConfirm(isTermsChecked)
    }, [isTermsChecked, isSubmitting, onConfirm])

    if (isTrialsLoading) return null

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose()
            }}
            size="xl"
        >
            <Box gap="lg" padding="md">
                <Box
                    flexDirection="column"
                    flex="1 1 0"
                    justifyContent="space-between"
                >
                    <Box flexDirection="column" gap="lg">
                        <Box flexDirection="column" gap="md">
                            <Heading size="xxl">
                                Your AI Agent is ready to go live
                            </Heading>
                            <Text>{description}</Text>
                        </Box>
                        {hasUpgradePlan ? (
                            <>
                                <PricingSection newPlan={newPlan} />
                                <TermsSection
                                    isChecked={isTermsChecked}
                                    onChange={setTermsManuallyChecked}
                                    isDisabled={isTermsDisabled}
                                />
                            </>
                        ) : (
                            <Text variant="bold">
                                Please get in touch with our team to start your
                                free trial.
                            </Text>
                        )}
                    </Box>
                    <Box gap="xxs">
                        <Button
                            variant="primary"
                            onClick={handleConfirm}
                            isDisabled={
                                isStartTrialPending ||
                                isConfirmDisabled ||
                                !hasUpgradePlan ||
                                !isTermsChecked
                            }
                            isLoading={isStartTrialPending}
                        >
                            Start trial
                        </Button>
                        <Button
                            variant="tertiary"
                            onClick={onClose}
                            isDisabled={isStartTrialPending}
                        >
                            Not now
                        </Button>
                    </Box>
                </Box>
                <Box
                    as="aside"
                    aria-label="Trial timeline"
                    flex="1 1 0"
                    minWidth={0}
                    flexDirection="column"
                    padding="md"
                    style={{
                        borderRadius: 6,
                        backgroundColor: 'var(--navigation-background)',
                    }}
                >
                    <TimelineStep
                        icon="check"
                        iconVariant="active"
                        title="Today"
                        description={TODAY_DETAIL}
                        withConnector
                    />
                    <TimelineStep
                        icon="bell"
                        iconVariant="upcoming"
                        title="Day 7"
                        description="We'll remind you when you're halfway through your trial."
                        withConnector
                    />
                    <TimelineStep
                        icon="star"
                        iconVariant="upcoming"
                        title="Day 14"
                        description="Your new AI Agent plan kicks in automatically after the trial so you can keep automating support and growing revenue, unless you cancel during your trial."
                    />
                </Box>
            </Box>
        </Modal>
    )
}

type PricingSectionProps = {
    newPlan: PlanDetails
}

const PricingSection = ({ newPlan }: PricingSectionProps) => (
    <Box flexDirection="column" gap="xs">
        <Box justifyContent="space-between" alignItems="center">
            <Text variant="bold">Today</Text>
            <Text variant="bold">$0</Text>
        </Box>
        <Box justifyContent="space-between" alignItems="center">
            <Text>After trial ends</Text>
            <Box alignItems="center" gap="xxxs">
                <Text>
                    {newPlan.price} / {newPlan.billingPeriod}
                </Text>
                {newPlan.priceTooltipText && (
                    <Tooltip
                        trigger={
                            <Icon
                                name="info"
                                color="content-neutral-tertiary"
                            />
                        }
                    >
                        <TooltipContent title={newPlan.priceTooltipText} />
                    </Tooltip>
                )}
            </Box>
        </Box>
    </Box>
)

type TermsSectionProps = {
    isChecked: boolean
    onChange: (checked: boolean) => void
    isDisabled: boolean
}

const TermsSection = ({
    isChecked,
    onChange,
    isDisabled,
}: TermsSectionProps) => (
    <Box gap="xs" alignItems="flex-start">
        <CheckBoxField
            value={isChecked}
            onChange={onChange}
            isDisabled={isDisabled}
            aria-label="I agree to the updated pricing terms"
        />
        <Text size="sm" color="content-neutral-secondary">
            I agree to the updated pricing, which will apply after the 14-day
            trial ends, as outlined in{' '}
            <Link
                href="https://www.gorgias.com/legal/terms-of-service"
                target="_blank"
                rel="noreferrer"
                size="sm"
            >
                Gorgias terms
            </Link>
            .
        </Text>
    </Box>
)

type TimelineStepProps = {
    icon: 'check' | 'bell' | 'star'
    iconVariant: 'active' | 'upcoming'
    title: string
    description: string
    withConnector?: boolean
}

const TimelineStep = ({
    icon,
    iconVariant,
    title,
    description,
    withConnector = false,
}: TimelineStepProps) => {
    const isActive = iconVariant === 'active'

    return (
        <Box gap="sm" alignItems="flex-start">
            <Box
                flexDirection="column"
                alignItems="center"
                width={30}
                flexShrink={0}
            >
                <Box
                    alignItems="center"
                    justifyContent="center"
                    width={30}
                    height={30}
                    style={{
                        borderRadius: 30 / 2,
                        backgroundColor: isActive
                            ? 'var(--border-success-default)'
                            : 'transparent',
                        border: `1px solid var(--${
                            isActive
                                ? 'border-success-default'
                                : 'border-neutral-default'
                        })`,
                    }}
                >
                    <Icon
                        name={icon}
                        size="xs"
                        color={
                            isActive
                                ? 'content-inverted-default'
                                : 'content-neutral-default'
                        }
                    />
                </Box>
                {withConnector && (
                    <Box
                        flexGrow={1}
                        width={2}
                        minHeight={60}
                        mt="md"
                        style={{
                            borderRadius: 100,
                            background: isActive
                                ? 'linear-gradient(to bottom, var(--border-success-default), var(--border-neutral-default))'
                                : 'var(--border-neutral-default)',
                        }}
                    />
                )}
            </Box>
            <Box flexDirection="column" gap="xxxs" pb="sm">
                <Text variant="bold">{title}</Text>
                <Text>{description}</Text>
            </Box>
        </Box>
    )
}
