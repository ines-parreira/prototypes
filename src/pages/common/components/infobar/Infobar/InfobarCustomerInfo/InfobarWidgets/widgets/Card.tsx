import React, {ComponentProps, ElementType, useContext, useMemo} from 'react'
import {fromJS, Map, List} from 'immutable'

import {updateRecord} from 'utils/types'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {IntegrationType} from 'models/integration/constants'
import {
    CardMeta,
    ListMeta,
    PartialTemplate,
    Template,
} from 'models/widget/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {
    removeEditedWidget,
    updateEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
} from 'state/widgets/actions'
import {getWidgetsState} from 'state/widgets/selectors'
import {WidgetType} from 'state/widgets/types'
import StaticField from 'infobar/components/StaticField'
import {CardEditFormState, HiddenField} from 'infobar/ui/Card/CardEditForm'
import {DEFAULT_LIST_ITEM_DISPLAYED_NUMBER} from 'infobar/config/template'
import {renderTemplate} from 'pages/common/utils/template'
import {renderInfobarTemplate} from 'pages/common/utils/infobar'
import {
    canDrop,
    isSimpleTemplateWidget,
} from 'pages/common/components/infobar/utils'
import UICard from 'infobar/ui/Card'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'

// This is to avoid circular dependencies while doing recursion
import {widgetReference} from '../widgetReference'
import {getWidgetTitle} from '../helpers'
import CustomActions from './customActions'

export const NO_DATA_TEXT = 'No data'

type Props = {
    extensions: {
        AfterTitle?: ElementType
        BeforeContent?: ElementType
        AfterContent?: ElementType
        TitleWrapper?: ElementType
        Wrapper?: ElementType
    }
    editionHiddenFields?: HiddenField[]

    parent?: Map<any, any>
    source?: Map<string, unknown> | undefined
    widget: Map<string, unknown>
    template: Map<string, unknown>

    isEditing: boolean
    isParentList: boolean
    isOpen: boolean
    hasNoBorderTop: boolean
}

export const cardMetaFields: Array<keyof Omit<CardMeta, 'custom'>> = [
    'displayCard',
    'link',
    'pictureUrl',
    'color',
]
export const listMetaFields: Array<keyof ListMeta> = ['limit', 'orderBy']

export default function Card(props: Props) {
    const {
        extensions: {
            AfterTitle,
            BeforeContent,
            AfterContent,
            TitleWrapper,
            Wrapper,
        },
        editionHiddenFields,
        template,
        parent = Map({}),
        source,
        widget,
        isParentList,
        isEditing,
        isOpen,
        hasNoBorderTop,
    } = props
    const InfobarWidget = widgetReference.Widget
    const integrationContext = useContext(IntegrationContext)
    const dispatch = useAppDispatch()
    const widgetsState = useAppSelector(getWidgetsState)

    const parentAbsolutePath = parent?.get('absolutePath', []) as string[]
    const absolutePath = template.get('absolutePath', []) as string[]
    const parentTemplatePath = parent?.get('templatePath', '') as string
    const templatePath = template.get('templatePath', '') as string
    const childWidgets = template.get('widgets', fromJS([])) as List<
        Map<string, unknown>
    >

    const handleEditionStart = () => {
        dispatch(
            startWidgetEdition(isParentList ? parentTemplatePath : templatePath)
        )
    }

    const handleEditionStop = () => {
        dispatch(stopWidgetEdition())
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

        handleEditionStop()
    }

    const handleDelete = () => {
        dispatch(
            removeEditedWidget(
                templatePath,
                isParentList ? parentAbsolutePath : absolutePath
            )
        )
    }

    const cardData: ComponentProps<typeof UICard>['cardData'] = useMemo(
        () => ({
            title: template.get('title', '') as string,
            link: template.getIn(['meta', 'link'], '') as string,
            pictureUrl: template.getIn(['meta', 'pictureUrl'], '') as string,
            color: template.getIn(['meta', 'color'], '') as string,
            displayCard: template.getIn(
                ['meta', 'displayCard'],
                true
            ) as boolean,
            // some legacy template could have a string in there
            limit: Number(
                parent.getIn(
                    ['meta', 'limit'],
                    DEFAULT_LIST_ITEM_DISPLAYED_NUMBER
                ) as number | string
            ),
            orderBy: parent.getIn(['meta', 'orderBy'], '') as string,
        }),
        [template, parent]
    )

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

    const title = getCardTitle()
    const link = template.getIn(['meta', 'link'])
    const onlyContent = cardData.displayCard === false

    const shouldDisplayHeader = () => {
        const hasTitle = Boolean(title)
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
                cardData.color ||
                cardData.pictureUrl ||
                templateCustomLinks.size > 0 ||
                templateCustomButtons.size > 0) &&
                !onlyContent) ||
            isEditing
        )
    }

    // display content (or at least space under card title) if we are in edition mode or if there is data to display
    const shouldDisplayContent = isEditing || !childWidgets.isEmpty()

    // detect first non-text nested widget, to auto-expand
    let firstNonTextWidget = false

    const enrichedEditionHiddenField = [...(editionHiddenFields || [])]
    if (!isParentList) {
        enrichedEditionHiddenField.push('limit', 'orderBy')
    }
    // HTTP is a special case because it can have both custom and hard coded icons
    // Bottom line: these field should be manually hidden by all non http integration
    // providing a TitleWrapper instead of being defined here
    if (
        integrationContext.integration.get('type') !== IntegrationType.Http &&
        Boolean(TitleWrapper)
    ) {
        enrichedEditionHiddenField.push('pictureUrl', 'color')
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

    const legacyProps = {
        template,
        source,
        isEditing,
    }

    const mappedExtensions = {
        afterTitle: AfterTitle && <AfterTitle {...legacyProps} />,
        beforeContent: BeforeContent && <BeforeContent {...legacyProps} />,
        afterContent: AfterContent && <AfterContent {...legacyProps} />,
        renderTitleWrapper: (children: React.ReactNode) => {
            if (!TitleWrapper) return null
            return <TitleWrapper {...legacyProps}>{children}</TitleWrapper>
        },
        renderWrapper: (children: React.ReactNode) => {
            if (!Wrapper) return null
            return <Wrapper {...legacyProps}>{children}</Wrapper>
        },
    }

    return (
        <UICard
            extensions={mappedExtensions}
            editionHiddenFields={enrichedEditionHiddenField}
            customActions={
                isRootWidget(template.get('templatePath') as string) ? (
                    <CustomActions {...legacyProps} />
                ) : null
            }
            displayedTitle={
                title && renderInfobarTemplate(title, source?.toJS())
            }
            dynamicLink={renderTemplate(link, source?.toJS())}
            cardData={cardData}
            orderByOptions={orderByOptions}
            isOpen={isOpen}
            shouldDisplayHeader={shouldDisplayHeader()}
            shouldDisplayContent={shouldDisplayContent}
            isEditionMode={isEditing}
            canDrop={
                isEditing &&
                canDrop(
                    widgetsState.getIn(['_internal', 'drag', 'group']),
                    absolutePath
                )
            }
            isDraggable={!isParentList}
            hasNoBorderTop={hasNoBorderTop}
            onEditionStart={handleEditionStart}
            onEditionStop={handleEditionStop}
            onSubmit={handleEditSubmit}
            onDelete={handleDelete}
        >
            {!source || source?.isEmpty() ? (
                <StaticField>{NO_DATA_TEXT}</StaticField>
            ) : (
                shouldDisplayContent && (
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
                            if (type !== 'text' && !firstNonTextWidget) {
                                firstNonTextWidget = true
                            }

                            // if Card has no header displayed
                            // and first child is another Card
                            // we need to remove border-top
                            let hasNoBorderTop = false
                            if (
                                i === 0 &&
                                (type === 'card' || type === 'list') &&
                                onlyContent
                            ) {
                                hasNoBorderTop = true
                            }
                            return (
                                <InfobarWidget
                                    key={`${
                                        passedTemplate.get('path') as string
                                    }-${i as number}`}
                                    source={source}
                                    parent={template}
                                    widget={widget}
                                    template={passedTemplate}
                                    isOpen={isOpen && firstNonTextWidget}
                                    hasNoBorderTop={hasNoBorderTop}
                                />
                            )
                        })}
                    </DragWrapper>
                )
            )}
        </UICard>
    )
}

function isRootWidget(templatePath: string) {
    // We must handle the case where the first widget after the wrapper
    // is a list, in which case we need to check the second widget
    return (
        templatePath.match(/.template.widgets.(\d+)$/) ||
        templatePath.match(/.template.widgets.(\d+).widgets.0$/)
    )
}
