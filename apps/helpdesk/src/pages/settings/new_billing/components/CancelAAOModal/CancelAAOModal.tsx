import { useState } from 'react'

import {
    BILLING_SUPPORT_EMAIL,
    CANCEL_AUTOMATION_REASONS,
    DATE_FORMAT,
    ZAPIER_REMOVE_AAO_HOOK,
} from '@repo/billing'
import moment from 'moment'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import type { CurrentProductsUsages } from 'state/billing/types'
import { getCurrentDomain, isTrialing } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

import useAutomationFeatures from '../../hooks/useAutomationFeatures'
import { sendRemoveNotificationZap } from '../../utils/sendRemoveNotificationZap'
import ReasonsAAOModal from './ReasonsAAOModal'

import css from './CancelAAOModal.less'

export type CancelAAOModalProps = {
    isOpen: boolean
    handleCancelAAO: () => void
    handleOnClose: () => void
    periodEnd: string
    currentUsage?: CurrentProductsUsages
}

export type Reason = {
    label: string
    value: boolean
}

const CancelAAOModal = ({
    isOpen,
    handleCancelAAO,
    handleOnClose,
    periodEnd,
    currentUsage,
}: CancelAAOModalProps) => {
    const domain = useAppSelector(getCurrentDomain)
    const currentUser = useAppSelector(getCurrentUser)
    const isTrialingSubscription = useAppSelector(isTrialing)
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const automateFeatures = useAutomationFeatures()

    const from: string = currentUser.get('email')
    const subject = `Remove AI Agent - ${domain}`

    const [isOpenModalWithReasons, setIsOpenModalWithReasons] = useState(false)

    const [reasons, setReasons] = useState(CANCEL_AUTOMATION_REASONS)

    const [message, setMessage] = useState('')
    const AAOUsage = currentUsage?.automation
    const automatedInteractions = AAOUsage?.data.num_tickets ?? 0
    const subscriptionStartDate = moment(
        AAOUsage?.meta.subscription_start_datetime,
    ).format(DATE_FORMAT)

    const updateReasons = (index: number) => {
        setReasons((prevReasons) => {
            const newReasons = prevReasons.slice()
            newReasons[index] = {
                ...prevReasons[index],
                value: !prevReasons[index].value,
            }
            return newReasons
        })
    }

    const resetReasons = () => {
        setReasons(CANCEL_AUTOMATION_REASONS)
    }

    const handleOpenSecondModal = () => {
        setIsOpenModalWithReasons(true)
        handleOnClose()
        resetReasons()
    }

    const handleConfirmCancelation = () => {
        handleCancelAAO()

        const reasonsToRemove = reasons
            .filter((reason) => reason.value)
            .map((reason) => reason.label)
            .join('\n')

        const zapMessage = `Reasons:\n${reasonsToRemove}\n\nAdditional details:\n${message}`
        void sendRemoveNotificationZap({
            zapierHook: ZAPIER_REMOVE_AAO_HOOK,
            subject,
            message: zapMessage,
            from,
            to: BILLING_SUPPORT_EMAIL,
            account: domain,
            freeTrial: isTrialingSubscription,
            helpdeskPlan: currentHelpdeskPlan?.name ?? '',
            automationPlan: currentAutomatePlan?.name ?? '',
        })
        setIsOpenModalWithReasons(false)
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleOnClose}
                classNameDialog={css.container}
            >
                <ModalHeader title="Are you sure you want to unsubscribe from AI Agent?" />
                <ModalBody>
                    {automatedInteractions >= 50 && (
                        <div className={css.warningInteractions}>
                            Your team has benefited by automating{' '}
                            <b>{automatedInteractions}</b> interactions since{' '}
                            <b>{subscriptionStartDate}</b>
                        </div>
                    )}
                    <div>
                        {`You'll lose access to AI Agent and AI features like:`}
                    </div>
                    <div className={css.features}>
                        {automateFeatures.map((feature) => (
                            <div className={css.feature} key={feature.title}>
                                <div className={css.icon}>
                                    {feature.icon ? (
                                        <i className="material-icons">
                                            {feature.icon}
                                        </i>
                                    ) : (
                                        <img src={feature.iconUrl} alt="" />
                                    )}
                                </div>
                                <div>
                                    <div className={css.featureName}>
                                        {feature.title}
                                    </div>
                                    <div className={css.featureDescription}>
                                        {feature.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={handleOnClose}>
                        Keep using AI Agent
                    </Button>
                    <Button onClick={handleOpenSecondModal}>Continue</Button>
                </ModalActionsFooter>
            </Modal>
            {isOpenModalWithReasons && (
                <ReasonsAAOModal
                    reasons={reasons}
                    handleConfirmCancelation={handleConfirmCancelation}
                    isOpen={isOpenModalWithReasons}
                    handleOnClose={() => setIsOpenModalWithReasons(false)}
                    message={message}
                    updateReasons={updateReasons}
                    setMessage={setMessage}
                    periodEnd={periodEnd}
                />
            )}
        </>
    )
}

export default CancelAAOModal
