import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import {Popover, PopoverBody} from 'reactstrap'

import InfobarWidget from '../InfobarWidget'

import {StaticField} from './StaticField'

import WidgetEdit from './forms/WidgetEdit.tsx'
import css from './Card.less'
import CustomActions from './customActions/index.ts'

import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper.tsx'
import {renderTemplate} from 'pages/common/utils/template.ts'
import {renderInfobarTemplate} from 'pages/common/utils/infobar.tsx'

export default class Card extends React.Component {
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
        removeBorderTop: PropTypes.bool,
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

        const templatePath = isParentList
            ? parent.get('templatePath', '')
            : template.get('templatePath', '')

        e.stopPropagation()

        if (editing) {
            editing.actions.startWidgetEdition(templatePath)
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
        const {template, editing} = this.props

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
                    <WidgetEdit
                        {...this.props}
                        isRootWidget={isRootWidget(
                            template.get('templatePath')
                        )}
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
            content = (
                <span className={css.widgetCardHeaderPlaceholder}>Title</span>
            )
        }

        if (TitleWrapper) {
            content = <TitleWrapper {...this.props}>{content}</TitleWrapper>
        }

        return content
    }

    shouldDisplayCardWidgetHeader(template, isEditing) {
        const templateTitle = template.get('title')
        const onlyContent = !template.getIn(['meta', 'displayCard'], true)
        const hasColor = template.getIn(['meta', 'color'], '')
        const hasPicture = template.getIn(['meta', 'pictureUrl'], '')
        const templateCustomLinks = template.getIn(
            ['meta', 'custom', 'links'],
            fromJS({})
        )
        const templateCustomButtons = template.getIn(
            ['meta', 'custom', 'buttons'],
            fromJS({})
        )

        return (
            ((templateTitle ||
                hasColor ||
                hasPicture ||
                templateCustomLinks.size > 0 ||
                templateCustomButtons.size > 0) &&
                !onlyContent) ||
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
            removeBorderTop,
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

        const onlyContent = !template.getIn(['meta', 'displayCard'], true)
        const isExpandable = !isEditing && shouldDisplayCardContent
        // keep the unscoped class here to have drag and drop greying feature
        const className = classnames(css.widgetCard, 'widget-card', {
            'can-drop': editing && editing.canDrop(ap),
            draggable: !isParentList,
            [css.closed]: !this.state.open && !isEditing,
            [css.onlyContent]: !isEditing && onlyContent,
            [css.removeBorderTop]: removeBorderTop,
        })

        // detect first non-text nested widget, to auto-expand
        let firstNonTextWidget = false

        let content = (
            <div className={className}>
                <div
                    className={classnames(css.widgetCardMarginWrapper, {
                        [css.onlyContent]: !isEditing && onlyContent,
                    })}
                >
                    {this.shouldDisplayCardWidgetHeader(
                        template,
                        isEditing
                    ) && (
                        <>
                            <div
                                className={css.widgetCardHeader}
                                id={this.uniqueId}
                            >
                                {isExpandable && (
                                    <span
                                        className={classnames(
                                            css.dropdownIcon,
                                            'clickable',
                                            'text-faded'
                                        )}
                                        onClick={this.toggleCardExpand}
                                        title={
                                            this.state.open
                                                ? 'Fold this card'
                                                : 'Unfold this card'
                                        }
                                    >
                                        {this.state.open ? (
                                            <i className="material-icons">
                                                expand_less
                                            </i>
                                        ) : (
                                            <i className="material-icons">
                                                expand_more
                                            </i>
                                        )}
                                    </span>
                                )}
                                {isEditing && (
                                    <span className={css.widgetCardTools}>
                                        <i
                                            className={`material-icons text-danger ${css.widgetCardToolIcon}`}
                                            onClick={
                                                isParentList
                                                    ? this.deleteList
                                                    : this.deleteCard
                                            }
                                        >
                                            delete
                                        </i>
                                        <i
                                            className={`material-icons ${css.widgetCardToolIcon}`}
                                            onClick={this.startWidgetEdition}
                                        >
                                            edit
                                        </i>
                                    </span>
                                )}
                                {isEditing && onlyContent && (
                                    <div
                                        className={
                                            css.sourceWidgetCardHiddenIndicator
                                        }
                                    >
                                        Hidden card
                                    </div>
                                )}
                                {this.renderTitle(
                                    template,
                                    source.toJS(),
                                    isEditing
                                )}
                            </div>
                            {this.renderPopover()}
                            {isRootWidget(template.get('templatePath')) && (
                                <CustomActions
                                    template={template}
                                    source={source}
                                    isEditing={isEditing}
                                />
                            )}
                            {!!AfterTitle && <AfterTitle {...this.props} />}
                        </>
                    )}
                    <div
                        // keep the unscoped class here to have drag and drop greying feature
                        className={classnames(
                            'widget-card-content',
                            css.widgetCardContent,
                            {
                                hidden: !shouldDisplayCardContent,
                            }
                        )}
                    >
                        {!!BeforeContent && <BeforeContent {...this.props} />}
                        {source.isEmpty() ? (
                            <StaticField>No data</StaticField>
                        ) : (
                            shouldDisplayCardContent && (
                                <DragWrapper
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

                                        const type = w.get('type')
                                        // find first non-text widget,
                                        // to auto-expand.
                                        if (
                                            type !== 'text' &&
                                            !firstNonTextWidget
                                        ) {
                                            firstNonTextWidget = true
                                        }

                                        // if Card has no header displayed
                                        // and first child is another Card
                                        // we need to remove border-top
                                        let removeBorderTop = false
                                        if (
                                            i === 0 &&
                                            (type === 'card' ||
                                                type === 'list') &&
                                            onlyContent
                                        ) {
                                            removeBorderTop = true
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
                                                open={
                                                    open && firstNonTextWidget
                                                }
                                                removeBorderTop={
                                                    removeBorderTop
                                                }
                                            />
                                        )
                                    })}
                                </DragWrapper>
                            )
                        )}

                        {!!AfterContent && <AfterContent {...this.props} />}
                    </div>
                </div>
            </div>
        )

        if (Wrapper) {
            content = <Wrapper {...this.props}>{content}</Wrapper>
        }

        return content
    }
}

function isRootWidget(templatePath) {
    return (
        templatePath.match(/.template.widgets.(\d+)$/) ||
        templatePath.match(/.template.widgets.(\d+).widgets.0$/)
    )
}
