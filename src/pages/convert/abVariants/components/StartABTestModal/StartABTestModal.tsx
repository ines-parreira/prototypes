import React, {useState} from 'react'

import Button from 'pages/common/components/button/Button'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import CheckBox from 'pages/common/forms/CheckBox'

import css from './StartABTestModal.less'

type Props = {
    isOpen: boolean
    isDismissed: boolean
    isLoading?: boolean
    onClose: () => void
    onSubmit: () => void
    setIsDismissed: (isDismissed: boolean) => void
}

const StartABTestModal: React.FC<Props> = (props) => {
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
            <ModalHeader title={'You’re about to start your test'} />
            <ModalBody>
                <div>
                    <h3 className={css.heading}>
                        What you should know before you start:
                    </h3>
                </div>
                <div>
                    <ul className={css.list}>
                        <li>
                            Once the A/B test is started, traffic will be evenly
                            distributed across your variants.{' '}
                            <strong>
                                You will not be able to add any new variants.
                            </strong>
                        </li>
                        <li>
                            While the test is ongoing, you will not be able to
                            edit your variants. You can pause the test at
                            anytime to edit your variants.
                        </li>
                        <li>
                            When you are ready to stop the test, you will be
                            prompted to choose a winner. You can then decide to
                            create a new campaign from any of your tested
                            variants.
                        </li>
                    </ul>
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
                <Button
                    isLoading={isLoading}
                    onClick={onSubmitClick}
                    leadingIcon="play_arrow"
                >
                    Start Test
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default StartABTestModal
