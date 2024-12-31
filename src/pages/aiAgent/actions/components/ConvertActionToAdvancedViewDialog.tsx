import classNames from 'classnames'
import React from 'react'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './ConvertActionToAdvancedViewDialog.less'

export const ConvertActionToAdvancedViewDialog = ({
    open,
    onClose,
    onConvert,
}: {
    open: boolean
    onClose: () => void
    onConvert: () => void
}) => {
    return (
        <Modal isOpen={open} onClose={onClose} size="medium">
            <ModalHeader title="Advanced options for Actions" />
            <ModalBody>
                <div className={css.modalBodyContent}>
                    <div className={css.modalBodyTitle}>
                        Need more functionality? Convert this Action to the
                        Advanced View
                    </div>
                    <ul className={css.modalBodyList}>
                        <li>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.modalBodyListIcon
                                )}
                            >
                                check
                            </i>
                            Build custom HTTP requests with apps not currently
                            supported
                        </li>
                        <li>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.modalBodyListIcon
                                )}
                            >
                                check
                            </i>
                            Collect information to use as input variables in
                            HTTP requests
                        </li>
                        <li>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.modalBodyListIcon
                                )}
                            >
                                check
                            </i>
                            Use conditional logic with variables between Action
                            steps
                        </li>
                    </ul>
                    <div>
                        <a href="#">
                            <i className="icon material-icons mr-2">
                                chrome_reader_mode
                            </i>
                            Learn more about advanced options for Actions
                        </a>
                    </div>
                    <div>
                        <Alert type={AlertType.Warning} icon>
                            Converting an Action to the advanced view cannot be
                            undone after saving. Technical knowledge may be
                            required to use advanced features.
                        </Alert>
                    </div>
                </div>
            </ModalBody>
            <ModalActionsFooter className={css.modalActionsFooter}>
                <Button
                    intent="secondary"
                    className={css.modalFooterBackButton}
                    onClick={onClose}
                >
                    Back To Editing
                </Button>
                <Button
                    intent="destructive"
                    onClick={() => {
                        onConvert()
                    }}
                >
                    Convert To Advanced View
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
