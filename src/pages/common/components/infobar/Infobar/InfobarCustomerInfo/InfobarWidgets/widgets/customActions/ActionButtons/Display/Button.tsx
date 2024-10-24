import _get from 'lodash/get'
import React, {memo, useCallback, useContext, useEffect, useState} from 'react'
import {DropdownItem} from 'reactstrap'

import {SegmentEvent, logEvent} from 'common/segment'
import {INFOBAR_CUSTOM_BUTTON_ACTION_NAME} from 'config/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import BaseButton from 'pages/common/components/button/Button'
import {mapActionToActionPayload} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/helpers/mapActionToActionPayload'
import {
    Action,
    ParameterTypes,
    Parameter,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import Modal from 'pages/common/components/modal/Modal'
import {AppContext} from 'providers/infobar/AppContext'
import {CustomerContext} from 'providers/infobar/CustomerContext'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {executeAction} from 'state/infobar/actions'
import {getPendingActionCallbacks} from 'state/infobar/selectors'

import {ACTION_PARAMETER_PATHS} from '../../constants'
import ActionEditor from './ActionEditor'
import css from './Button.less'

type Props = {
    label: string
    action: Action
    isDropdown?: boolean
}

export function Button({label, action, isDropdown = false}: Props) {
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
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const {customerId} = useContext(CustomerContext)
    const {integrationId} = useContext(IntegrationContext)
    const {appId} = useContext(AppContext)

    const trackingData = {
        account_domain: currentAccount.get('domain'),
        action_name: label,
        user_id: currentUser.get('id'),
        integration_id: integrationId,
        app_id: appId,
    }

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

    const handleClick = () => {
        logEvent(SegmentEvent.CustomActionButtonClicked, trackingData)
        if (shouldDisplayEditor(action)) {
            logEvent(
                SegmentEvent.CustomActionButtonsParameterEditorOpened,
                trackingData
            )
            setEditorOpen(true)
        } else {
            handleExecuteAction(action)
        }
    }

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
                    trackingData={trackingData}
                />
            </Modal>
        </>
    )
}

export default memo(Button)

function shouldDisplayEditor(action: Action): boolean {
    let shouldDisplayEditor = false
    ACTION_PARAMETER_PATHS.forEach((fieldPath) => {
        const specificParameters: Parameter[] | undefined = _get(
            action,
            fieldPath
        )
        if (specificParameters && specificParameters.length) {
            specificParameters.forEach(({type, editable}) => {
                if (type === ParameterTypes.Dropdown || editable)
                    shouldDisplayEditor = true
            })
        }
    })

    return shouldDisplayEditor
}
