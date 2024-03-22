import React, {useContext, ElementType} from 'react'
import {fromJS, Map, List} from 'immutable'

import {IntegrationType} from 'models/integration/constants'
import {
    guessFieldValueFromRawData,
    updateAbsolutePathAndData,
    stringifyRawData,
} from 'pages/common/components/infobar/utils'
import {EditionContext} from 'providers/infobar/EditionContext'
import {
    ShopifyContext,
    ShopifyContextType,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/ShopifyContext'
import {HiddenField} from 'Infobar/features/Card/display/CardEditForm'
import {
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    CUSTOM_WIDGET_TYPE,
} from 'state/widgets/constants'
import Card from 'Infobar/features/Card'
import Field from 'Infobar/features/Field'
import Wrapper from 'Infobar/features/Wrapper'
import ListWidget from 'Infobar/features/List'

import http from './widgets/http'
import magento2 from './widgets/magento2'
import recharge from './widgets/recharge'
import shopify from './widgets/shopify'
import smile from './widgets/smile'
import yotpo from './widgets/yotpo'
import bigcommerce from './widgets/bigcommerce'
import woocommerce from './widgets/woocommerce'
import {infobarWidgetShouldRender} from './predicates'
import {WidgetProps} from './widgetReference'
import {WidgetContext} from './WidgetContext'

export default function InfobarWidget({
    parent,
    source,
    template,
    isOpen = false,
    hasNoBorderTop = false,
}: WidgetProps) {
    const {isEditing} = useContext(EditionContext)
    const widget = useContext(WidgetContext)
    if (!infobarWidgetShouldRender(source)) {
        return null
    }

    const preparedData = updateAbsolutePathAndData(template, source, parent)
    const {updatedTemplate} = preparedData
    let {data} = preparedData
    const type = updatedTemplate.type

    const isParentList = (parent && parent.type === 'list') || false
    const extensionMethodsByType = {
        [IntegrationType.Shopify]: shopify,
        [IntegrationType.Recharge]: recharge,
        [IntegrationType.Smile]: smile,
        [IntegrationType.Magento2]: magento2,
        [IntegrationType.Http]: http,
        [IntegrationType.Yotpo]: yotpo,
        [IntegrationType.BigCommerce]: bigcommerce,
        [IntegrationType.Klaviyo]: undefined,
        [WOOCOMMERCE_WIDGET_TYPE]: woocommerce,
        [CUSTOM_WIDGET_TYPE]: undefined,
        [CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE]: undefined,
        [STANDALONE_WIDGET_TYPE]: undefined,
    }

    const passedData = {
        template: updatedTemplate,
        isEditing,
        source: data,
    }

    let extension: {
        AfterTitle?: ElementType
        BeforeContent?: ElementType
        AfterContent?: ElementType
        TitleWrapper?: ElementType
        Wrapper?: ElementType
        editionHiddenFields?: HiddenField[]
    } = {}
    const extensionMethod = extensionMethodsByType[widget.type]
    if (extensionMethod) {
        extension = extensionMethod(passedData as any)
    }

    // Setting context
    let data_source = '' // type of object we are editing in widget, e.g. Customer | Order ...
    let widget_resource_ids: ShopifyContextType['widget_resource_ids'] = {
        target_id: null,
        customer_id: null,
    }
    /*
            Provide proper context to children
            For Shopify widget :
            - data_source is either Customer or Order
            - widget_resource_ids always has shopify customer_id because we need it for tracking and
            target_id is either a customer_id or an order_id depending of the Shopify card targeted
            (an Order or a Customer). target_id maybe is equal to customer_id in Shopify customer card
        */
    const data_source_endpoint =
        source && source.get && source.get('admin_graphql_api_id')
    if (data_source_endpoint) {
        const reg = new RegExp(/gid:\/\/shopify\/(?<type>\w+)\/[0-9]+/g)
        const match = reg.exec(data_source_endpoint as string)

        //extract the type Customer or Order from data_source_endpoint
        if (match?.length === 2) data_source = match[1]

        widget_resource_ids = {
            target_id: source?.get('id') as number,
            customer_id: source?.getIn(['customer', 'id']),
        }
    }

    // DISPLAY
    let component = null
    switch (updatedTemplate.type) {
        case 'wrapper': {
            component = (
                <Wrapper
                    source={data || fromJS({})}
                    template={updatedTemplate}
                />
            )
            break
        }
        case 'list': {
            component = (
                <ListWidget
                    isEditing={isEditing}
                    isParentList={isParentList}
                    source={
                        (data || fromJS([])) as unknown as List<
                            Map<string, unknown>
                        >
                    }
                    template={updatedTemplate}
                    hasNoBorderTop={hasNoBorderTop}
                />
            )
            break
        }
        case 'card': {
            data = fromJS(data || {})
            if (widget.type !== STANDALONE_WIDGET_TYPE) {
                if (!Map.isMap(data)) {
                    return null
                }
                // do not display card if there is no data to display in it
                if (!isEditing && data?.isEmpty()) {
                    return null
                }
            }

            component = (
                <Card
                    isEditing={isEditing}
                    isParentList={isParentList}
                    source={data}
                    template={updatedTemplate}
                    parent={parent}
                    isOpen={isOpen || !isParentList}
                    hasNoBorderTop={hasNoBorderTop}
                    extensions={extension}
                    editionHiddenFields={extension.editionHiddenFields}
                />
            )
            break
        }
        default: {
            component = (
                <Field
                    isEditing={isEditing}
                    type={type}
                    value={guessFieldValueFromRawData(data, type, widget.type)}
                    template={updatedTemplate}
                    copyableValue={stringifyRawData(data, type)}
                />
            )
        }
    }

    return (
        <ShopifyContext.Provider
            value={{
                data_source: data_source,
                widget_resource_ids: widget_resource_ids,
            }}
        >
            {component}
        </ShopifyContext.Provider>
    )
}
