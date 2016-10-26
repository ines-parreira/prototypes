import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import DragWrapper from '../../dragging/WidgetsDragWrapper'

import InfobarWidget from '../InfobarWidget'

class WrapperInfobarWidget extends React.Component {
    _deleteWrapper = (e) => {
        const {widget, editing} = this.props

        const ap = widget.get('absolutePath')
        const tp = widget.get('templatePath')

        e.stopPropagation()
        if (editing) {
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    render() {
        const {
            isEditing,
            source,
            widget,
            editing
        } = this.props

        const ap = widget.get('absolutePath')
        const tp = widget.get('templatePath')

        return (
            <div className="ui card wrapper draggable">
                <div className="content">
                    {
                        isEditing
                        && (
                            <div className="header clearfix">
                                {
                                    isEditing
                                    && (
                                        <span className="tools">
                                            <i
                                                className="red link remove icon"
                                                onClick={this._deleteWrapper}
                                            />
                                        </span>
                                    )
                                }
                            </div>
                        )
                    }

                    <DragWrapper
                        actions={editing && editing.actions}
                        sort
                        group={{
                            name: ap,
                            pull: false,
                            put: true
                        }}
                        templatePath={tp}
                        isEditing={isEditing}
                        watchDrop
                    >
                        {
                            widget
                                .get('widgets', fromJS([]))
                                .map((w, i) => {
                                    const passedWidget = w
                                        .set('templatePath', `${tp}.widgets.${i}`)

                                    return (
                                        <InfobarWidget
                                            key={`${passedWidget.get('path')}-${i}`}
                                            source={source}
                                            parent={widget}
                                            widget={passedWidget}
                                            editing={editing}
                                            isEditing={isEditing}
                                        />
                                    )
                                })
                        }
                    </DragWrapper>
                </div>
            </div>
        )
    }
}

WrapperInfobarWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired
}

export default WrapperInfobarWidget
