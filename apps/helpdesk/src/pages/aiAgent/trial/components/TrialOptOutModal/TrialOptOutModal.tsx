import { memo, useCallback } from 'react'

import { Tooltip } from '@gorgias/axiom'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import useAppDispatch from 'hooks/useAppDispatch'
import { useOptOutSalesTrialUpgradeMutation } from 'models/aiAgent/queries'
import {
    canRequestTrialExtension,
    COOLDOWN_WAIT_HOURS,
    markTrialExtensionRequested,
} from 'pages/aiAgent/trial/utils/trialExtensionUtils'
import { OptOutModal } from 'pages/common/components/OptOutModal/OptOutModal'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './TrialOptOutModal.less'

const FEATURES = [
    'Smart product recommendations that convert browsers into buyers based on real-time intent.',
    'Dynamic discounts to reduce cart abandonment and recover at-risk sales.',
    'Reduce drop-off and build purchase confidence through proactive engagement.',
]
const TITLE = 'Opt out of upgrade?'
const SECONDARY_ACTION = 'Request Trial Extension'
const SECONDARY_ACTION_TOOLTIP = `Trial extension request was already sent within the last ${COOLDOWN_WAIT_HOURS} hours. Please wait before requesting again.`
const DESTRUCTIVE_ACTION = 'Opt Out Anyway'

const Intro = memo(() => {
    return (
        <div>
            You won&apos;t be automatically upgraded when your trial ends, and
            you&apos;ll keep full access to Shopping Assistant until then. If
            you opt out, here&apos;s <b>what you will miss out on</b>:
        </div>
    )
})

const FeaturesList = memo(() => {
    return (
        <div className={css.featuresList}>
            <ul className={css.customList}>
                {FEATURES.map((feature, index) => (
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
}

const TrialOptOutModal = ({
    isOpen,
    onClose,
    onRequestTrialExtension,
}: TrialOptOutModalProps) => {
    const dispatch = useAppDispatch()
    const optOutMutation = useOptOutSalesTrialUpgradeMutation()
    const secondaryButtonId =
        'shopping-assistant-request-trial-extension-button'
    const canRequestExtension = canRequestTrialExtension()

    const onOptOutClick = useCallback(() => {
        logEvent(SegmentEvent.TrialOptOutModalClicked, {
            CTA: DESTRUCTIVE_ACTION,
        })
        optOutMutation.mutate([], {
            onSuccess: () => {
                onClose()
                dispatch(
                    notify({
                        message:
                            "Your plan won't be upgraded when the trial ends, and you'll lose access to Shopping Assistant.",
                        status: NotificationStatus.Success,
                    }),
                )
            },
        })
    }, [optOutMutation, onClose, dispatch])

    const onRequestTrialExtensionClick = useCallback(() => {
        if (!canRequestTrialExtension()) {
            return
        }

        onRequestTrialExtension().then((isSent) => {
            if (isSent) {
                markTrialExtensionRequested()
                onClose()
            }
        })
    }, [onClose, onRequestTrialExtension])

    const onCloseModal = useCallback(() => {
        logEvent(SegmentEvent.TrialOptOutModalClicked, {
            CTA: 'Close',
        })
        onClose()
    }, [onClose])

    return (
        <OptOutModal
            isOpen={isOpen}
            isLoading={optOutMutation.isLoading}
            title={TITLE}
            onClose={onCloseModal}
            onOptOut={onOptOutClick}
            onDismiss={onRequestTrialExtensionClick}
        >
            <OptOutModal.Body>
                <Intro />
                <FeaturesList />
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
                    {SECONDARY_ACTION}
                </OptOutModal.SecondaryAction>
                <OptOutModal.DestructiveAction id="shopping-assistant-opt-out">
                    {DESTRUCTIVE_ACTION}
                </OptOutModal.DestructiveAction>
            </OptOutModal.Actions>
        </OptOutModal>
    )
}

export default TrialOptOutModal
