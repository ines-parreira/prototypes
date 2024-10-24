import {Tooltip} from '@gorgias/ui-kit'
import React, {useContext, useMemo, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {logEvent, SegmentEvent} from 'common/segment'
import useId from 'hooks/useId'
import {fetchShopTags} from 'models/integration/resources/shopify'
import {ShopifyTags} from 'models/integration/types'
import {ActionButtonContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButton'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getActiveCustomerId} from 'state/customers/selectors'
import {executeAction} from 'state/infobar/actions'
import {RootState} from 'state/types'
import {isEditing} from 'state/widgets/selectors'

import {ShopifyActionType} from 'Widgets/modules/Shopify/types'
import {FieldCustomization} from 'Widgets/modules/Template/types'

import {ShopifyContext} from '../contexts/ShopifyContext'

type OwnProps = {
    selectedOptions: string
}

type SelectedValues = {
    label: string
    value: string
}

export function EditableListField({
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
    const {data_source, widget_resource_ids} = useContext(ShopifyContext)

    const id = useId()
    const tooltipTargetID = 'editable-list-' + id + '-tooltip-target'

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

    const notEditable = !!actionError || widgetIsEditing

    const _onTagsChange = (tags: SelectedValues[]) => {
        setSelectedValues(tags)
    }

    const _onFocus = async () => {
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
            let tags: string[] = []
            try {
                tags = await fetchShopTags(integrationId, tagsType)
            } catch (err) {
                // silent fail
                return
            }
            setOptions(tags.map((tag) => ({label: tag, value: tag})))
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

const ConnectedEditableListField = connector(EditableListField)

export const editableListCustomization: FieldCustomization = {
    dataMatcher: /(orders\.\[]\.tags$)|(customer\.tags$)/,
    getValue: (source) =>
        typeof source === 'string' ? (
            <ConnectedEditableListField selectedOptions={source} />
        ) : (
            '-'
        ),
    getValueString: () => null,
    editionHiddenFields: ['type'],
    valueCanOverflow: true,
}
