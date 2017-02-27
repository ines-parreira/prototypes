import React, {PropTypes} from 'react'
import _isObject from 'lodash/isObject'
import _isFunction from 'lodash/isFunction'
import {fromJS} from 'immutable'
import {prepareWidgetToDisplay, guessFieldValueFromRawData} from './utils'

import ListInfobarWidget from './widgets/ListInfobarWidget'
import WrapperInfobarWidget from './widgets/WrapperInfobarWidget'
import CardInfobarWidget from './widgets/CardInfobarWidget'
import FieldInfobarWidget from './widgets/FieldInfobarWidget'

export default class InfobarWidget extends React.Component {
    static propTypes = {
        editing: PropTypes.object,
        parent: PropTypes.object,
        source: PropTypes.object.isRequired,
        widget: PropTypes.object.isRequired,
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

        const {updatedWidget, data, type} = prepareWidgetToDisplay(widget, source, parent)

        const isParentList = parent && parent.get('type') === 'list'

        // DISPLAY
        switch (type) {
            case 'wrapper': {
                return (
                    <WrapperInfobarWidget
                        isEditing={isEditing}
                        source={data || fromJS({})}
                        widget={updatedWidget}
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
                        widget={updatedWidget}
                        editing={editing}
                        open={open}
                    />
                )
            }
            case 'card': {
                return (
                    <CardInfobarWidget
                        isEditing={isEditing}
                        isParentList={isParentList}
                        source={data || fromJS({})}
                        widget={updatedWidget}
                        editing={editing}
                        parent={parent}
                        open={open || !isParentList}
                    />
                )
            }
            case 'divider': {
                return (
                    <div className="ui divider"></div>
                )
            }
            default:
        }

        return (
            <FieldInfobarWidget
                isEditing={isEditing}
                isParentList={isParentList}
                value={guessFieldValueFromRawData(data, type)}
                widget={updatedWidget}
                editing={editing}
            />
        )
    }
}
