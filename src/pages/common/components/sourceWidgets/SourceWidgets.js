import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import SourceWidget from './SourceWidget'
import DragWrapper from '../dragging/WidgetsDragWrapper'

class SourceWidgets extends React.Component {
    render() {
        const {
            source,
            widgets,
            editing
        } = this.props

        const className = classnames('widgets-list editing', {
            dragging: editing && editing.isDragging
        })

        return (
            <div className={className}>
                <DragWrapper
                    actions={editing && editing.actions}
                    group={{
                        name: 'root',
                        pull: true,
                        put: false
                    }}
                    isEditing
                >
                    {
                        widgets
                            .map((widget) => {
                                return widget.get('template', fromJS({}))
                            })
                            .map((widget, i) => {
                                const passedWidget = widget.set('templatePath', `${i.toString()}.template`)

                                return (
                                    <SourceWidget
                                        key={`${passedWidget.get('path')}-${i}`}
                                        source={source}
                                        widget={passedWidget}
                                        editing={editing}
                                    />
                                )
                            })
                    }
                </DragWrapper>
            </div>
        )
    }
}

SourceWidgets.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired
}

SourceWidgets.defaultProps = {
    source: {},
    title: ''
}

export default SourceWidgets
