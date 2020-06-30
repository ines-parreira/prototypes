import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'

import {prepareWidgetToDisplay, displayLabel} from '../infobar/utils'

import ListSourceWidget from './widgets/ListSourceWidget'
import CardSourceWidget from './widgets/CardSourceWidget'
import WrapperSourceWidget from './widgets/WrapperSourceWidget'

class SourceWidget extends React.Component {
    render() {
        const {parent, source, widget, template, editing} = this.props

        const {updatedTemplate, data, type, path} = prepareWidgetToDisplay(
            template,
            source,
            parent
        )

        const isParentList = parent && parent.get('type') === 'list'

        // DISPLAY
        switch (type) {
            case 'wrapper': {
                return (
                    <WrapperSourceWidget
                        source={data || fromJS({})}
                        widget={widget}
                        template={updatedTemplate}
                        editing={editing}
                        parent={parent}
                    />
                )
            }
            case 'list': {
                return (
                    <ListSourceWidget
                        isParentList={isParentList}
                        source={data || fromJS({})}
                        widget={widget}
                        template={updatedTemplate}
                        editing={editing}
                    />
                )
            }
            case 'card': {
                return (
                    <CardSourceWidget
                        isParentList={isParentList}
                        source={data || fromJS({})}
                        widget={widget}
                        template={updatedTemplate}
                        editing={editing}
                    />
                )
            }
            default:
        }

        return (
            <div className="simple-field draggable" data-key={path}>
                <span className="field-label">{path}:</span>
                <span className="field-value">{displayLabel(data)}</span>
            </div>
        )
    }
}

SourceWidget.propTypes = {
    editing: PropTypes.object,
    parent: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
}

export default SourceWidget
