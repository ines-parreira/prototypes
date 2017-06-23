import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import {Card, CardBlock, Popover, PopoverContent} from 'reactstrap'

import {renderTemplate} from '../utils'
import DragWrapper from '../../dragging/WidgetsDragWrapper'
import TooltipWidgetEditCard from '../forms/TooltipWidgetEditCard'

import InfobarWidget from '../InfobarWidget'

class CardInfobarWidget extends React.Component {
    constructor(props) {
        super(props)

        this.uniqueId = _uniqueId('card-widget-')

        this.state = {
            displayPopup: false,
            open: props.open,
        }
    }

    componentWillReceiveProps(nextProps) {
        const {parent, isParentList, isEditing, template, editing} = nextProps

        if (isEditing) {
            const tp = isParentList ? parent.get('templatePath', '') : template.get('templatePath', '')
            const currentlyEditedWidgetPath = editing.state.getIn(['_internal', 'currentlyEditedWidgetPath'], '')
            this.setState({displayPopup: tp === currentlyEditedWidgetPath})
        }
    }

    _toggleCardExpand = () => {
        this.setState({
            open: !this.state.open
        })
    }

    _deleteCard = (e) => {
        const {template, editing} = this.props

        const ap = template.get('absolutePath')
        const tp = template.get('templatePath')

        e.stopPropagation()
        if (editing) {
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    _deleteList = (e) => {
        const {parent, template, editing} = this.props

        e.stopPropagation()
        if (editing) {
            const ap = parent.get('absolutePath')
            const tp = template.get('templatePath')
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    _startWidgetEdition = (e) => {
        const {parent, isParentList, template, editing} = this.props

        const tp = isParentList ? parent.get('templatePath', '') : template.get('templatePath', '')

        e.stopPropagation()
        if (editing) {
            editing.actions.startWidgetEdition(tp)
        }
    }

    _togglePopup = () => {
        return this.props.editing.actions.stopWidgetEdition()
    }

    /**
     * Render tooltip of edition
     * @returns {JSX}
     * @private
     */
    _renderTooltip = () => {
        const {editing} = this.props

        if (!editing) {
            return null
        }

        return (
            <Popover
                placement="left"
                isOpen={this.state.displayPopup}
                target={this.uniqueId}
                toggle={this._togglePopup}
            >
                <PopoverContent>
                    <TooltipWidgetEditCard
                        {...this.props}
                        actions={editing.actions}
                    />
                </PopoverContent>
            </Popover>
        )
    }

    _renderTitle = (template, source) => {
        const title = template.get('title', '')
        const link = template.getIn(['meta', 'link'])
        const {TitleWrapper} = this.props

        let content = null

        if (template.get('title')) {
            if (link && !TitleWrapper) {
                content = (
                    <a
                        href={renderTemplate(link, source)}
                        target="_blank"
                    >
                        {renderTemplate(title, source)}
                    </a>
                )
            } else {
                content = (
                    <span>{renderTemplate(title, source)}</span>
                )
            }
        } else {
            content = (
                <span className="placeholder">Title</span>
            )
        }

        if (TitleWrapper) {
            content = (
                <TitleWrapper {...this.props}>
                    {content}
                </TitleWrapper>
            )
        }

        return content
    }

    render() {
        const {
            isEditing,
            isParentList,
            source,
            widget,
            template,
            editing,
            open,
            AfterTitle,
            BeforeContent,
            Wrapper,
        } = this.props

        const ap = template.get('absolutePath')
        const tp = template.get('templatePath')

        const childWidgets = template.get('widgets', fromJS([]))

        const isTransparent = !template.getIn(['meta', 'displayCard'], true)
        const className = classnames({
            'can-drop': editing && editing.canDrop(ap),
            draggable: !isParentList,
            closed: !this.state.open && !isEditing,
            transparent: isTransparent
        })

        // display content (or at least space under card title) if we are in edition mode or if there is data to display
        const shouldDisplayCardContent = editing || !childWidgets.isEmpty()

        // detect first non-text nested widget, to auto-expand
        let firstNonTextWidget = false

        let content = (
            <Card
                className={className}
                data-key={template.get('path')}
            >
                {
                    (template.get('title') || isEditing)
                    && (
                        <CardBlock
                            id={this.uniqueId}
                            className="header clearfix"
                        >
                            {
                                !isTransparent && !isEditing
                                && shouldDisplayCardContent
                                && (
                                    <span
                                        className="dropdown-icon clickable"
                                        onClick={this._toggleCardExpand}
                                    >
                                        <i className="fa fa-fw fa-caret-down" />
                                    </span>
                                )
                            }
                            {!isTransparent && this._renderTitle(template, source.toJS())}
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
                                                className="fa fa-fw fa-cog text-faded clickable"
                                                onClick={this._startWidgetEdition}
                                            />
                                            <i
                                                className="fa fa-fw fa-close text-danger clickable"
                                                onClick={isParentList ? this._deleteList : this._deleteCard}
                                            />
                                        </span>
                                    )
                                }
                            </span>
                            {this._renderTooltip()}
                            {!!AfterTitle && <AfterTitle {...this.props} />}
                        </CardBlock>
                    )
                }
                <CardBlock
                    className={classnames('content', {
                        hidden: !shouldDisplayCardContent,
                    })}
                >
                    {!!BeforeContent && <BeforeContent {...this.props} />}
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
                                                    const passedTemplate = w
                                                        .set('templatePath', `${tp}.widgets.${i}`)

                                                    // find first non-text widget,
                                                    // to auto-expand.
                                                    if (w.get('type') !== 'text' && !firstNonTextWidget) {
                                                        firstNonTextWidget = true
                                                    }

                                                    return (
                                                        <InfobarWidget
                                                            key={`${passedTemplate.get('path')}-${i}`}
                                                            source={source}
                                                            parent={template}
                                                            widget={widget}
                                                            template={passedTemplate}
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
                </CardBlock>
            </Card>
        )

        if (Wrapper) {
            content = (
                <Wrapper {...this.props}>
                    {content}
                </Wrapper>
            )
        }

        return content
    }
}

CardInfobarWidget.propTypes = {
    AfterTitle: PropTypes.func,
    BeforeContent: PropTypes.func,
    TitleWrapper: PropTypes.func,
    Wrapper: PropTypes.func,

    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isParentList: PropTypes.bool.isRequired,
    parent: PropTypes.object,
    open: PropTypes.bool
}

CardInfobarWidget.defaultProps = {
    AfterTitle: null,
    BeforeContent: null,
    TitleWrapper: null,
    Wrapper: null,

    isEditing: false,
    isParentList: false,
    open: false
}

export default CardInfobarWidget
