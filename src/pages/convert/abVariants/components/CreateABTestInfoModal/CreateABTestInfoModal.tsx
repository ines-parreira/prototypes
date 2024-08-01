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
    onClose: () => void
    onSubmit: () => void
    setIsDismissed: (isDismissed: boolean) => void
}

const CreateABTestInfoModal: React.FC<Props> = (props) => {
    const {isOpen, isDismissed, onClose, onSubmit, setIsDismissed} = props
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
                        <strong>How does it work?</strong>
                    </p>
                    <p>
                        Optimise your campaign messaging by testing different
                        versions against each other.
                    </p>
                    <p>
                        Your original campaign will become the “Control
                        Variant”, and contains all of your campaign settings.
                        You will have the ability to create up to 2 other
                        variants, which will have all the same properties (e.g.
                        triggers) as the “Master Variant”, except for the
                        messaging.
                    </p>
                    <p>
                        If your campaign is already running, it will continue
                        normally until the test starts. Once the test is
                        started, traffic will be evenly distributed among your
                        variants.
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
                <Button onClick={onSubmitClick}>Create A/B test</Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default CreateABTestInfoModal
