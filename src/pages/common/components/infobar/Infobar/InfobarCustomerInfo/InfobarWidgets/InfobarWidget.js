import React from 'react'
import PropTypes from 'prop-types'
import {fromJS, Map} from 'immutable'

import {
    guessFieldValueFromRawData,
    prepareWidgetToDisplay,
} from '../../../utils.tsx'

import ListInfobarWidget from './widgets/ListInfobarWidget'
import WrapperInfobarWidget from './widgets/WrapperInfobarWidget.tsx'
import CardInfobarWidget from './widgets/CardInfobarWidget'
import FieldInfobarWidget from './widgets/FieldInfobarWidget'

import http from './widgets/http'
import magento2 from './widgets/magento2'
import recharge from './widgets/recharge/index.ts'
import shopify from './widgets/shopify/index.ts'
import smile from './widgets/smile/index.ts'
import smoochInside from './widgets/smoochInside/index.ts'
import yotpo from './widgets/yotpo/index.ts'
import klaviyo from './widgets/klaviyo'
import {WidgetContext} from './WidgetContext.ts'
import {infobarWidgetShouldRender} from './predicates.ts'

import {
    HTTP_WIDGET_TYPE,
    MAGENTO2_WIDGET_TYPE,
    RECHARGE_WIDGET_TYPE,
    SHOPIFY_WIDGET_TYPE,
    SMILE_WIDGET_TYPE,
    SMOOCH_INSIDE_WIDGET_TYPE,
    YOTPO_WIDGET_TYPE,
    KLAVIYO_WIDGET_TYPE,
} from 'state/widgets/constants.ts'

export default class InfobarWidget extends React.Component {
    static propTypes = {
        editing: PropTypes.object,
        parent: PropTypes.object,
        source: PropTypes.object.isRequired,
        widget: PropTypes.object.isRequired,
        template: PropTypes.object.isRequired,
        isEditing: PropTypes.bool.isRequired,
        open: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        open: false,
    }

    render() {
        const {
            parent,
            source = fromJS({}),
            widget,
            template,
            editing,
            isEditing,
            open,
        } = this.props

        if (!infobarWidgetShouldRender(source)) {
            return null
        }

        const preparedData = prepareWidgetToDisplay(template, source, parent)
        const {updatedTemplate, type} = preparedData
        let {data} = preparedData

        const isParentList = parent && parent.get('type') === 'list'
        const extensionMethodsByType = {
            [SHOPIFY_WIDGET_TYPE]: shopify,
            [RECHARGE_WIDGET_TYPE]: recharge,
            [SMILE_WIDGET_TYPE]: smile,
            [MAGENTO2_WIDGET_TYPE]: magento2,
            [SMOOCH_INSIDE_WIDGET_TYPE]: smoochInside,
            [HTTP_WIDGET_TYPE]: http,
            [YOTPO_WIDGET_TYPE]: yotpo,
            [KLAVIYO_WIDGET_TYPE]: klaviyo,
        }

        const passedData = {
            template: updatedTemplate,
            isEditing,
            source: data,
        }

        let extension = {}
        const extensionMethod = extensionMethodsByType[widget.get('type')]
        if (extensionMethod) {
            extension = extensionMethod(passedData)
        }

        // Setting context
        let data_source = '' // type of object we are editing in widget, e.g. Customer | Order ...
        let widget_resource_ids = {}
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
            const match = reg.exec(data_source_endpoint)

            //extract the type Customer or Order from data_source_endpoint
            if (match.length === 2) data_source = match[1]

            widget_resource_ids = {
                target_id: source.get('id'),
                customer_id: source.getIn(['customer', 'id']),
            }
        }

        // DISPLAY
        let component = null
        switch (type) {
            case 'wrapper': {
                component = (
                    <WrapperInfobarWidget
                        isEditing={isEditing}
                        source={data || fromJS({})}
                        widget={widget}
                        template={updatedTemplate}
                        editing={editing}
                    />
                )
                break
            }
            case 'list': {
                component = (
                    <ListInfobarWidget
                        isEditing={isEditing}
                        isParentList={isParentList}
                        source={data || fromJS({})}
                        widget={widget}
                        template={updatedTemplate}
                        editing={editing}
                        open={open}
                    />
                )
                break
            }
            case 'card': {
                data = fromJS(data || {})

                if (!Map.isMap(data)) {
                    return null
                }
                // do not display card if there is no data to display in it
                if (!isEditing && data.isEmpty()) {
                    return null
                }

                component = (
                    <CardInfobarWidget
                        isEditing={isEditing}
                        isParentList={isParentList}
                        source={data}
                        widget={widget}
                        template={updatedTemplate}
                        editing={editing}
                        parent={parent}
                        open={open || !isParentList}
                        {...extension}
                    />
                )
                break
            }
            case 'divider': {
                component = <div className="divider" />
                break
            }
            default: {
                component = (
                    <FieldInfobarWidget
                        isEditing={isEditing}
                        isParentList={isParentList}
                        value={guessFieldValueFromRawData(
                            data,
                            type,
                            widget.get('type')
                        )}
                        widget={widget}
                        template={updatedTemplate}
                        editing={editing}
                    />
                )
            }
        }

        return (
            <WidgetContext.Provider
                value={{
                    data_source: data_source,
                    widget_resource_ids: widget_resource_ids,
                }}
            >
                {component}
            </WidgetContext.Provider>
        )
    }
}
