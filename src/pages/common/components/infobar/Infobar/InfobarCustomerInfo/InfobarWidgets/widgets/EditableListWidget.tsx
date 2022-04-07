import React, {useContext, useMemo, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import _uniqueId from 'lodash/uniqueId'

import {reportError} from 'utils/errors'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {getActiveCustomerId} from 'state/customers/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {isEditing} from 'state/widgets/selectors'
import {executeAction} from 'state/infobar/actions'
import {RootState} from 'state/types'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import Tooltip from 'pages/common/components/Tooltip'
import {WidgetContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/WidgetContext'

import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'
import {ActionButtonContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButton'
import {IntegrationContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'
import {getOptionsFromTags} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/utils'
import {ShopifyActionType} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/types'
import {ShopifyTags} from 'models/integration/types'
import {fetchShopTags} from 'models/integration/resources/shopify'
import {getLoggerOnTagSelectionEvent} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/logEventData'

type OwnProps = {
    selectedOptions: string
}

type SelectedValues = {
    label: string
    value: string
}

export function EditableListWidget({
    selectedOptions,
    executeAction,
    activeCustomerId,
    currentAccount,
    widgetIsEditing,
}: OwnProps & ConnectedProps<typeof connector>) {
    const [selectedValues, setSelectedValues] = useState<SelectedValues[]>([])
    const [syncedValues, setSyncedValues] = useState('')
    const [options, setOptions] = useState<Option[]>([])

    const {actionError} = useContext(ActionButtonContext)
    const {integrationId} = useContext(IntegrationContext)
    const {data_source, widget_resource_ids} = useContext(WidgetContext)

    const tooltipTargetID = useMemo(
        () => _uniqueId('editable-list-') + '-tooltip-target',
        []
    )

    const _updateState = (selectedOptions: string) => {
        let formatedValues: SelectedValues[] = []
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

    const _onTagsChange = (tags: SelectedValues[]) => {
        setSelectedValues(tags)
    }

    const _onFocus = () => {
        let tagsType = null

        if (data_source === 'Customer') {
            tagsType = ShopifyTags.customers
            logEvent(SegmentEvent.ShopifyEditCustomerTagSelect, {
                account_id: currentAccount.get('domain'),
                customer_id: widget_resource_ids?.target_id,
            })
        } else if (data_source === 'Order') {
            tagsType = ShopifyTags.orders
            logEvent(SegmentEvent.ShopifyEditOrderTagEditStarted, {
                account_id: currentAccount.get('domain'),
                order_id: widget_resource_ids?.target_id,
                customer_id: widget_resource_ids?.customer_id,
            })
        }

        if (integrationId && tagsType) {
            try {
                fetchShopTags(integrationId, tagsType)
                    .then((tags) => {
                        const tagsOptions: Option[] = getOptionsFromTags(tags)
                        setOptions(tagsOptions)
                    })
                    .catch((err) => {
                        reportError(err)
                    })
            } catch (err) {
                reportError(err)
            }
        }
    }

    const _submitChanges = () => {
        let tagsListStr = ''
        selectedValues.forEach((selectedValue, i) => {
            tagsListStr += selectedValue.value
            if (i !== selectedValues.length - 1) tagsListStr += ', '
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
        executeAction({
            actionName: action,
            integrationId,
            customerId: activeCustomerId?.toString(),
            payload,
        })
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
                options={options}
                onSelectTag={
                    data_source === 'Customer'
                        ? getLoggerOnTagSelectionEvent(
                              {
                                  account_id: currentAccount.get('domain'),
                                  customer_id:
                                      widget_resource_ids?.customer_id ||
                                      widget_resource_ids?.target_id,
                                  order_id: null,
                              },
                              SegmentEvent.ShopifyEditCustomerTagsSuggestionUsed
                          )
                        : getLoggerOnTagSelectionEvent(
                              {
                                  account_id: currentAccount.get('domain'),
                                  customer_id: widget_resource_ids?.customer_id,
                                  order_id: widget_resource_ids?.target_id,
                              },
                              SegmentEvent.ShopifyEditOrderTagsSuggestionUsed
                          )
                }
                allowCustomOptions
                matchInput
                isCompact
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

export default connector(EditableListWidget)
