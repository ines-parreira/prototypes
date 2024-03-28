import React, {useCallback, useContext, useMemo, useState} from 'react'

import {Source} from 'models/widget/types'
import {logEvent, SegmentEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {
    removeEditedWidget,
    startWidgetEdition,
    updateCustomActions,
} from 'state/widgets/actions'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {AppContext} from 'providers/infobar/AppContext'
import {
    Button as ButtonType,
    OnOpenForm,
    OnRemoveButton,
    OnSubmitButton,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/ActionButtons.less'

import Modal from 'pages/common/components/modal/Modal'
import Form from './Form'
import EditableButton from './Button'

type Props = {
    templatePath: string
    absolutePath: (number | string)[]
    source: Source
    buttons: ButtonType[]
}

export function Editor({templatePath, absolutePath, source, buttons}: Props) {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const dispatch = useAppDispatch()
    const {integrationId} = useContext(IntegrationContext)
    const {appId} = useContext(AppContext)
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

            logEvent(SegmentEvent.CustomActionButtonsDeleted, {
                account_domain: currentAccount.get('domain'),
                integration_id: integrationId,
                app_id: appId,
            })

            if (buttons.length > 0) {
                dispatch(
                    startWidgetEdition(`${templatePath}.meta.custom.buttons`)
                )
                dispatch(updateCustomActions(newButtons))
            }
        },
        [
            buttons,
            absolutePath,
            templatePath,
            currentAccount,
            integrationId,
            appId,
            dispatch,
        ]
    )

    const handleSubmit = useCallback<OnSubmitButton>(
        (button, index) => {
            dispatch(startWidgetEdition(`${templatePath}.meta.custom.buttons`))

            const newButtons = [...buttons]

            if (typeof index === 'number') {
                logEvent(SegmentEvent.CustomActionButtonsEdited, {
                    account_domain: currentAccount.get('domain'),
                    integration_id: integrationId,
                    app_id: appId,
                })
                newButtons[index] = button
            } else {
                logEvent(SegmentEvent.CustomActionButtonsAdded, {
                    account_domain: currentAccount.get('domain'),
                    integration_id: integrationId,
                    app_id: appId,
                })
                newButtons.push(button)
            }

            dispatch(updateCustomActions(newButtons))
        },
        [buttons, templatePath, currentAccount, integrationId, appId, dispatch]
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
                    app_id: appId,
                })
            }
            setFormIndex(typeof index === 'number' ? index : null)
            setFormOpen(true)
        },
        [currentAccount, integrationId, appId]
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
            >
                <ButtonIconLabel icon="add" />
                Add Button
            </Button>
            <Modal isOpen={isFormOpen} onClose={handleCloseForm} size="large">
                <Form {...formProps} />
            </Modal>
        </>
    )
}

export default Editor
