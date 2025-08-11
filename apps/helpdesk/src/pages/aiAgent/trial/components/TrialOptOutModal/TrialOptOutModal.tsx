import { memo, useCallback } from 'react'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import useAppDispatch from 'hooks/useAppDispatch'
import { useOptOutSalesTrialUpgradeMutation } from 'models/aiAgent/queries'
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
    onClose: (extendTrialRequestSent: boolean) => void
    onRequestTrialExtension: () => Promise<boolean>
}

const TrialOptOutModal = ({
    isOpen,
    onClose,
    onRequestTrialExtension,
}: TrialOptOutModalProps) => {
    const dispatch = useAppDispatch()
    const optOutMutation = useOptOutSalesTrialUpgradeMutation()

    const onOptOutClick = useCallback(() => {
        logEvent(SegmentEvent.TrialOptOutModalClicked, {
            CTA: DESTRUCTIVE_ACTION,
        })
        optOutMutation.mutate([], {
            onSuccess: () => {
                onClose(true)
                dispatch(
                    notify({
                        message:
                            "Your plan won't be upgraded when the trial ends, and you'll lose access to AI Agent's sales skills.",
                        status: NotificationStatus.Success,
                    }),
                )
            },
        })
    }, [optOutMutation, onClose, dispatch])

    const onRequestTrialExtensionClick = useCallback(() => {
        onRequestTrialExtension().then((isSent) => {
            if (isSent) {
                onClose(false)
            }
        })
    }, [onClose, onRequestTrialExtension])

    const onCloseModal = useCallback(() => {
        logEvent(SegmentEvent.TrialOptOutModalClicked, {
            CTA: 'Close',
        })
        onClose(false)
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
                <OptOutModal.SecondaryAction>
                    {SECONDARY_ACTION}
                </OptOutModal.SecondaryAction>
                <OptOutModal.DestructiveAction>
                    {DESTRUCTIVE_ACTION}
                </OptOutModal.DestructiveAction>
            </OptOutModal.Actions>
        </OptOutModal>
    )
}

export default TrialOptOutModal
