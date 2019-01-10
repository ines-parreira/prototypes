import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import SourceWidget from './SourceWidget'
import DragWrapper from '../dragging/WidgetsDragWrapper'

class SourceWidgets extends React.Component {
    render() {
        const {
            source,
            widgets,
            editing,
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
                            .map((widget, i) => {
                                let passedTemplate = widget
                                    .get('template', fromJS({}))
                                    .set('templatePath', `${widget.get('order').toString()}.template`)

                                const sourcePath = widget.get('sourcePath')
                                passedTemplate = passedTemplate.set('path', sourcePath)

                                return (
                                    <SourceWidget
                                        key={`${passedTemplate.get('path')}-${i}`}
                                        source={source}
                                        widget={widget}
                                        template={passedTemplate}
                                        editing={editing}
                                        parent={widget}
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
