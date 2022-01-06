import React, {
    FC,
    memo,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import {connect, ConnectedProps, useSelector} from 'react-redux'
import {Button as ReactStrapButton, DropdownItem} from 'reactstrap'

import {INFOBAR_CUSTOM_BUTTON_ACTION_NAME} from '../../../../../../../../../../../config/actions'
import {executeAction} from '../../../../../../../../../../../state/infobar/actions'
import {getPendingActionCallbacks} from '../../../../../../../../../../../state/infobar/selectors'
import {getCurrentAccountState} from '../../../../../../../../../../../state/currentAccount/selectors'
import {ContentType} from '../../../../../../../../../../../models/api/types'
import {
    logEvent,
    SegmentEvent,
} from '../../../../../../../../../../../store/middlewares/segmentTracker'
import {CustomerContext} from '../../../../../InfobarCustomerInfo'
import {IntegrationContext} from '../../../IntegrationContext'

import {Action} from '../../types'

import css from '../ActionButtons.less'
import {mapActionToActionPayload} from './mapActionToActionPayload'

type Props = {
    index: number
    label: string
    action: Action
    openEditor: (index: number, callback: (action: Action) => void) => void
    isDropdown?: boolean
}

function Button({
    index,
    label,
    action,
    isDropdown = false,
    openEditor,
    executeAction,
}: Props & ConnectedProps<typeof connector>) {
    // pending action management
    const getPendingActionCallback = useSelector(getPendingActionCallbacks)
    const [loadingId, setLoadingId] = useState<string>('')
    useEffect(() => {
        setLoadingId((loadingId) =>
            !!getPendingActionCallback(loadingId) ? loadingId : ''
        )
    }, [getPendingActionCallback])

    // action trigger management
    const currentAccount = useSelector(getCurrentAccountState)
    const {customerId} = useContext(CustomerContext)
    const {integrationId} = useContext(IntegrationContext)
    const handleExecuteAction = useCallback(
        (action: Action) => {
            const loadingId = executeAction({
                actionName: INFOBAR_CUSTOM_BUTTON_ACTION_NAME,
                actionLabel: label,
                integrationId: integrationId!,
                customerId: customerId?.toString(),
                payload: mapActionToActionPayload(action),
            })
            logEvent(SegmentEvent.CustomActionButtonsExecuted, {
                account_domain: currentAccount.get('domain'),
                integration_id: integrationId,
            })
            setLoadingId(loadingId)
        },
        [label, executeAction, customerId, integrationId, currentAccount]
    )
    const handleClick = useCallback(() => {
        if (shouldDisplayEditor(action)) {
            openEditor(index, handleExecuteAction)
            logEvent(SegmentEvent.CustomActionButtonsParamOpened, {
                account_domain: currentAccount.get('domain'),
                integration_id: integrationId,
            })
        } else {
            handleExecuteAction(action)
        }
    }, [
        action,
        index,
        openEditor,
        handleExecuteAction,
        integrationId,
        currentAccount,
    ])

    const props = {
        type: 'button',
        disabled: !!loadingId,
        onClick: handleClick,
        children: label,
    } as const

    return isDropdown ? (
        <DropdownItem className={css.dropdownItem} {...props} />
    ) : (
        <ReactStrapButton className={css.actionButton} {...props} />
    )
}

const connector = connect(null, {executeAction})

export default connector(memo(Button)) as FC<Props>

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
