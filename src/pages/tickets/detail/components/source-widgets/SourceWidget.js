import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {prepareWidgetToDisplay} from '../infobar/utils'

import ListSourceWidget from './widgets/ListSourceWidget'
import CardSourceWidget from './widgets/CardSourceWidget'
import WrapperSourceWidget from './widgets/WrapperSourceWidget'

class SourceWidget extends React.Component {
    render() {
        const {
            parent,
            source,
            widget,
            editing
        } = this.props

        const {updatedWidget, data, type, path} = prepareWidgetToDisplay(widget, source, parent)

        const isParentList = parent && parent.get('type') === 'list'


        // DISPLAY
        switch (type) {
            case 'wrapper': {
                return (
                    <WrapperSourceWidget
                        source={data || fromJS({})}
                        widget={updatedWidget}
                        editing={editing}
                    />
                )
            }
            case 'list': {
                return (
                    <ListSourceWidget
                        isParentList={isParentList}
                        source={data || fromJS({})}
                        widget={updatedWidget}
                        editing={editing}
                    />
                )
            }
            case 'card': {
                return (
                    <CardSourceWidget
                        isParentList={isParentList}
                        source={data || fromJS({})}
                        widget={updatedWidget}
                        editing={editing}
                    />
                )
            }
            default:
        }

        return (
            <div
                className="simple-field draggable"
                data-key={path}
            >
                <span className="field-label">
                    {path}:
                </span>
                <span className="field-value">
                    {data}
                </span>
            </div>
        )
    }
}

SourceWidget.propTypes = {
    editing: PropTypes.object,
    parent: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired
}

export default SourceWidget
