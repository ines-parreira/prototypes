import { memo, useCallback } from 'react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    useOptOutAiAgentTrialUpgradeMutation,
    useOptOutSalesTrialUpgradeMutation,
} from 'models/aiAgent/queries'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import {
    canRequestTrialExtension,
    COOLDOWN_WAIT_HOURS,
    markTrialExtensionRequested,
} from 'pages/aiAgent/trial/utils/trialExtensionUtils'
import { OptOutModal } from 'pages/common/components/OptOutModal/OptOutModal'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './TrialOptOutModal.less'

const TRIAL_FEATURES = {
    [TrialType.ShoppingAssistant]: [
        'Smart product recommendations that convert browsers into buyers based on real-time intent.',
        'Dynamic discounts to reduce cart abandonment and recover at-risk sales.',
        'Reduce drop-off and build purchase confidence through proactive engagement.',
    ],
    [TrialType.AiAgent]: [
        'Deliver an exceptional, 24/7 shopping experience.',
        'Automate support inquiries to increase team productivity.',
        'Increase conversions by 62% using real-time, personalized product recommendations.',
    ],
}

const TITLE = 'Opt out of upgrade?'
const SECONDARY_ACTION = 'Request Trial Extension'
const DISMISS_ACTION = 'Dismiss'
const SECONDARY_ACTION_TOOLTIP = `Trial extension request was already sent within the last ${COOLDOWN_WAIT_HOURS} hours. Please wait before requesting again.`
const DESTRUCTIVE_ACTION = 'Opt Out Anyway'

const Intro = memo(
    ({
        trialType,
        isMultiStore,
    }: {
        trialType: TrialType
        isMultiStore: boolean
    }) => {
        const isAiAgent = trialType === TrialType.AiAgent
        const productName = isAiAgent ? 'AI Agent' : 'Shopping Assistant'

        return (
            <>
                {isAiAgent && isMultiStore && (
                    <div>
                        You won&apos;t be automatically upgraded when your trial
                        ends, and you&apos;ll keep full access to the AI Agent
                        on all your stores until then. After your trial,
                        you&apos;ll lose AI Agent access across all stores.
                        Here&apos;s <b>what you will miss out on</b>:
                    </div>
                )}

                {(!isAiAgent || !isMultiStore) && (
                    <div>
                        You won&apos;t be automatically upgraded when your trial
                        ends, and you&apos;ll keep full access to the{' '}
                        {productName} until then. If you opt out, here&apos;s{' '}
                        <b>what you will miss out on</b>:
                    </div>
                )}
            </>
        )
    },
)

const FeaturesList = memo<{ trialType: TrialType }>(({ trialType }) => {
    const features = TRIAL_FEATURES[trialType]
    return (
        <div className={css.featuresList}>
            <ul className={css.customList}>
                {features.map((feature, index) => (
                    <li
                        key={`opt-out-feature-${index}`}
                        className={css.listItem}
                    >
                        <i className={`material-icons-round ${css.listIcon}`}>
                            close
                        </i>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
})

export type TrialOptOutModalProps = {
    isOpen: boolean
    onClose: () => void
    onRequestTrialExtension: () => Promise<boolean>
    trialType: TrialType
    isTrialExtended: boolean
}

const TrialOptOutModal = ({
    isOpen,
    onClose,
    onRequestTrialExtension,
    trialType,
    isTrialExtended,
}: TrialOptOutModalProps) => {
    const isAiAgent = trialType === TrialType.AiAgent
    const dispatch = useAppDispatch()
    const shoppingAsistantOptOutMutation = useOptOutSalesTrialUpgradeMutation()
    const aiAgentOptOutMutation = useOptOutAiAgentTrialUpgradeMutation()

    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )

    const isMultiStore = allShopifyIntegrations.length > 1

    const primaryButtonId = isAiAgent
        ? 'ai-agent-opt-out-button'
        : 'shopping-assistant-opt-out-button'
    const secondaryButtonId = isAiAgent
        ? 'ai-agent-request-trial-extension-button'
        : 'shopping-assistant-request-trial-extension-button'

    const canRequestExtension = canRequestTrialExtension(trialType)

    const optOutMutation = isAiAgent
        ? aiAgentOptOutMutation
        : shoppingAsistantOptOutMutation

    const optOutTrialType = isAiAgent ? 'AI Agent' : 'Shopping Assistant'

    const onOptOutClick = useCallback(() => {
        logEvent(SegmentEvent.TrialOptOutModalClicked, {
            CTA: DESTRUCTIVE_ACTION,
            trialType,
        })
        optOutMutation.mutate([], {
            onSuccess: () => {
                onClose()
                dispatch(
                    notify({
                        message: `Your plan won't be upgraded when the trial ends, and you'll lose access to ${optOutTrialType}.`,
                        status: NotificationStatus.Success,
                    }),
                )
            },
        })
    }, [optOutMutation, optOutTrialType, onClose, dispatch, trialType])

    const onRequestTrialExtensionClick = useCallback(() => {
        if (!canRequestTrialExtension(trialType)) {
            return
        }

        onRequestTrialExtension().then((isSent) => {
            if (isSent) {
                markTrialExtensionRequested(trialType)
                onClose()
            }
        })
    }, [onClose, onRequestTrialExtension, trialType])

    const onCloseModal = useCallback(() => {
        logEvent(SegmentEvent.TrialOptOutModalClicked, {
            CTA: 'Close',
            trialType,
        })
        onClose()
    }, [onClose, trialType])

    return (
        <OptOutModal
            isOpen={isOpen}
            isLoading={optOutMutation.isLoading}
            title={TITLE}
            onClose={onCloseModal}
            onOptOut={onOptOutClick}
            onDismiss={
                isTrialExtended ? onCloseModal : onRequestTrialExtensionClick
            }
        >
            <OptOutModal.Body>
                <Intro trialType={trialType} isMultiStore={isMultiStore} />
                <FeaturesList trialType={trialType} />
            </OptOutModal.Body>
            <OptOutModal.Actions>
                {!canRequestExtension && (
                    <Tooltip target={secondaryButtonId} placement="top">
                        {SECONDARY_ACTION_TOOLTIP}
                    </Tooltip>
                )}
                <OptOutModal.SecondaryAction
                    id={secondaryButtonId}
                    isDisabled={!canRequestExtension}
                >
                    {isTrialExtended ? DISMISS_ACTION : SECONDARY_ACTION}
                </OptOutModal.SecondaryAction>
                <OptOutModal.DestructiveAction id={primaryButtonId}>
                    {DESTRUCTIVE_ACTION}
                </OptOutModal.DestructiveAction>
            </OptOutModal.Actions>
        </OptOutModal>
    )
}

export default TrialOptOutModal
