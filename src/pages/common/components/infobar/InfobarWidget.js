import React from 'react'
import PropTypes from 'prop-types'
import _isObject from 'lodash/isObject'
import _isFunction from 'lodash/isFunction'
import {fromJS} from 'immutable'

import {prepareWidgetToDisplay, guessFieldValueFromRawData} from './utils'

import ListInfobarWidget from './widgets/ListInfobarWidget'
import WrapperInfobarWidget from './widgets/WrapperInfobarWidget'
import CardInfobarWidget from './widgets/CardInfobarWidget'
import FieldInfobarWidget from './widgets/FieldInfobarWidget'

import shopify from './widgets/shopify'
import recharge from './widgets/recharge'

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
            open
        } = this.props

        // prevent buggy display if source...
        // ... is empty
        if (!source) {
            return null
        }

        // ... is not an object
        if (!_isObject(source)) {
            return null
        }

        // ... is not immutable
        if (!source.isEmpty || (source.isEmpty && !_isFunction(source.isEmpty))) {
            return null
        }

        // ... is an empty Immutable
        if (source.isEmpty()) {
            return null
        }

        const preparedData = prepareWidgetToDisplay(template, source, parent)
        const {updatedTemplate, type} = preparedData
        let {data} = preparedData

        const isParentList = parent && parent.get('type') === 'list'

        let extension = {}
        const passedData = {
            template: updatedTemplate,
            isEditing,
            source: data || fromJS({}),
        }

        if (widget.get('type') === 'shopify') {
            extension = {
                ...extension,
                ...shopify(passedData),
            }
        } else if (widget.get('type') === 'recharge') {
            extension = {
                ...extension,
                ...recharge(passedData),
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
                data = data || fromJS({})

                // do not display card if there is no data to display in it
                if (!isEditing && data.isEmpty()) {
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
                return (
                    <div className="divider" />
                )
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
