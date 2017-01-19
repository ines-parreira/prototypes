import React, {PropTypes} from 'react'
import InfobarWidget from './InfobarWidget'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import DragWrapper from '../dragging/WidgetsDragWrapper'
import {canDisplayWidget} from './utils'
import {getSourcePathFromContext} from '../../../../state/widgets/utils'

class InfobarWidgets extends React.Component {
    render() {
        const {
            source,
            widgets,
            editing
        } = this.props

        if (!widgets) {
            return null
        }

        const isEditing = !!(editing && editing.isEditing)

        const className = classnames('widgets-list', {
            editing: isEditing,
            dragging: !!(editing && editing.isDragging)
        })

        return (
            <div className={className}>
                <DragWrapper
                    actions={editing && editing.actions}
                    sort
                    group={{
                        name: 'root',
                        pull: false,
                        put: true
                    }}
                    isEditing={isEditing}
                    watchDrop
                >
                    {
                        widgets
                            .map((widget, i) => {
                                let passedWidget = widget
                                    .get('template', fromJS({}))
                                    .set('templatePath', `${i}.template`)

                                // if no path is set, use the configuration one
                                if (!passedWidget.get('path')) {
                                    const sourcePath = getSourcePathFromContext(widget.get('context'), widget.get('type'))
                                    passedWidget = passedWidget.set('path', sourcePath)
                                }

                                if (!canDisplayWidget(passedWidget, source)) {
                                    return null
                                }

                                return (
                                    <InfobarWidget
                                        key={`${widget.get('order')}-${i}`}
                                        source={source}
                                        widget={passedWidget}
                                        editing={editing}
                                        isEditing={isEditing}
                                    />
                                )
                            })
                    }
                </DragWrapper>
            </div>
        )
    }
}

InfobarWidgets.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired
}

InfobarWidgets.defaultProps = {
    source: {},
}

export default InfobarWidgets
