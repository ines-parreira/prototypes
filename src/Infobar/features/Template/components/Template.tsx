import React, {useContext, useMemo} from 'react'

import {
    Template as TemplateType,
    isSourceRecord,
    Source,
    isSourceArray,
} from 'models/widget/types'
import {EditionContext} from 'providers/infobar/EditionContext'
import Card from 'Infobar/features/Card'
import Field from 'Infobar/features/Field'
import Wrapper from 'Infobar/features/Wrapper'
import List from 'Infobar/features/List'
import {
    ShopifyContext,
    ShopifyContextType,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/ShopifyContext'
import {WidgetContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/WidgetContext'
import {
    guessFieldValueFromRawData,
    stringifyRawData,
} from 'pages/common/components/infobar/utils'
import {STANDALONE_WIDGET_TYPE} from 'state/widgets/constants'

import {seekNextValues} from '../helpers/iterator'
import {getExtensions} from '../helpers/extensions'

type Props = {
    parentTemplate?: TemplateType
    template: TemplateType | null
    source?: Source
    isFirstOfList?: boolean
}

// Only way to test recursion with jest is to spyOn an object
// which holds the function to be called
export const self = {
    Template: Template,
}

export function Template({
    parentTemplate,
    template,
    source,
    isFirstOfList,
}: Props) {
    const {isEditing} = useContext(EditionContext)
    const widget = useContext(WidgetContext)
    const shopifyContextData = useShopifyContextData(source)

    if (!template) return null

    const extensions = getExtensions(widget.type, template)

    // DISPLAY
    let component = null

    switch (template.type) {
        case 'wrapper': {
            component = (
                <Wrapper source={source} template={template}>
                    {(template.widgets || []).map((_, index) => (
                        <self.Template
                            key={`${template.templatePath || ''}-${index}`}
                            {...seekNextValues(template, source, index)}
                        />
                    ))}
                </Wrapper>
            )
            break
        }
        case 'list': {
            if (
                !isSourceArray(source) ||
                !source.length ||
                !template.widgets?.[0]
            )
                return null

            component = (
                <List isEditing={isEditing} source={source} template={template}>
                    {(childSource: Source, index: number) => (
                        <self.Template
                            // yes, index must be 0 here, list only uses the
                            // first child template, but with different data
                            {...seekNextValues(template, childSource, 0)}
                            isFirstOfList={index === 0}
                        />
                    )}
                </List>
            )
            break
        }
        case 'card': {
            if (widget.type !== STANDALONE_WIDGET_TYPE) {
                if (!isSourceRecord(source)) {
                    return null
                }
                // do not display card if there is no data to display in it
                if (!isEditing && Object.keys(source).length === 0) {
                    return null
                }
            }

            component = (
                <Card
                    isEditing={isEditing}
                    source={source}
                    template={template}
                    parentTemplate={parentTemplate}
                    extensions={extensions}
                    editionHiddenFields={extensions.editionHiddenFields}
                    isFirstOfList={isFirstOfList}
                >
                    {template.widgets?.map((childTemplate, index) => (
                        <self.Template
                            key={`${template.templatePath || ''}-${index}`}
                            {...seekNextValues(template, source, index)}
                        />
                    ))}
                </Card>
            )
            break
        }
        default: {
            component = (
                <Field
                    isEditing={isEditing}
                    type={template.type}
                    value={guessFieldValueFromRawData(
                        source,
                        template.type,
                        widget.type
                    )}
                    template={template}
                    copyableValue={stringifyRawData(source, template.type)}
                />
            )
        }
    }

    return (
        <ShopifyContext.Provider value={shopifyContextData}>
            {component}
        </ShopifyContext.Provider>
    )
}

export default Template

function useShopifyContextData(source: Source) {
    return useMemo(() => {
        const contextData: ShopifyContextType = {
            data_source: '',
            widget_resource_ids: {
                target_id: null,
                customer_id: null,
            },
        }
        /*
                Provide proper context to children
                For Shopify widget :
                - data_source is either Customer or Order
                - widget_resource_ids always has shopify customer_id because we need it for tracking and
                target_id is either a customer_id or an order_id depending of the Shopify card targeted
                (an Order or a Customer). target_id maybe is equal to customer_id in Shopify customer card
            */

        if (!isSourceRecord(source)) return contextData
        if (!isSourceRecord(source.customer)) return contextData

        const data_source_endpoint =
            isSourceRecord(source) &&
            typeof source.admin_graphql_api_id === 'string'
                ? source.admin_graphql_api_id
                : ''
        if (data_source_endpoint) {
            const reg = new RegExp(/gid:\/\/shopify\/(?<type>\w+)\/[0-9]+/g)
            const match = reg.exec(data_source_endpoint)

            //extract the type Customer or Order from data_source_endpoint
            if (match?.length === 2) contextData.data_source = match[1]

            contextData.widget_resource_ids = {
                target_id: source.id as number,
                customer_id: source.customer.id as number,
            }
        }

        return contextData
    }, [source])
}
