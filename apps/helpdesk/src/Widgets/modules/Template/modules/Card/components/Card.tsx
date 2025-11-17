import type { ComponentProps, ElementType } from 'react'
import type React from 'react'
import { useContext, useMemo } from 'react'

import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import type {
    CardMeta,
    CardTemplate,
    ListMeta,
    PartialTemplate,
    Source,
    Template,
} from 'models/widget/types'
import { isListTemplate, isSourceRecord } from 'models/widget/types'
import DragWrapper from 'pages/common/components/dragging/WidgetsDragWrapper'
import { getWidgetTitle } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
import CustomActions from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions'
import {
    hasCustomAction,
    isSimpleTemplateWidget,
} from 'pages/common/components/infobar/utils'
import { renderInfobarTemplate } from 'pages/common/utils/infobar'
import { renderTemplate } from 'pages/common/utils/template'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import { getWidgetsState } from 'state/widgets/selectors'
import { updateRecord } from 'utils/types'
import { WidgetContext } from 'Widgets/contexts/WidgetContext'
import { DEFAULT_LIST_ITEM_DISPLAYED_NUMBER } from 'Widgets/modules/Template/config/template'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

import UICard from '../components/views'
import { canDrop } from '../helpers/canDrop'
import { isDefaultOpen } from '../helpers/isDefaultOpen'
import type { CardEditFormState, HiddenField } from '../types'

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

    parentTemplate?: Template
    source: Source
    template: CardTemplate
    children?: React.ReactNode

    isEditing: boolean
    isFirstOfList?: boolean
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
        extensions,
        editionHiddenFields,
        template,
        parentTemplate,
        source,
        children,
        isEditing,
        isFirstOfList,
    } = props
    const integrationContext = useContext(IntegrationContext)
    const widget = useContext(WidgetContext)
    const dispatch = useAppDispatch()
    const widgetsState = useAppSelector(getWidgetsState)

    const isParentList =
        (parentTemplate && parentTemplate.type === 'list') || false
    const parentAbsolutePath = parentTemplate?.absolutePath || []
    const absolutePath = template.absolutePath || []
    const parentTemplatePath = parentTemplate?.templatePath || ''
    const templatePath = template.templatePath || ''
    const childTemplates = template.widgets || []

    const handleEditionStart = () => {
        dispatch(
            startWidgetEdition(
                isParentList ? parentTemplatePath : templatePath,
            ),
        )
    }

    const handleEditionStop = () => {
        dispatch(stopWidgetEdition())
    }

    const handleEditSubmit = (formState: CardEditFormState) => {
        const card: DeepPartial<CardTemplate> = {
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
                title: parentTemplate?.title,
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
                isParentList ? parentAbsolutePath : absolutePath,
            ),
        )
    }

    const cardData: ComponentProps<typeof UICard>['cardData'] = useMemo(
        () => ({
            title: template.title || '',
            link: template.meta?.link || '',
            pictureUrl: template.meta?.pictureUrl || '',
            color: template.meta?.color || '',
            displayCard:
                typeof template.meta?.displayCard === 'boolean'
                    ? template.meta?.displayCard
                    : true,
            // some legacy template could have a string in there
            limit: Number(
                (isListTemplate(parentTemplate) &&
                    parentTemplate.meta?.limit) ||
                    DEFAULT_LIST_ITEM_DISPLAYED_NUMBER,
            ),
            orderBy:
                (isListTemplate(parentTemplate) &&
                    parentTemplate.meta?.orderBy) ||
                '',
        }),
        [template, parentTemplate],
    )

    const getCardTitle = () => {
        return isRootWidget(template.templatePath || '')
            ? getWidgetTitle({
                  source: source,
                  widgetType: widget.type,
                  template,
                  appId: widget.app_id,
                  integration: integrationContext.integration?.toJS(),
              })
            : template.title || ''
    }

    const title = getCardTitle()
    const link = template.meta?.link || ''

    const shouldDisplayHeader = () => {
        const hasTitle = Boolean(title)
        return (
            ((hasTitle ||
                cardData.color ||
                cardData.pictureUrl ||
                hasCustomAction(template)) &&
                // beware, display card being undefined means true here
                !cardData.displayCard === false) ||
            isEditing
        )
    }

    // display content (or at least space under card title) if we are in edition mode or if there is data to display
    const shouldDisplayContent = isEditing || !!childTemplates.length

    const enrichedEditionHiddenField = [...(editionHiddenFields || [])]
    if (!isParentList) {
        enrichedEditionHiddenField.push('limit', 'orderBy')
    }
    // HTTP is a special case because it can have both custom and hard coded icons
    // Bottom line: these field should be manually hidden by all non http integration
    // providing a TitleWrapper instead of being defined here
    if (
        integrationContext.integration.get('type') !== IntegrationType.Http &&
        Boolean(extensions.TitleWrapper)
    ) {
        enrichedEditionHiddenField.push('pictureUrl', 'color')
    }

    const orderByOptions = childTemplates.filter(isSimpleTemplateWidget).reduce(
        (acc, { title = '', path }) => {
            ;['-', '+'].forEach((order) =>
                acc.push({
                    value: `${order}${typeof path === 'string' ? path : ''}`,
                    label: `${title} (${order === '-' ? 'DESC' : 'ASC'})`,
                }),
            )
            return acc
        },
        [] as { value: string; label: string }[],
    )

    return (
        <UICard
            extensions={buildExtensions(props)}
            editionHiddenFields={enrichedEditionHiddenField}
            customActions={
                isRootWidget(template.templatePath || '') ? (
                    <CustomActions
                        template={template}
                        source={source}
                        isEditing={isEditing}
                    />
                ) : null
            }
            displayedTitle={
                title &&
                renderInfobarTemplate(
                    title,
                    isSourceRecord(source) ? source : undefined,
                )
            }
            dynamicLink={renderTemplate(link, source)}
            cardData={cardData}
            orderByOptions={orderByOptions}
            shouldDisplayHeader={shouldDisplayHeader()}
            shouldDisplayContent={shouldDisplayContent}
            isEditionMode={isEditing}
            canDrop={
                isEditing &&
                canDrop(
                    widgetsState.getIn(['_internal', 'drag', 'group']),
                    absolutePath,
                )
            }
            isDraggable={!isParentList}
            onEditionStart={handleEditionStart}
            onEditionStop={handleEditionStop}
            onSubmit={handleEditSubmit}
            onDelete={handleDelete}
            isDefaultOpen={isDefaultOpen({
                isEditing,
                parentTemplate,
                isFirstOfList,
            })}
        >
            {!isSourceRecord(source) ||
            Object.values(source).every((value) => value === undefined) ? (
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
                        {children}
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

function buildExtensions({
    extensions,
    template,
    source,
    isEditing,
}: {
    extensions: ComponentProps<typeof Card>['extensions']
    template: CardTemplate
    source: Source
    isEditing: boolean
}) {
    const mappedExtensions: ComponentProps<typeof UICard>['extensions'] = {
        afterTitle: undefined,
        beforeContent: undefined,
        afterContent: undefined,
        renderTitleWrapper: () => null,
        renderWrapper: () => null,
    }
    // We don’t want to convert object to immutable objects if card has no extensions
    // Because it has a performance cost
    if (hasExtension(extensions)) {
        const {
            AfterTitle,
            BeforeContent,
            AfterContent,
            TitleWrapper,
            Wrapper,
        } = extensions
        const legacyProps = {
            template: fromJS(template) as Map<string, unknown>,
            source: fromJS(source) as Map<string, unknown>,
            isEditing,
        }

        mappedExtensions.afterTitle = AfterTitle && (
            <AfterTitle {...legacyProps} />
        )
        mappedExtensions.beforeContent = BeforeContent && (
            <BeforeContent {...legacyProps} />
        )
        mappedExtensions.afterContent = AfterContent && (
            <AfterContent {...legacyProps} />
        )
        mappedExtensions.renderTitleWrapper = (children: React.ReactNode) => {
            if (!TitleWrapper) return null
            return <TitleWrapper {...legacyProps}>{children}</TitleWrapper>
        }
        mappedExtensions.renderWrapper = (children: React.ReactNode) => {
            if (!Wrapper) return null
            return <Wrapper {...legacyProps}>{children}</Wrapper>
        }
    }
    return mappedExtensions
}

function hasExtension(extensions: Record<string, ElementType | undefined>) {
    return Object.values(extensions).some((value) => Boolean(value))
}
