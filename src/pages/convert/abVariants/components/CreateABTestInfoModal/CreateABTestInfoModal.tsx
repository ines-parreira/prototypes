import React, {useState} from 'react'

import Button from 'pages/common/components/button/Button'

import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'

import CheckBox from 'pages/common/forms/CheckBox'

import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'

import {assetsUrl} from 'utils'

import css from './CreateABTestInfoModal.less'

type Props = {
    isOpen: boolean
    isDismissed: boolean
    isLoading?: boolean
    onClose: () => void
    onSubmit: () => void
    setIsDismissed: (isDismissed: boolean) => void
}

const CreateABTestInfoModal: React.FC<Props> = (props) => {
    const {
        isOpen,
        isDismissed,
        isLoading = false,
        onClose,
        onSubmit,
        setIsDismissed,
    } = props
    const [isDismissedChecked, setIsDismissedChecked] = useState(isDismissed)

    const onDismissClick = () => {
        setIsDismissedChecked(
            (prevIsDismissedChecked) => !prevIsDismissedChecked
        )
    }

    const onSubmitClick = () => {
        if (isDismissedChecked) {
            setIsDismissed(isDismissedChecked)
        }
        onSubmit && onSubmit()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader title={'Create an A/B test from a campaign'} />
            <ModalBody>
                <div>
                    <p>This campaign will be converted into an A/B test.</p>
                </div>
                <div>
                    <img
                        className={css.modalInfoImage}
                        src={assetsUrl('img/ab-variants/create-modal-info.png')}
                        alt="A/B test information"
                    />
                </div>
                <div>
                    <p>
                        <strong>
                            Optimize Your Campaign Messaging with A/B Testing
                        </strong>
                    </p>
                    <p>
                        Maximize the effectiveness of your campaign by testing
                        multiple messaging variations. When you initiate a test,
                        your original campaign will automatically become the
                        "Control Variant," retaining all your existing settings
                        and configurations. You can create up to two additional
                        variants, which will inherit the same properties (e.g.,
                        triggers) as the Control Variant, with the key
                        difference being the messaging content.
                    </p>
                    <p>
                        If your campaign is already running, it will continue to
                        run as usual until the test begins. Once the A/B test is
                        activated, the system will evenly distribute incoming
                        traffic across all variants, allowing you to compare
                        performance and identify the most effective messaging
                        strategy.
                    </p>
                </div>
            </ModalBody>
            <ModalActionsFooter
                extra={
                    <CheckBox
                        isChecked={isDismissedChecked}
                        onChange={onDismissClick}
                    >
                        <b>Don't show again</b>
                    </CheckBox>
                }
            >
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button isLoading={isLoading} onClick={onSubmitClick}>
                    Create A/B test
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default CreateABTestInfoModal
