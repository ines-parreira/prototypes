import React, {ElementType, SyntheticEvent, ContextType} from 'react'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import {Popover, PopoverBody} from 'reactstrap'

import {WidgetType} from 'state/widgets/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import {renderTemplate} from 'pages/common/utils/template'
import {renderInfobarTemplate} from 'pages/common/utils/infobar'
import {CardHeaderIcon} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/CardHeaderIcon'
import {Editing} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'
import {IntegrationType} from 'models/integration/constants'
import InfobarWidget from '../InfobarWidget'
import {getWidgetTitle} from '../helpers'
import WidgetEdit, {EditionHiddenField} from './forms/WidgetEdit'
import {StaticField} from './StaticField'
import CustomActions from './customActions'

import css from './Card.less'

type Props = {
    AfterTitle?: ElementType
    BeforeContent?: ElementType
    AfterContent?: ElementType
    TitleWrapper?: ElementType
    Wrapper?: ElementType
    editionHiddenFields?: EditionHiddenField[]

    editing?: Editing
    parent?: Map<any, any>
    source?: Maybe<Map<string, unknown>>
    widget: Map<string, unknown>
    template: Map<string, unknown>

    isEditing: boolean
    isParentList: boolean
    open: boolean
    removeBorderTop: boolean
}

export default class Card extends React.Component<
    Props,
    {
        displayPopup: boolean
        open: boolean
    }
> {
    uniqueId: string

    static defaultProps = {
        AfterTitle: undefined,
        BeforeContent: undefined,
        TitleWrapper: undefined,
        Wrapper: undefined,
        editionHiddenFields: undefined,

        isEditing: false,
        isParentList: false,
        open: false,
    }

    static contextType = IntegrationContext
    context!: ContextType<typeof IntegrationContext>

    constructor(props: Props) {
        super(props)

        this.uniqueId = _uniqueId('card-widget-')

        this.state = {
            displayPopup: false,
            open: props.open,
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const {parent, isParentList, isEditing, template, editing} = nextProps

        if (isEditing) {
            const tp = isParentList
                ? parent?.get('templatePath', '')
                : template.get('templatePath', '')
            const currentlyEditedWidgetPath = editing?.state.getIn(
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

    deleteCard = (e: SyntheticEvent) => {
        const {template, editing} = this.props

        const ap = template.get('absolutePath') as string[]
        const tp = template.get('templatePath') as string

        e.stopPropagation()
        if (editing) {
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    deleteList = (e: SyntheticEvent) => {
        const {parent, template, editing} = this.props

        e.stopPropagation()
        if (editing) {
            const ap = parent?.get('absolutePath') as string[]
            const tp = template.get('templatePath') as string
            editing.actions.removeEditedWidget(tp, ap)
        }
    }

    startWidgetEdition = (e: SyntheticEvent) => {
        const {parent, isParentList, template, editing} = this.props

        const templatePath = isParentList
            ? parent?.get('templatePath', '')
            : template.get('templatePath', '')

        e.stopPropagation()

        if (editing) {
            editing.actions.startWidgetEdition(templatePath)
        }
    }

    togglePopup = () => {
        return this.props.editing?.actions.stopWidgetEdition()
    }

    /**
     * Render tooltip of edition
     * @returns {JSX}
     * @private
     */
    renderPopover = () => {
        const {editing, TitleWrapper} = this.props

        if (!editing) {
            return null
        }

        // HTTP is a special case because it can have both
        // custom and hard coded icons
        const editionHiddenFields: EditionHiddenField[] =
            this.props.editionHiddenFields || []
        if (
            this.context.integration.get('type') !== IntegrationType.Http &&
            Boolean(TitleWrapper)
        ) {
            editionHiddenFields.push('icon')
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
                        template={this.props.template}
                        parent={this.props.parent || Map()}
                        isParentList={this.props.isParentList}
                        editionHiddenFields={editionHiddenFields}
                    />
                </PopoverBody>
            </Popover>
        )
    }

    renderTitle = () => {
        const {template, source, isEditing} = this.props
        const title = this.getCardTitle()
        const link = template.getIn(['meta', 'link'])
        const pictureUrl = template.getIn(['meta', 'pictureUrl'], '')
        const color = template.getIn(['meta', 'color'], '')
        const {TitleWrapper} = this.props

        let content = title && renderInfobarTemplate(title, source?.toJS())
        if (isEditing) {
            content = content || (
                <span className={css.widgetCardHeaderPlaceholder}>Title</span>
            )
        }

        if (link && !TitleWrapper) {
            content = (
                <a
                    href={renderTemplate(link, source)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {content}
                </a>
            )
        }

        if (TitleWrapper) {
            content = <TitleWrapper {...this.props}>{content}</TitleWrapper>
        } else {
            content = (
                <>
                    {color && !pictureUrl ? (
                        <div
                            className={css.colorTile}
                            style={{
                                backgroundColor: color,
                            }}
                        />
                    ) : (
                        pictureUrl && (
                            <CardHeaderIcon
                                src={pictureUrl}
                                alt={'Widget Icon'}
                                color={color}
                            />
                        )
                    )}
                    {content}
                </>
            )
        }

        return content
    }

    getCardTitle() {
        const {template, widget, source} = this.props
        return isRootWidget(template.get('templatePath', '') as string)
            ? getWidgetTitle({
                  source: source?.toJS(),
                  widgetType: widget.get('type') as WidgetType,
                  template: template.toJS(),
                  appId: widget.get('app_id') as Maybe<string>,
                  integration: this.context.integration?.toJS(),
              })
            : (template.get('title', '') as string)
    }

    shouldDisplayCardWidgetHeader() {
        const {template, isEditing} = this.props
        const hasTitle = Boolean(this.getCardTitle())
        const onlyContent = !template.getIn(['meta', 'displayCard'], true)
        const hasColor = template.getIn(['meta', 'color'], '') as string
        const hasPicture = template.getIn(['meta', 'pictureUrl'], '') as string
        const templateCustomLinks = template.getIn(
            ['meta', 'custom', 'links'],
            fromJS({})
        ) as Map<string, unknown>
        const templateCustomButtons = template.getIn(
            ['meta', 'custom', 'buttons'],
            fromJS({})
        ) as Map<string, unknown>

        return (
            ((hasTitle ||
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
        const tp = template.get('templatePath') as string

        const childWidgets = template.get('widgets', fromJS([])) as List<
            Map<string, unknown>
        >

        // display content (or at least space under card title) if we are in edition mode or if there is data to display
        const shouldDisplayCardContent = editing || !childWidgets.isEmpty()

        const onlyContent = !template.getIn(['meta', 'displayCard'], true)
        const isExpandable = !isEditing && shouldDisplayCardContent
        // keep the unscoped class here to have drag and drop greying feature
        const className = classnames(css.widgetCard, 'widget-card', {
            'can-drop': editing && editing.canDrop(ap as string),
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
                    {this.shouldDisplayCardWidgetHeader() && (
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
                                {this.renderTitle()}
                            </div>
                            {this.renderPopover()}
                            {isRootWidget(
                                template.get('templatePath') as string
                            ) && (
                                <CustomActions
                                    template={template}
                                    source={source as Map<string, unknown>}
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
                        {source?.isEmpty() ? (
                            <StaticField>No data</StaticField>
                        ) : (
                            shouldDisplayCardContent && (
                                <DragWrapper
                                    sort
                                    group={{
                                        name: (ap as string[]).join('.'),
                                        pull: false,
                                        put: true,
                                    }}
                                    templatePath={tp}
                                    isEditing={isEditing}
                                    watchDrop
                                >
                                    {childWidgets.map((w, i) => {
                                        const passedTemplate = w?.set(
                                            'templatePath',
                                            `${tp}.widgets.${i as number}`
                                        ) as Map<string, unknown>

                                        const type = w?.get('type')
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
                                                key={`${
                                                    passedTemplate.get(
                                                        'path'
                                                    ) as string
                                                }-${i as number}`}
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

function isRootWidget(templatePath: string) {
    // We must handle the case where the first widget after the wrapper
    // is a list, in which case we need to check the second widget
    return (
        templatePath.match(/.template.widgets.(\d+)$/) ||
        templatePath.match(/.template.widgets.(\d+).widgets.0$/)
    )
}
