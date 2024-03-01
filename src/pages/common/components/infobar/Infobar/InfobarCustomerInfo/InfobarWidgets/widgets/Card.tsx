import React, {ElementType, SyntheticEvent, useContext, useState} from 'react'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'
import {Popover, PopoverBody} from 'reactstrap'

import {useAppNode} from 'appNode'
import {updateRecord} from 'utils/types'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import useId from 'hooks/useId'
import {IntegrationType} from 'models/integration/constants'
import {
    CardMeta,
    ListMeta,
    PartialTemplate,
    Template,
} from 'models/widget/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import StaticField from 'infobar/components/StaticField'
import {
    removeEditedWidget,
    updateEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
} from 'state/widgets/actions'
import {getWidgetsState} from 'state/widgets/selectors'
import {WidgetType} from 'state/widgets/types'
import {renderTemplate} from 'pages/common/utils/template'
import {renderInfobarTemplate} from 'pages/common/utils/infobar'
import {
    canDrop,
    isSimpleTemplateWidget,
} from 'pages/common/components/infobar/utils'
import {CardHeaderIcon} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/CardHeaderIcon'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'

// This is to avoid circular dependencies while doing recursion
import CardEditForm, {
    CardEditFormState,
    HiddenField,
} from 'infobar/ui/CardEditForm'
import {widgetReference} from '../widgetReference'
import {getWidgetTitle} from '../helpers'
import CustomActions from './customActions'
import css from './Card.less'

type Props = {
    AfterTitle?: ElementType
    BeforeContent?: ElementType
    AfterContent?: ElementType
    TitleWrapper?: ElementType
    Wrapper?: ElementType
    editionHiddenFields?: HiddenField[]

    parent?: Map<any, any>
    source?: Maybe<Map<string, unknown>>
    widget: Map<string, unknown>
    template: Map<string, unknown>

    isEditing: boolean
    isParentList: boolean
    open: boolean
    removeBorderTop: boolean
}

export const cardMetaFields: Array<keyof Omit<CardMeta, 'custom'>> = [
    'displayCard',
    'link',
    'pictureUrl',
    'color',
]
export const listMetaFields: Array<keyof ListMeta> = ['limit', 'orderBy']

export const EDIT_BUTTON_TEXT = 'edit'
export const DELETE_BUTTON_TEXT = 'delete'

export default function Card(props: Props) {
    const {
        TitleWrapper,
        AfterTitle,
        BeforeContent,
        AfterContent,
        Wrapper,
        editionHiddenFields = [],
        template,
        parent = Map({}),
        source,
        widget,
        isParentList,
        isEditing,
        removeBorderTop,
    } = props
    const InfobarWidget = widgetReference.Widget
    const integrationContext = useContext(IntegrationContext)
    const appNode = useAppNode()
    const dispatch = useAppDispatch()
    const widgetsState = useAppSelector(getWidgetsState)

    const [isPopupOpen, setPopupOpen] = useState(false)
    const [isOpen, setOpen] = useState(props.open)

    const uniqueId = `card-widget-${useId()}`
    const parentAbsolutePath = parent?.get('absolutePath', []) as string[]
    const absolutePath = template.get('absolutePath', []) as string[]
    const parentTemplatePath = parent?.get('templatePath', '') as string
    const templatePath = template.get('templatePath', '') as string
    const childWidgets = template.get('widgets', fromJS([])) as List<
        Map<string, unknown>
    >

    const handleDelete = (e?: SyntheticEvent) => {
        e?.stopPropagation()
        dispatch(
            removeEditedWidget(
                templatePath,
                isParentList ? parentAbsolutePath : absolutePath
            )
        )
    }

    const handleEditStart = (e?: SyntheticEvent) => {
        e?.stopPropagation()

        setPopupOpen(true)
        dispatch(
            startWidgetEdition(isParentList ? parentTemplatePath : templatePath)
        )
    }

    const handleEditSubmit = (formState: CardEditFormState) => {
        const card: PartialTemplate = {
            type: 'card',
            title: formState.title,
        }

        for (const field of cardMetaFields) {
            if (formState[field] !== undefined) {
                card.meta ??= {}
                updateRecord(card.meta, field, formState[field])
            }
        }

        if (isParentList) {
            const list: PartialTemplate = {
                title: parent?.get('title') as string,
                type: 'list',
                widgets: [card],
            }

            for (const field of listMetaFields) {
                if (formState[field] !== undefined) {
                    list.meta ??= {}
                    updateRecord(list.meta, field, formState[field])
                }
            }
            // saving the parent list AND the card inside that list
            dispatch(updateEditedWidget(list))
        } else {
            // saving only the card
            dispatch(updateEditedWidget(card))
        }

        dispatch(stopWidgetEdition())
        setPopupOpen(false)
    }

    const handleEditCancel = (e?: SyntheticEvent) => {
        e?.stopPropagation()
        setPopupOpen(false)
        dispatch(stopWidgetEdition())
    }

    const handlePopoverToggle = () => {
        if (isPopupOpen) {
            handleEditCancel()
        }
    }

    const getCardTitle = () => {
        return isRootWidget(template.get('templatePath', '') as string)
            ? getWidgetTitle({
                  source: source?.toJS(),
                  widgetType: widget.get('type') as WidgetType,
                  template: template.toJS(),
                  appId: widget.get('app_id') as Maybe<string>,
                  integration: integrationContext.integration?.toJS(),
              })
            : (template.get('title', '') as string)
    }

    const renderTitle = () => {
        const title = getCardTitle()
        const link = template.getIn(['meta', 'link'])
        const pictureUrl = template.getIn(['meta', 'pictureUrl'], '')
        const color = template.getIn(['meta', 'color'], '')

        let content = title && renderInfobarTemplate(title, source?.toJS())
        if (isEditing) {
            content = content || (
                <span className={css.widgetCardHeaderPlaceholder}>Title</span>
            )
        }

        if (link && !TitleWrapper) {
            content = (
                <a
                    href={renderTemplate(link, source?.toJS())}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {content}
                </a>
            )
        }

        if (TitleWrapper) {
            content = <TitleWrapper {...props}>{content}</TitleWrapper>
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

    const shouldDisplayCardWidgetHeader = () => {
        const hasTitle = Boolean(getCardTitle())
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

    // display content (or at least space under card title) if we are in edition mode or if there is data to display
    const shouldDisplayCardContent = isEditing || !childWidgets.isEmpty()

    const onlyContent = !template.getIn(['meta', 'displayCard'], true)
    const isExpandable = !isEditing && shouldDisplayCardContent
    // keep the unscoped class here to have drag and drop greying feature
    const className = classnames(css.widgetCard, 'widget-card', {
        'can-drop':
            isEditing &&
            canDrop(
                widgetsState.getIn(['_internal', 'drag', 'group']),
                absolutePath
            ),
        draggable: !isParentList,
        [css.closed]: !isOpen && !isEditing,
        [css.onlyContent]: !isEditing && onlyContent,
        [css.removeBorderTop]: removeBorderTop,
    })

    // detect first non-text nested widget, to auto-expand
    let firstNonTextWidget = false

    const enrichedEditionHiddenField = [...editionHiddenFields]
    if (!isParentList) {
        enrichedEditionHiddenField.push('limit', 'orderBy')
    }
    // HTTP is a special case because it can have both
    // custom and hard coded icons
    if (
        integrationContext.integration.get('type') !== IntegrationType.Http &&
        Boolean(TitleWrapper)
    ) {
        enrichedEditionHiddenField.push('pictureUrl', 'color')
    }

    // existing data might have it stored as a string, though it should always be a number
    const limit = parent.getIn(['meta', 'limit'], undefined) as
        | number
        | string
        | undefined

    const initialData = {
        title: template.get('title', '') as string,
        link: template.getIn(['meta', 'link'], undefined) as string | undefined,
        pictureUrl: template.getIn(['meta', 'pictureUrl'], undefined) as
            | string
            | undefined,
        color: template.getIn(['meta', 'color'], undefined) as
            | string
            | undefined,
        displayCard: template.getIn(['meta', 'displayCard'], undefined) as
            | boolean
            | undefined,
        limit: limit === undefined ? limit : Number(limit),
        orderBy: parent.getIn(['meta', 'orderBy'], undefined) as
            | string
            | undefined,
    }

    const orderByOptions = (childWidgets.toJS() as Template[])
        .filter(isSimpleTemplateWidget)
        .reduce((acc, {title = '', path}) => {
            ;['-', '+'].forEach((order) =>
                acc.push({
                    value: `${order}${typeof path === 'string' ? path : ''}`,
                    label: `${title} (${order === '-' ? 'DESC' : 'ASC'})`,
                })
            )
            return acc
        }, [] as {value: string; label: string}[])

    let content = (
        <div className={className}>
            <div
                className={classnames(css.widgetCardMarginWrapper, {
                    [css.onlyContent]: !isEditing && onlyContent,
                })}
            >
                {shouldDisplayCardWidgetHeader() && (
                    <>
                        <div className={css.widgetCardHeader} id={uniqueId}>
                            {isExpandable && (
                                <span
                                    className={classnames(
                                        css.dropdownIcon,
                                        'clickable',
                                        'text-faded'
                                    )}
                                    onClick={() => setOpen((isOpen) => !isOpen)}
                                    title={
                                        isOpen
                                            ? 'Fold this card'
                                            : 'Unfold this card'
                                    }
                                >
                                    {isOpen ? (
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
                                <>
                                    <span className={css.widgetCardTools}>
                                        <i
                                            className={`material-icons text-danger ${css.widgetCardToolIcon}`}
                                            onClick={handleDelete}
                                        >
                                            {DELETE_BUTTON_TEXT}
                                        </i>
                                        <i
                                            className={`material-icons ${css.widgetCardToolIcon}`}
                                            onClick={handleEditStart}
                                        >
                                            {EDIT_BUTTON_TEXT}
                                        </i>
                                    </span>
                                    {onlyContent && (
                                        <div
                                            className={
                                                css.sourceWidgetCardHiddenIndicator
                                            }
                                        >
                                            Hidden card
                                        </div>
                                    )}
                                    <Popover
                                        placement="left"
                                        isOpen={isPopupOpen}
                                        target={uniqueId}
                                        toggle={handlePopoverToggle}
                                        trigger="legacy"
                                        container={appNode ?? undefined}
                                    >
                                        <PopoverBody>
                                            <CardEditForm
                                                initialData={initialData}
                                                orderByOptions={orderByOptions}
                                                hiddenFields={
                                                    enrichedEditionHiddenField
                                                }
                                                onSubmit={handleEditSubmit}
                                                onCancel={handleEditCancel}
                                            />
                                        </PopoverBody>
                                    </Popover>
                                </>
                            )}
                            {renderTitle()}
                        </div>
                        {isRootWidget(
                            template.get('templatePath') as string
                        ) && (
                            <CustomActions
                                template={template}
                                source={source as Map<string, unknown>}
                                isEditing={isEditing}
                            />
                        )}
                        {!!AfterTitle && <AfterTitle {...props} />}
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
                    {!!BeforeContent && <BeforeContent {...props} />}
                    {source?.isEmpty() ? (
                        <StaticField>No data</StaticField>
                    ) : (
                        shouldDisplayCardContent && (
                            <DragWrapper
                                sort
                                group={{
                                    name: absolutePath.join('.'),
                                    pull: false,
                                    put: true,
                                }}
                                templatePath={templatePath}
                                isEditing={isEditing}
                                watchDrop
                            >
                                {childWidgets.map((w, i) => {
                                    const passedTemplate = w?.set(
                                        'templatePath',
                                        `${templatePath}.widgets.${i as number}`
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
                                        (type === 'card' || type === 'list') &&
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
                                            open={isOpen && firstNonTextWidget}
                                            removeBorderTop={removeBorderTop}
                                        />
                                    )
                                })}
                            </DragWrapper>
                        )
                    )}

                    {!!AfterContent && <AfterContent {...props} />}
                </div>
            </div>
        </div>
    )

    if (Wrapper) {
        content = <Wrapper {...props}>{content}</Wrapper>
    }

    return content
}

function isRootWidget(templatePath: string) {
    // We must handle the case where the first widget after the wrapper
    // is a list, in which case we need to check the second widget
    return (
        templatePath.match(/.template.widgets.(\d+)$/) ||
        templatePath.match(/.template.widgets.(\d+).widgets.0$/)
    )
}
