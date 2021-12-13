import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import {Card, CardBody, Popover, PopoverBody} from 'reactstrap'

import {renderInfobarTemplate} from '../../../../../../utils/infobar.tsx'
import {renderTemplate} from '../../../../../../utils/template.ts'
import DragWrapper from '../../../../../dragging/WidgetsDragWrapper'
import InfobarWidget from '../InfobarWidget'

import PopoverWidgetEditCard from './forms/PopoverWidgetEditCard'
import css from './CardInfobarWidget.less'
import CustomActions from './customActions/index.ts'

import expandUp from 'assets/img/infobar/expand-up.svg'

export default class CardInfobarWidget extends React.Component {
    static propTypes = {
        AfterTitle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        BeforeContent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        AfterContent: PropTypes.func,
        TitleWrapper: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        Wrapper: PropTypes.func,

        editing: PropTypes.object,
        source: PropTypes.object.isRequired,
        widget: PropTypes.object.isRequired,
        template: PropTypes.object.isRequired,
        isEditing: PropTypes.bool.isRequired,
        isParentList: PropTypes.bool.isRequired,
        parent: PropTypes.object,
        open: PropTypes.bool,
    }

    static defaultProps = {
        AfterTitle: null,
        BeforeContent: null,
        TitleWrapper: null,
        Wrapper: null,

        isEditing: false,
        isParentList: false,
        open: false,
    }

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
            const tp = isParentList
                ? parent.get('templatePath', '')
                : template.get('templatePath', '')
            const currentlyEditedWidgetPath = editing.state.getIn(
                ['_internal', 'currentlyEditedWidgetPath'],
                ''
            )
            this.setState({displayPopup: tp === currentlyEditedWidgetPath})
        }
    }

    toggleCardExpand = () => {
        this.setState({
            open: !this.state.open,
        })
    }

    deleteCard = (e) => {
        const {template, editing} = this.props

        const ap = template.get('absolutePath')
        const tp = template.get('templatePath')

        e.stopPropagation()
        if (editing) {
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    deleteList = (e) => {
        const {parent, template, editing} = this.props

        e.stopPropagation()
        if (editing) {
            const ap = parent.get('absolutePath')
            const tp = template.get('templatePath')
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    startWidgetEdition = (e) => {
        const {parent, isParentList, template, editing} = this.props

        const tp = isParentList
            ? parent.get('templatePath', '')
            : template.get('templatePath', '')

        e.stopPropagation()
        if (editing) {
            editing.actions.startWidgetEdition(tp)
        }
    }

    togglePopup = () => {
        return this.props.editing.actions.stopWidgetEdition()
    }

    /**
     * Render tooltip of edition
     * @returns {JSX}
     * @private
     */
    renderPopover = () => {
        const {editing} = this.props

        if (!editing) {
            return null
        }

        return (
            <Popover
                placement="left"
                isOpen={this.state.displayPopup}
                target={this.uniqueId}
                toggle={this.togglePopup}
                trigger="legacy"
            >
                <PopoverBody>
                    <PopoverWidgetEditCard
                        {...this.props}
                        actions={editing.actions}
                    />
                </PopoverBody>
            </Popover>
        )
    }

    renderTitle = (template, source, isEditing) => {
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
                        rel="noopener noreferrer"
                    >
                        {renderInfobarTemplate(title, source)}
                    </a>
                )
            } else {
                content = <span>{renderInfobarTemplate(title, source)}</span>
            }
        } else if (isEditing) {
            content = <span className="placeholder">Title</span>
        }

        if (TitleWrapper) {
            content = <TitleWrapper {...this.props}>{content}</TitleWrapper>
        }

        return content
    }

    isRootWidget(templatePath) {
        return (
            templatePath.match(/.template.widgets.(\d+)$/) ||
            templatePath.match(/.template.widgets.(\d+).widgets.0$/)
        )
    }

    shouldDisplayCardWidgetHeader(template, isEditing) {
        const templateTitle = template.get('title')
        const isTransparent = !template.getIn(['meta', 'displayCard'], true)
        const templateCustomLinks = template.getIn(
            ['meta', 'custom', 'links'],
            fromJS({})
        )

        return (
            ((templateTitle || templateCustomLinks.size > 0) &&
                !isTransparent) ||
            isEditing
        )
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
            AfterContent,
            Wrapper,
        } = this.props

        const ap = template.get('absolutePath')
        const tp = template.get('templatePath')

        const childWidgets = template.get('widgets', fromJS([]))

        // display content (or at least space under card title) if we are in edition mode or if there is data to display
        const shouldDisplayCardContent = editing || !childWidgets.isEmpty()

        const isTransparent = !template.getIn(['meta', 'displayCard'], true)
        const isExpandable = !isEditing && shouldDisplayCardContent
        const className = classnames(css.component, {
            'can-drop': editing && editing.canDrop(ap),
            draggable: !isParentList,
            closed: !this.state.open && !isEditing,
            transparent: isTransparent,
            expandable: isExpandable && template.get('title') && !isTransparent,
        })

        // detect first non-text nested widget, to auto-expand
        let firstNonTextWidget = false

        let content = (
            <Card className={className} data-key={template.get('path')}>
                {this.shouldDisplayCardWidgetHeader(template, isEditing) && (
                    <CardBody
                        id={this.uniqueId}
                        className={classnames('header clearfix', {
                            'pr-5': isExpandable,
                        })}
                    >
                        {isExpandable && (
                            <span
                                className="dropdown-icon clickable text-faded"
                                onClick={this.toggleCardExpand}
                            >
                                <img src={expandUp} alt="Expand" />
                            </span>
                        )}
                        {!isTransparent &&
                            this.renderTitle(
                                template,
                                source.toJS(),
                                isEditing
                            )}
                        {isEditing && isParentList && (
                            <span className="meta"> (list)</span>
                        )}
                        <span className="tools">
                            {isEditing && (
                                <span>
                                    <i
                                        className="material-icons text-faded clickable"
                                        onClick={this.startWidgetEdition}
                                    >
                                        settings
                                    </i>
                                    <i
                                        className="material-icons text-danger clickable"
                                        onClick={
                                            isParentList
                                                ? this.deleteList
                                                : this.deleteCard
                                        }
                                    >
                                        close
                                    </i>
                                </span>
                            )}
                        </span>
                        {this.renderPopover()}
                        {this.isRootWidget(template.get('templatePath')) && (
                            <CustomActions
                                template={template}
                                source={source}
                                isEditing={isEditing}
                            />
                        )}
                        {!!AfterTitle && <AfterTitle {...this.props} />}
                    </CardBody>
                )}
                <CardBody
                    className={classnames('content', {
                        hidden: !shouldDisplayCardContent,
                    })}
                >
                    {!!BeforeContent && <BeforeContent {...this.props} />}
                    {source.isEmpty() ? (
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
                                    put: true,
                                }}
                                templatePath={tp}
                                isEditing={isEditing}
                                watchDrop
                            >
                                {childWidgets.map((w, i) => {
                                    const passedTemplate = w.set(
                                        'templatePath',
                                        `${tp}.widgets.${i}`
                                    )

                                    // find first non-text widget,
                                    // to auto-expand.
                                    if (
                                        w.get('type') !== 'text' &&
                                        !firstNonTextWidget
                                    ) {
                                        firstNonTextWidget = true
                                    }

                                    return (
                                        <InfobarWidget
                                            key={`${passedTemplate.get(
                                                'path'
                                            )}-${i}`}
                                            source={source}
                                            parent={template}
                                            widget={widget}
                                            template={passedTemplate}
                                            editing={editing}
                                            isEditing={isEditing}
                                            open={open && firstNonTextWidget}
                                        />
                                    )
                                })}
                            </DragWrapper>
                        )
                    )}

                    {!!AfterContent && <AfterContent {...this.props} />}
                </CardBody>
            </Card>
        )

        if (Wrapper) {
            content = <Wrapper {...this.props}>{content}</Wrapper>
        }

        return content
    }
}
