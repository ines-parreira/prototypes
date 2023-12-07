import React, {useState} from 'react'

import moment from 'moment'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useList} from 'react-use'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import {CurrentProductsUsages} from 'state/billing/types'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentDomain, isTrialing} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {
    getCurrentAutomationProduct,
    getCurrentHelpdeskProduct,
} from 'state/billing/selectors'
import {
    AUTOMATION_FEATURES,
    BILLING_SUPPORT_EMAIL,
    CANCEL_AUTOMATION_REASONS,
    DATE_FORMAT,
    ZAPIER_REMOVE_AAO_HOOK,
} from '../../constants'
import {sendRemoveNotificationZap} from '../../utils/sendRemoveNotificationZap'
import css from './CancelAAOModal.less'
import ReasonsAAOModal from './ReasonsAAOModal'

export type CancelAAOModalProps = {
    isOpen: boolean
    handleCancelAAO: () => void
    handleOnClose: () => void
    periodEnd: string
    currentUsage: CurrentProductsUsages
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
    const helpdeskPlan = useAppSelector(getCurrentHelpdeskProduct)
    const automationPlan = useAppSelector(getCurrentAutomationProduct)

    const from: string = currentUser.get('email')
    const subject = `Remove Automation - ${domain}`

    const [isOpenModalWithReasons, setIsOpenModalWithReasons] = useState(false)
    const [reasons, {reset, updateAt}] = useList(CANCEL_AUTOMATION_REASONS)
    const [message, setMessage] = useState('')
    const AAOUsage = currentUsage.automation
    const automatedInteractions = AAOUsage?.data.num_tickets ?? 0
    const subscriptionStartDate = moment(
        AAOUsage?.meta.subscription_start_datetime
    ).format(DATE_FORMAT)

    const updateReasons = (index: number) => {
        updateAt(index, {
            ...reasons[index],
            value: !reasons[index].value,
        })
    }

    const resetReasons = () => {
        reset()
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
            helpdeskPlan: helpdeskPlan?.name ?? '',
            automationPlan: automationPlan?.name ?? '',
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
                <ModalHeader title="Are you sure you want to unsubscribe from Automate?" />
                <ModalBody>
                    {automatedInteractions >= 50 && (
                        <div className={css.warningInteractions}>
                            Your team has benefited by automating{' '}
                            <b>{automatedInteractions}</b> interactions since{' '}
                            <b>{subscriptionStartDate}</b>
                        </div>
                    )}
                    <div>
                        You'll lose access to automation and AI features like:
                    </div>
                    <div className={css.features}>
                        {AUTOMATION_FEATURES.map((feature) => (
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
                        Keep using automate
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
