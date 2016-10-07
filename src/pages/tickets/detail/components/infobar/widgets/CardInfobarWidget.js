import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {renderTemplate} from '../utils'
import DragWrapper from '../../common/DragWrapper'
import TooltipWidgetEditCard from '../forms/TooltipWidgetEditCard'

import InfobarWidget from '../InfobarWidget'

class CardInfobarWidget extends React.Component {
    constructor(props) {
        super(props)

        this.isEdited = false
    }

    componentWillReceiveProps(nextProps) {
        const {parent, isParentList, isEditing, widget, editing} = nextProps

        if (editing) {
            const tp = isParentList ? parent.get('templatePath', '') : widget.get('templatePath', '')
            const currentlyEditedWidgetPath = editing.state.getIn(['_internal', 'currentlyEditedWidgetPath'], '')
            this.isEdited = isEditing && tp === currentlyEditedWidgetPath
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

    _deleteList = (e) => {
        const {parent, widget, editing} = this.props

        e.stopPropagation()
        if (editing) {
            const ap = parent.get('absolutePath')
            const tp = widget.get('templatePath')
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    _startWidgetEdition = (e) => {
        const {parent, isParentList, widget, editing} = this.props

        const tp = isParentList ? parent.get('templatePath', '') : widget.get('templatePath', '')

        e.stopPropagation()
        if (editing) {
            editing.actions.startWidgetEdition(tp)
        }
    }

    /**
     * Render tooltip of edition
     * @returns {JSX}
     * @private
     */
    _renderTooltip = () => {
        const {editing, parent, isParentList, widget} = this.props
        if (this.isEdited) {
            return (
                <TooltipWidgetEditCard
                    parent={parent}
                    isParentList={isParentList}
                    widget={widget}
                    actions={editing.actions}
                />
            )
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

        const className = classnames('ui card', {
            'can-drop': editing && editing.canDrop(ap),
            draggable: !isParentList
        })

        return (
            <div
                className={className}
                data-key={widget.get('path')}
            >
                <div className="content">
                    {
                        (widget.get('title') || isEditing)
                        && (
                            <div className="header clearfix">
                                {
                                    widget.get('title')
                                        ? renderTemplate(widget.get('title', ''), source.toJS())
                                        : <span className="placeholder">Title</span>
                                }
                                {
                                    isEditing
                                    && isParentList
                                    && <span className="meta"> (list)</span>
                                }
                                <span className="tools">
                                    {
                                        isEditing
                                        && (
                                            <span>
                                                <i
                                                    className="grey link setting icon"
                                                    onClick={this._startWidgetEdition}
                                                />
                                                <i
                                                    className="red link remove icon"
                                                    onClick={isParentList ? this._deleteList : this._deleteCard}
                                                />
                                            </span>
                                        )
                                    }
                                </span>
                                {this._renderTooltip()}
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

CardInfobarWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isParentList: PropTypes.bool.isRequired,
    parent: PropTypes.object
}

CardInfobarWidget.defaultProps = {
    isEditing: false,
    isParentList: false
}

export default CardInfobarWidget
