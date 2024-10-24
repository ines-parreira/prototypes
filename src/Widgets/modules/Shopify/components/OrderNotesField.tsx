import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {
    ChangeEvent,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {getCurrentDomain} from 'state/currentAccount/selectors'
import {getActiveCustomerId} from 'state/customers/selectors'
import {executeAction} from 'state/infobar/actions'
import {isEditing} from 'state/widgets/selectors'

import {FieldCustomization} from 'Widgets/modules/Template/types'

import {ShopifyContext} from '../contexts/ShopifyContext'
import {ShopifyActionType} from '../types'
import css from './OrderNotesField.less'

type Props = {
    source: string
}

export function OrderNotesField({source}: Props) {
    const [value, setValue] = useState<string>(source)
    const [submittedValue, setSubmittedValue] = useState<string>(source)

    const {integrationId} = useContext(IntegrationContext)
    const {widget_resource_ids} = useContext(ShopifyContext)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const activeCustomerId = useAppSelector(getActiveCustomerId)
    const domain = useAppSelector(getCurrentDomain)
    const notEditable = useAppSelector(isEditing)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (textAreaRef?.current) {
            const textArea = textAreaRef.current
            textArea.style.height = '0px'
            textArea.style.height = textArea.scrollHeight + 'px'
        }
    }, [textAreaRef, value])

    const featureEnabled = useFlags()[FeatureFlagKey.ShopifyOrderNotes]
    if (!featureEnabled) {
        return <>{source ?? '-'}</>
    }

    const handleValueChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value)
    }

    const submitChanges = () => {
        if (value === submittedValue) return
        if (!integrationId) return

        const action = ShopifyActionType.ShopifyEditNoteOfOrder
        const payload = {
            note: value,
            order_id: widget_resource_ids?.target_id,
        }

        logEvent(SegmentEvent.ShopifyEditOrderNoteEditStarted, {
            account_id: domain,
            order_id: widget_resource_ids?.target_id,
            customer_id: widget_resource_ids?.customer_id,
        })

        dispatch(
            executeAction({
                actionName: action,
                integrationId,
                customerId: activeCustomerId?.toString(),
                payload,
            })
        )
        setSubmittedValue(value)
    }

    return (
        <div className={css.orderNote}>
            <div className={css.noteInputContainer}>
                <textarea
                    ref={textAreaRef}
                    className={classnames(css.noteInput)}
                    disabled={notEditable}
                    placeholder="Add note..."
                    value={String(value)}
                    onChange={handleValueChange}
                    onBlur={submitChanges}
                />
            </div>
        </div>
    )
}

export const orderNotesCustomization: FieldCustomization = {
    dataMatcher: /(integrations\.\d+\.orders\.\[]\.note$)/,
    getValue: (source) => (
        <OrderNotesField source={source ? String(source) : ''} />
    ),
    getValueString: () => null,
    editionHiddenFields: ['type'],
    valueCanOverflow: true,
}
