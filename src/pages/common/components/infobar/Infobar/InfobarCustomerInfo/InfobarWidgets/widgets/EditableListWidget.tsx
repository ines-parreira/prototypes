import React, {useContext, useState, useMemo} from 'react'
import PropTypes from 'prop-types'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS} from 'immutable'
import _uniqueId from 'lodash/uniqueId'

import MultiSelectOptionsField from '../../../../../../forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {getActiveCustomerId} from '../../../../../../../../state/customers/selectors'
import {getCurrentAccountState} from '../../../../../../../../state/currentAccount/selectors'
import {isEditing} from '../../../../../../../../state/widgets/selectors'
import {executeAction} from '../../../../../../../../state/infobar/actions'
import {RootState} from '../../../../../../../../state/types'

import * as segmentTracker from '../../../../../../../../store/middlewares/segmentTracker.js'
import Tooltip from '../../../../../Tooltip'

import {ShopifyActionType} from './shopify/types'
import {ActionButtonContext} from './ActionButton'

type OwnProps = {
    selectedOptions: string
}

type Context = {
    integrationId: number
    data_source: string
    widget_resource_ids: IWidgetRessources
}

interface IWidgetRessources {
    target_id: number
    customer_id?: number
}

interface ISelectedValues {
    label: string
    value: string
}

export function EditableListWidget(
    {
        selectedOptions,
        executeAction,
        activeCustomerId,
        currentAccount,
        widgetIsEditing,
    }: OwnProps & ConnectedProps<typeof connector>,
    {integrationId, data_source, widget_resource_ids}: Context
) {
    const [selectedValues, setSelectedValues] = useState(fromJS([]))
    const [syncedValues, setSyncedValues] = useState('')

    const {actionError} = useContext(ActionButtonContext)

    const tooltipTargetID = useMemo(
        () => _uniqueId('editable-list-') + '-tooltip-target',
        []
    )

    const _updateState = (selectedOptions: string) => {
        let formatedValues: Array<ISelectedValues> = []
        if (selectedOptions.length)
            formatedValues = selectedOptions.split(',').map((k: string) => {
                const val = k.trim()
                return {label: val, value: val}
            })
        setSelectedValues(formatedValues)
        setSyncedValues(selectedOptions)
    }

    useMemo(() => _updateState(selectedOptions), [selectedOptions])

    const notEditable = useMemo(() => !!actionError || widgetIsEditing, [])

    const _onTagsChange = (tags: Array<ISelectedValues>) => {
        setSelectedValues(tags)
    }
    const _onFocus = () => {
        if (data_source === 'Customer') {
            segmentTracker.logEvent(
                segmentTracker.EVENTS.SHOPIFY_EDIT_CUSTOMER_TAG_SELECT,
                {
                    account_id: currentAccount.get('domain'),
                    customer_id: widget_resource_ids?.target_id,
                }
            )
        } else if (data_source === 'Order') {
            segmentTracker.logEvent(
                segmentTracker.EVENTS.SHOPIFY_EDIT_ORDER_TAG_EDIT_STARTED,
                {
                    account_id: currentAccount.get('domain'),
                    order_id: widget_resource_ids?.target_id,
                    customer_id: widget_resource_ids?.customer_id,
                }
            )
        }
    }
    const _submitChanges = () => {
        let tagsListStr = ''
        const iterablesValues: Array<ISelectedValues> = selectedValues
        iterablesValues?.forEach(function (
            selectedValue: ISelectedValues,
            i: number
        ) {
            tagsListStr += selectedValue.value
            if (i !== iterablesValues?.length - 1) tagsListStr += ', '
        })

        if (!integrationId || syncedValues === tagsListStr) return

        let action, payload
        switch (data_source) {
            case 'Order':
                action = ShopifyActionType.UpdateOrderTags
                payload = {
                    tags_list: tagsListStr,
                    order_id: widget_resource_ids?.target_id,
                }
                break
            case 'Customer':
                action = ShopifyActionType.UpdateCustomerTags
                payload = {tags_list: tagsListStr}
                break
            default:
                break
        }

        if (!action) return
        void executeAction(
            action,
            integrationId?.toString(),
            activeCustomerId?.toString(),
            payload
        )
        setSyncedValues(tagsListStr)
    }

    return (
        <div id={tooltipTargetID}>
            <MultiSelectOptionsField
                selectedOptions={selectedValues}
                plural="tags"
                singular="tag"
                onChange={_onTagsChange}
                onFocus={_onFocus}
                onBlur={_submitChanges}
                isDisabled={notEditable}
                allowCustomOptions
                matchInput
            />
            {notEditable && !widgetIsEditing && (
                <Tooltip placement="top" target={tooltipTargetID}>
                    {actionError}
                </Tooltip>
            )}
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        activeCustomerId: getActiveCustomerId(state),
        currentAccount: getCurrentAccountState(state),
        widgetIsEditing: isEditing(state),
    }),
    {
        executeAction,
    }
)

EditableListWidget.contextTypes = {
    integrationId: PropTypes.number.isRequired,
    data_source: PropTypes.string.isRequired,
    widget_resource_ids: PropTypes.object.isRequired,
}

export default connector(EditableListWidget)
