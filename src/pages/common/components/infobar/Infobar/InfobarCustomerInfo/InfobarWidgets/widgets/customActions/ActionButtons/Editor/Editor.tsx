import React, {useCallback, useContext, useMemo, useState} from 'react'
import {Button, ListGroup, Modal} from 'reactstrap'

import {Map} from 'immutable'
import {connect, ConnectedProps, useSelector} from 'react-redux'

import {
    removeEditedWidget,
    startWidgetEdition,
    updateCustomActions,
} from '../../../../../../../../../../../state/widgets/actions'
import {getCurrentAccountState} from '../../../../../../../../../../../state/currentAccount/selectors'
import {
    logEvent,
    SegmentEvent,
} from '../../../../../../../../../../../store/middlewares/segmentTracker'
import {IntegrationContext} from '../../../IntegrationContext'
import {
    Button as ButtonType,
    OnSubmitButton,
    OnRemoveButton,
    OnOpenForm,
} from '../../types'

import css from '../ActionButtons.less'

import Form from './Form'
import EditableButton from './Button'

type Props = {
    templatePath: string
    templateAbsolutePath: string
    source: Map<string, unknown>
    buttons: ButtonType[]
}

export function Editor({
    templatePath,
    templateAbsolutePath,
    source,
    buttons,
    startWidgetEdition,
    updateCustomActions,
    removeEditedWidget,
}: Props & ConnectedProps<typeof connector>) {
    const currentAccount = useSelector(getCurrentAccountState)
    const {integrationId} = useContext(IntegrationContext)
    const [isFormOpen, setFormOpen] = useState<boolean>(false)
    const [editorIndex, setFormIndex] = useState<number | null>(null)
    const handleRemove = useCallback<OnRemoveButton>(
        (index) => {
            removeEditedWidget(
                `${templatePath}.meta.custom.buttons`,
                templateAbsolutePath
            )

            const newButtons = buttons.filter(
                (_, currentIndex) => currentIndex !== index
            )

            logEvent(SegmentEvent.CustomActionButtonsDeleted, {
                account_domain: currentAccount.get('domain'),
                integration_id: integrationId,
            })

            if (buttons.length > 0) {
                startWidgetEdition(`${templatePath}.meta.custom.buttons`)
                updateCustomActions(newButtons)
            }
        },
        [
            buttons,
            templateAbsolutePath,
            templatePath,
            removeEditedWidget,
            startWidgetEdition,
            updateCustomActions,
            currentAccount,
            integrationId,
        ]
    )

    const handleSubmit = useCallback<OnSubmitButton>(
        (button, index) => {
            startWidgetEdition(`${templatePath}.meta.custom.buttons`)

            const newButtons = [...buttons]

            if (typeof index === 'number') {
                logEvent(SegmentEvent.CustomActionButtonsEdited, {
                    account_domain: currentAccount.get('domain'),
                    integration_id: integrationId,
                })
                newButtons[index] = button
            } else {
                logEvent(SegmentEvent.CustomActionButtonsAdded, {
                    account_domain: currentAccount.get('domain'),
                    integration_id: integrationId,
                })
                newButtons.push(button)
            }

            updateCustomActions(newButtons)
        },
        [
            buttons,
            templatePath,
            startWidgetEdition,
            updateCustomActions,
            currentAccount,
            integrationId,
        ]
    )

    const handleOpenForm = useCallback<OnOpenForm>(
        (index) => {
            if (typeof index === 'number') {
                setFormIndex(index)
            } else {
                setFormIndex(null)
                logEvent(SegmentEvent.CustomActionButtonsStart, {
                    account_domain: currentAccount.get('domain'),
                    integration_id: integrationId,
                })
            }
            setFormIndex(typeof index === 'number' ? index : null)
            setFormOpen(true)
        },
        [currentAccount, integrationId]
    )
    const handleCloseForm = useCallback(() => setFormOpen(false), [])

    const formProps = useMemo(
        () => ({
            onSubmit: handleSubmit,
            onClose: handleCloseForm,
            ...(typeof editorIndex === 'number' && {
                button: buttons[editorIndex],
                index: editorIndex,
            }),
        }),
        [buttons, editorIndex, handleCloseForm, handleSubmit]
    )

    return (
        <>
            <ListGroup flush>
                {buttons.map((button, index) => (
                    <EditableButton
                        key={index}
                        index={index}
                        source={source}
                        button={button}
                        onRemove={handleRemove}
                        onOpenForm={handleOpenForm}
                    />
                ))}
            </ListGroup>
            <Button
                type="button"
                className={css.addButton}
                onClick={() => handleOpenForm()}
            >
                <i className="material-icons mr-2">add</i>
                Add Button
            </Button>
            <Modal
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                backdrop="static"
                size="lg"
                // it has to be above popover which is currently set to 1560
                zIndex={1561}
            >
                <Form {...formProps} />
            </Modal>
        </>
    )
}

const connector = connect(null, {
    updateCustomActions,
    startWidgetEdition,
    removeEditedWidget,
})

export default connector(Editor)
