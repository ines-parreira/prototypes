import React, {useCallback, useMemo, useState} from 'react'
import {Button, ListGroup} from 'reactstrap'

import {Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import {
    removeEditedWidget,
    startWidgetEdition,
    updateEditedWidget,
} from '../../../../../../../../../../../state/widgets/actions'
import Modal from '../../../../../../../../Modal'

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
    updateEditedWidget,
    removeEditedWidget,
}: Props & ConnectedProps<typeof connector>) {
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

            if (buttons.length > 0) {
                startWidgetEdition(`${templatePath}.meta.custom`)
                updateEditedWidget({
                    buttons: newButtons,
                })
            }
        },
        [
            buttons,
            templateAbsolutePath,
            templatePath,
            removeEditedWidget,
            startWidgetEdition,
            updateEditedWidget,
        ]
    )

    const handleSubmit = useCallback<OnSubmitButton>(
        (button, index) => {
            startWidgetEdition(`${templatePath}.meta.custom`)

            const newButtons = [...buttons]

            if (typeof index === 'number') {
                newButtons[index] = button
            } else {
                newButtons.push(button)
            }

            updateEditedWidget({
                buttons: newButtons,
            })
        },
        [buttons, templatePath, startWidgetEdition, updateEditedWidget]
    )

    const handleOpenForm = useCallback<OnOpenForm>((index) => {
        setFormIndex(typeof index === 'number' ? index : null)
        setFormOpen(true)
    }, [])
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
                // it has to be above popover which is currently set to 1560
                zIndex={1561}
            >
                <Form {...formProps} />
            </Modal>
        </>
    )
}

const connector = connect(null, {
    updateEditedWidget,
    startWidgetEdition,
    removeEditedWidget,
})

export default connector(Editor)
