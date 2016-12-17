import React, {PropTypes} from 'react'
import _ from 'lodash'
import {fromJS} from 'immutable'
import {prepareWidgetToDisplay, guessFieldValueFromRawData} from './utils'

import ListInfobarWidget from './widgets/ListInfobarWidget'
import WrapperInfobarWidget from './widgets/WrapperInfobarWidget'
import CardInfobarWidget from './widgets/CardInfobarWidget'
import FieldInfobarWidget from './widgets/FieldInfobarWidget'

class InfobarWidget extends React.Component {
    render() {
        const {
            parent,
            source,
            widget,
            editing,
            isEditing
        } = this.props

        // prevent buggy display if source...
        // ... is empty
        if (!source) {
            return null
        }

        // ... is not an object
        if (!_.isObject(source)) {
            return null
        }

        // ... is not immutable
        if (!source.isEmpty || (source.isEmpty && !_.isFunction(source.isEmpty))) {
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

InfobarWidget.propTypes = {
    editing: PropTypes.object,
    parent: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired
}

export default InfobarWidget
