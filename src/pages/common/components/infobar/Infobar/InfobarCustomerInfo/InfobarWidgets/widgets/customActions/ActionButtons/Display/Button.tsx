import React, {memo, useCallback, useContext, useEffect, useState} from 'react'
import {DropdownItem} from 'reactstrap'

import {INFOBAR_CUSTOM_BUTTON_ACTION_NAME} from 'config/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {executeAction} from 'state/infobar/actions'
import {getPendingActionCallbacks} from 'state/infobar/selectors'
import {ContentType} from 'models/api/types'
import {CustomerContext} from 'providers/infobar/CustomerContext'
import {AppContext} from 'providers/infobar/AppContext'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import BaseButton from 'pages/common/components/button/Button'
import {Action} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import {mapActionToActionPayload} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/helpers/mapActionToActionPayload'

import css from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/ActionButtons.less'
import Modal from 'pages/common/components/modal/Modal'

import ActionEditor from './ActionEditor'

type Props = {
    label: string
    action: Action
    isDropdown?: boolean
}

function Button({label, action, isDropdown = false}: Props) {
    const [isEditorOpen, setEditorOpen] = useState<boolean>(false)

    // pending action management
    const getPendingActionCallback = useAppSelector(getPendingActionCallbacks)
    const [loadingId, setLoadingId] = useState<string>('')
    useEffect(() => {
        setLoadingId((loadingId) =>
            !!getPendingActionCallback(loadingId) ? loadingId : ''
        )
    }, [getPendingActionCallback])

    // action trigger management
    const dispatch = useAppDispatch()
    const {customerId} = useContext(CustomerContext)
    const {integrationId} = useContext(IntegrationContext)
    const {appId} = useContext(AppContext)

    const handleExecuteAction = useCallback(
        (action: Action) => {
            const loadingId = dispatch(
                executeAction({
                    actionName: INFOBAR_CUSTOM_BUTTON_ACTION_NAME,
                    actionLabel: label,
                    integrationId: integrationId,
                    appId: appId,
                    customerId: customerId?.toString(),
                    payload: mapActionToActionPayload(action),
                })
            )
            setLoadingId(loadingId)
        },
        [label, dispatch, customerId, integrationId, appId]
    )

    const handleClick = useCallback(() => {
        if (shouldDisplayEditor(action)) {
            setEditorOpen(true)
        } else {
            handleExecuteAction(action)
        }
    }, [action, handleExecuteAction])

    const handleCloseEditor = useCallback(() => {
        setEditorOpen(false)
    }, [])

    const props = {
        type: 'button',
        isDisabled: !!loadingId,
        onClick: handleClick,
        children: label,
    } as const

    const CTA = isDropdown ? (
        <DropdownItem className={css.dropdownItem} {...props} />
    ) : (
        <BaseButton
            intent="secondary"
            className={css.actionButton}
            size="small"
            {...props}
        />
    )
    return (
        <>
            {CTA}
            <Modal isOpen={isEditorOpen} onClose={handleCloseEditor}>
                <ActionEditor
                    onSubmit={handleExecuteAction}
                    onClose={handleCloseEditor}
                    action={action}
                />
            </Modal>
        </>
    )
}

export default memo(Button)

function shouldDisplayEditor({headers, params, body}: Action): boolean {
    let shouldDisplayEditor = false
    headers.forEach(({editable}) => {
        if (editable) shouldDisplayEditor = true
    })
    params.forEach(({editable}) => {
        if (editable) shouldDisplayEditor = true
    })
    body[ContentType.Form].forEach(({editable}) => {
        if (editable) shouldDisplayEditor = true
    })
    return shouldDisplayEditor
}
