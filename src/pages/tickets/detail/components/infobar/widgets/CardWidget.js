import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {renderTemplate} from '../utils'

import InfobarWidget from '../InfobarWidget'

class CardWidget extends React.Component {
    _dragOrDropCard = (e) => {
        const {widget, editing} = this.props

        const ap = widget.get('absolutePath')
        const tp = widget.get('templatePath')

        e.stopPropagation()
        if (editing) {
            if (editing.isDragging) {
                if (editing.canDrop(ap, tp)) {
                    editing.actions.drop(ap, tp)
                }
            } else {
                editing.actions.drag(ap)
            }
        }
    }

    _deleteCard = (e) => {
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
            isParentList,
            source,
            widget,
            editing
        } = this.props

        const ap = widget.get('absolutePath')
        const tp = widget.get('templatePath')

        const className = classnames({
            ui: true,
            card: true,
            droppable: editing && editing.canDrop(ap, tp)
        })

        return (
            <div className={className}
                 onClick={this._dragOrDropCard}
            >
                <div className="content">
                    {
                        (widget.get('title') || isEditing) && (
                            <div className="header clearfix">
                                {
                                    renderTemplate(widget.get('title', ''), source.toJS())
                                }
                                {
                                    isEditing && !isParentList && (
                                        <span style={{float: 'right'}}>
                                            <i
                                                className="red link remove icon"
                                                onClick={this._deleteCard}
                                            />
                                        </span>
                                    )
                                }
                            </div>
                        )
                    }
                    <div>
                        {
                            widget
                                .get('widgets', fromJS([]))
                                .map((w, i) => {
                                    const passedWidget = w
                                        .set('templatePath', `${tp}.widgets.${i}`)

                                    return (
                                        <InfobarWidget
                                            key={i}
                                            source={source}
                                            parent={widget}
                                            widget={passedWidget}
                                            editing={editing}
                                        />
                                    )
                                })
                        }
                    </div>
                </div>
            </div>
        )
    }
}

CardWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isParentList: PropTypes.bool.isRequired
}

CardWidget.defaultProps = {
    isEditing: false,
    isParentList: false
}

export default CardWidget
