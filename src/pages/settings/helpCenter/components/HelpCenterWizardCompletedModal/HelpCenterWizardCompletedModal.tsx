import React, { useState } from 'react'

import { useSearchParam } from 'hooks/useSearchParam'
import SuccessModal, {
    SuccessModalIcon,
} from 'pages/common/components/SuccessModal/SuccessModal'

import {
    HELP_CENTER_WIZARD_COMPLETED_QUERY_KEY,
    HELP_CENTER_WIZARD_COMPLETED_STATE,
    isHelpCenterWizardCompletedState,
} from '../../constants'

import css from './HelpCenterWizardCompletedModal.less'

const getModalParams = (state?: HELP_CENTER_WIZARD_COMPLETED_STATE) => {
    switch (state) {
        case HELP_CENTER_WIZARD_COMPLETED_STATE.AlmostDone:
            return {
                title: 'Almost there!',
                icon: SuccessModalIcon.PinchingHand,
                buttonLabel: 'Continue',
                description:
                    'You need at least 1 published article for Article Recommendations to work in your Chat. Add an article by importing content or using a template.',
            }
        case HELP_CENTER_WIZARD_COMPLETED_STATE.AllSet:
            return {
                title: 'You’re all set!',
                icon: SuccessModalIcon.PartyPopper,
                buttonLabel: 'Done',
                description:
                    'Help center is currently unpublished. Add more articles using templates or by importing your own content, then Publish your Help Center.',
            }
        default:
            return null
    }
}

const HelpCenterWizardCompletedModal = () => {
    const [value, setSearchParam] = useSearchParam(
        HELP_CENTER_WIZARD_COMPLETED_QUERY_KEY,
    )
    const modalState = isHelpCenterWizardCompletedState(value)
        ? value
        : undefined
    const [isOpen, setIsOpen] = useState(modalState !== undefined)

    // To have immutable state during rerender as we don't need to change it after we changed removed query param
    const [modalParams] = useState(getModalParams(modalState))
    const onClose = () => {
        setIsOpen(false)
        setSearchParam(null)
    }

    return (
        modalParams && (
            <SuccessModal
                isOpen={isOpen}
                onClose={onClose}
                buttonLabel={modalParams.buttonLabel}
                icon={modalParams.icon}
            >
                <div>
                    <p className={css.title}>{modalParams.title}</p>
                    <span className={css.subtitle}>
                        {modalParams.description}
                    </span>
                </div>
            </SuccessModal>
        )
    )
}

export default HelpCenterWizardCompletedModal
