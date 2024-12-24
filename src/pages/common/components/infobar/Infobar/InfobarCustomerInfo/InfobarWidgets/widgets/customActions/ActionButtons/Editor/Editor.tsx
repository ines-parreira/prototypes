import React, {useCallback, useMemo, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {Source} from 'models/widget/types'
import Button from 'pages/common/components/button/Button'
import {
    Button as ButtonType,
    OnOpenForm,
    OnRemoveButton,
    OnSubmitButton,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import Modal from 'pages/common/components/modal/Modal'
import {
    removeEditedWidget,
    startWidgetEdition,
    updateCustomActions,
} from 'state/widgets/actions'

import EditableButton from './Button'
import css from './Editor.less'
import Form from './Form'

type Props = {
    templatePath: string
    absolutePath: (number | string)[]
    source: Source
    buttons: ButtonType[]
}

export function Editor({templatePath, absolutePath, source, buttons}: Props) {
    const dispatch = useAppDispatch()
    const [isFormOpen, setFormOpen] = useState<boolean>(false)
    const [editorIndex, setFormIndex] = useState<number | null>(null)
    const handleRemove = useCallback<OnRemoveButton>(
        (index) => {
            dispatch(
                removeEditedWidget(
                    `${templatePath}.meta.custom.buttons`,
                    absolutePath
                )
            )

            const newButtons = buttons.filter(
                (_, currentIndex) => currentIndex !== index
            )

            if (buttons.length > 0) {
                dispatch(
                    startWidgetEdition(`${templatePath}.meta.custom.buttons`)
                )
                dispatch(updateCustomActions(newButtons))
            }
        },
        [buttons, absolutePath, templatePath, dispatch]
    )

    const handleSubmit = useCallback<OnSubmitButton>(
        (button, index) => {
            dispatch(startWidgetEdition(`${templatePath}.meta.custom.buttons`))

            const newButtons = [...buttons]

            if (typeof index === 'number') {
                newButtons[index] = button
            } else {
                newButtons.push(button)
            }

            dispatch(updateCustomActions(newButtons))
        },
        [buttons, templatePath, dispatch]
    )

    const handleOpenForm = useCallback<OnOpenForm>((index) => {
        if (typeof index === 'number') {
            setFormIndex(index)
        } else {
            setFormIndex(null)
        }
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
            <ul className={css.editList}>
                {buttons.map((button, index) => (
                    <li className={css.editRow} key={index}>
                        <EditableButton
                            index={index}
                            source={source}
                            button={button}
                            onRemove={handleRemove}
                            onOpenForm={handleOpenForm}
                        />
                    </li>
                ))}
            </ul>
            <Button
                className={css.addButton}
                intent="secondary"
                type="button"
                size="small"
                onClick={() => handleOpenForm()}
                leadingIcon="add"
            >
                Add Button
            </Button>
            <Modal isOpen={isFormOpen} onClose={handleCloseForm} size="huge">
                <Form {...formProps} />
            </Modal>
        </>
    )
}

export default Editor
