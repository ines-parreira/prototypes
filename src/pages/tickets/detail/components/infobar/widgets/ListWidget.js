import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'

import InfobarWidget from '../InfobarWidget'

class ListWidget extends React.Component {
    _deleteList = (e, updatedWidget, passedWidget) => {
        const {editing} = this.props

        e.stopPropagation()
        if (editing) {
            const ap = updatedWidget.get('absolutePath')
            const tp = passedWidget.get('templatePath')
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

        const updatedWidget = widget
            .set('absolutePath', `${widget.get('absolutePath')}[]`)

        const passedWidget = updatedWidget
            .getIn(['widgets', '0'])
            .set('templatePath', `${updatedWidget.get('templatePath', '')}.widgets.0`)

        const limit = isEditing ? 1 : widget.getIn(['meta', 'limit'])
        const displayedCards = limit ? source.toList().take(limit) : source.toList()

        let hasExcluded = false
        let exclusionWidget = fromJS({})

        if (limit) {
            const excluded = source.size - limit
            hasExcluded = excluded > 0
            exclusionWidget = fromJS({
                type: 'message',
                title: `${limit} shown above (${excluded} remaining)`,
                decoration: {
                    class: 'blue footer'
                }
            })
        }

        return (
            <div className="list">
                {
                    isEditing && !isParentList && (
                        <div>
                            <button
                                className="ui mini red button"
                                onClick={(e) => {
                                    this._deleteList(e, updatedWidget, passedWidget)
                                }}
                            >
                                Delete list below
                            </button>
                        </div>
                    )
                }
                {
                    displayedCards
                        .map((d, i) => {
                            return (
                                <InfobarWidget
                                    key={i}
                                    source={d}
                                    parent={updatedWidget}
                                    widget={passedWidget}
                                    editing={editing}
                                />
                            )
                        })
                }
                {
                    hasExcluded && (
                        <InfobarWidget
                            source={source}
                            parent={updatedWidget}
                            widget={exclusionWidget}
                        />
                    )
                }
            </div>
        )
    }
}

ListWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isParentList: PropTypes.bool.isRequired
}

ListWidget.defaultProps = {
    isEditing: false,
    isParentList: false
}

export default ListWidget
