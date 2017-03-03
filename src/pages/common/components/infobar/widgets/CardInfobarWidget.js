import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {renderTemplate} from '../utils'
import DragWrapper from '../../dragging/WidgetsDragWrapper'
import TooltipWidgetEditCard from '../forms/TooltipWidgetEditCard'

import InfobarWidget from '../InfobarWidget'

class CardInfobarWidget extends React.Component {
    constructor(props) {
        super(props)

        this.isEdited = false

        this.state = {
            open: props.open,
        }
    }

    componentWillReceiveProps(nextProps) {
        const {parent, isParentList, isEditing, widget, editing} = nextProps

        if (editing) {
            const tp = isParentList ? parent.get('templatePath', '') : widget.get('templatePath', '')
            const currentlyEditedWidgetPath = editing.state.getIn(['_internal', 'currentlyEditedWidgetPath'], '')
            this.isEdited = isEditing && tp === currentlyEditedWidgetPath
        }
    }

    _toggleCardExpand = () => {
        this.setState({
            open: !this.state.open
        })
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

    _renderTitle = (widget, source) => {
        const title = widget.get('title', '')
        const link = widget.getIn(['meta', 'link'])

        if (link) {
            return (
                <a
                    href={renderTemplate(link, source)}
                    target="_blank"
                >
                    {renderTemplate(title, source)}
                </a>
            )
        }

        return (
            <span>{renderTemplate(title, source)}</span>
        )
    }

    render() {
        const {
            isEditing,
            isParentList,
            source,
            widget,
            editing,
            open,
        } = this.props

        const ap = widget.get('absolutePath')
        const tp = widget.get('templatePath')

        const className = classnames('ui card', {
            'can-drop': editing && editing.canDrop(ap),
            draggable: !isParentList,
            closed: !this.state.open && !isEditing
        })

        const childWidgets = widget.get('widgets', fromJS([]))

        // display content (or at least space under card title) if we are in edition mode or if there is data to display
        const shouldDisplayCardContent = editing || !childWidgets.isEmpty()

        // detect first non-text nested widget, to auto-expand
        let firstNonTextWidget = false

        return (
            <div
                className={className}
                data-key={widget.get('path')}
            >
                {
                    (widget.get('title') || isEditing)
                    && (
                        <div
                            className="title header clearfix"
                            onClick={this._toggleCardExpand}
                        >
                            {
                                !isEditing && shouldDisplayCardContent &&
                                (
                                    <span className="dropdown-icon"><i className="dropdown icon" /></span>
                                )
                            }
                            {
                                widget.get('title')
                                    ? this._renderTitle(widget, source.toJS())
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
                <div
                    className={classnames('content', {
                        hidden: !shouldDisplayCardContent,
                    })}
                >
                    {
                        source.isEmpty() ? (
                                <div className="simple-field">
                                    <span className="field-label">
                                        <i>No data</i>
                                    </span>
                                </div>
                            ) : (
                                shouldDisplayCardContent && (
                                    <DragWrapper
                                        actions={editing && editing.actions}
                                        sort
                                        group={{
                                            name: ap.join('.'),
                                            pull: false,
                                            put: true
                                        }}
                                        templatePath={tp}
                                        isEditing={isEditing}
                                        watchDrop
                                    >
                                        {
                                            childWidgets
                                                .map((w, i) => {
                                                    const passedWidget = w
                                                        .set('templatePath', `${tp}.widgets.${i}`)

                                                    // find first non-text widget,
                                                    // to auto-expand.
                                                    if (w.get('type') !== 'text' && !firstNonTextWidget) {
                                                        firstNonTextWidget = true
                                                    }

                                                    return (
                                                        <InfobarWidget
                                                            key={`${passedWidget.get('path')}-${i}`}
                                                            source={source}
                                                            parent={widget}
                                                            widget={passedWidget}
                                                            editing={editing}
                                                            isEditing={isEditing}
                                                            open={open && firstNonTextWidget}
                                                        />
                                                    )
                                                })
                                        }
                                    </DragWrapper>
                                )
                            )
                    }
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
    parent: PropTypes.object,
    open: PropTypes.bool
}

CardInfobarWidget.defaultProps = {
    isEditing: false,
    isParentList: false,
    open: false
}

export default CardInfobarWidget
