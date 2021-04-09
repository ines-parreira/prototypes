import React from 'react'
import PropTypes from 'prop-types'
import {fromJS, Map} from 'immutable'

import {
    HTTP_WIDGET_TYPE,
    MAGENTO2_WIDGET_TYPE,
    RECHARGE_WIDGET_TYPE,
    SHOPIFY_WIDGET_TYPE,
    SMILE_WIDGET_TYPE,
    SMOOCH_INSIDE_WIDGET_TYPE,
    YOTPO_WIDGET_TYPE,
} from '../../../../../../../state/widgets/constants'
import {
    guessFieldValueFromRawData,
    prepareWidgetToDisplay,
} from '../../../utils'

import ListInfobarWidget from './widgets/ListInfobarWidget'
import WrapperInfobarWidget from './widgets/WrapperInfobarWidget'
import CardInfobarWidget from './widgets/CardInfobarWidget'
import FieldInfobarWidget from './widgets/FieldInfobarWidget'

import http from './widgets/http'
import magento2 from './widgets/magento2'
import recharge from './widgets/recharge'
import shopify from './widgets/shopify'
import smile from './widgets/smile'
import smoochInside from './widgets/smoochInside'
import yotpo from './widgets/yotpo'
import {infobarWidgetShouldRender} from './predicates'

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
            source,
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
        }

        let extension = {}
        const passedData = {
            template: updatedTemplate,
            isEditing,
            source: data || fromJS({}),
        }

        const extensionMethod = extensionMethodsByType[widget.get('type')]
        if (extensionMethod) {
            extension = {
                ...extension,
                ...extensionMethod(passedData),
            }
        }

        // DISPLAY
        switch (type) {
            case 'wrapper': {
                return (
                    <WrapperInfobarWidget
                        isEditing={isEditing}
                        source={data || fromJS({})}
                        widget={widget}
                        template={updatedTemplate}
                        editing={editing}
                    />
                )
            }
            case 'list': {
                return (
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
            }
            case 'card': {
                data = fromJS(data || {})

                // do not display card if there is no data to display in it
                if (!isEditing && (!Map.isMap(data) || data.isEmpty())) {
                    return null
                }

                return (
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
            }
            case 'divider': {
                return <div className="divider" />
            }
            default:
        }

        return (
            <FieldInfobarWidget
                isEditing={isEditing}
                isParentList={isParentList}
                value={guessFieldValueFromRawData(data, type)}
                widget={widget}
                template={updatedTemplate}
                editing={editing}
            />
        )
    }
}
