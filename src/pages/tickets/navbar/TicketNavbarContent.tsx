import classnames from 'classnames'
import React, {useCallback} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {DropTargetMonitor} from 'react-dnd'
import {useLocalStorage} from 'react-use'
import {produce} from 'immer'

import {Section} from '../../../models/section/types'
import {View, ViewVisibility} from '../../../models/view/types'
import {RootState} from '../../../state/types'
import {viewUpdated} from '../../../state/entities/views/actions'
import {notify} from '../../../state/notifications/actions'
import {ViewsState} from '../../../state/entities/views/types'
import {SectionsState} from '../../../state/entities/sections/types'
import {UserViewsOrderingSettingData} from '../../../config/types/user'
import {
    optimisticAccountSettingsSet,
    optimisticUserSettingsSet,
} from '../../../state/ui/ticketNavbar/actions'

import {TicketNavbarElementType} from './TicketNavbar'
import TicketNavbarSection from './TicketNavbarSection'
import TicketNavbarView from './TicketNavbarView'
import css from './TicketNavbarContent.less'
import TicketNavbarDropTarget, {
    TicketNavbarDragObject,
    TicketNavbarDropResult,
    TicketNavbarDropDirection,
} from './TicketNavbarDropTarget'

export type TicketNavbarSectionElement = {
    data: Section
    type: TicketNavbarElementType.Section
    children: View[]
}

export type TicketNavbarElement =
    | {
          data: View
          type: TicketNavbarElementType.View
      }
    | TicketNavbarSectionElement

type OwnProps = {
    elements: TicketNavbarElement[]
    isMovingItem: boolean
    isPrivate?: boolean
    onSectionDeleteClick?: (sectionId: number) => void
    onSectionRenameClick?: (sectionId: number) => void
    onSubmitMoveItem: (
        nextElement: TicketNavbarElement,
        currentElement: TicketNavbarElement,
        nextSetting: UserViewsOrderingSettingData,
        isAccountSetting: boolean
    ) => void
}

export function TicketNavbarContentContainer({
    elements,
    isMovingItem,
    isPrivate = false,
    notify,
    onSectionDeleteClick,
    onSectionRenameClick,
    onSubmitMoveItem,
    optimisticAccountSettingsSet,
    optimisticUserSettingsSet,
    sections,
    views,
    viewUpdated,
}: OwnProps & ConnectedProps<typeof connector>) {
    const [collapsedSections, setCollapsedSections] = useLocalStorage<number[]>(
        'collapsed-view-sections',
        []
    )
    const handleDrop = useCallback(
        (
            item: TicketNavbarDragObject,
            monitor: DropTargetMonitor,
            direction: TicketNavbarDropDirection | null
        ) => {
            const dropResult = (monitor.getDropResult() as TicketNavbarDropResult) || {
                sectionId: null,
                direction,
            }

            const currentElement: TicketNavbarElement =
                item.type === TicketNavbarElementType.View
                    ? {data: views[item.id], type: TicketNavbarElementType.View}
                    : {
                          data: sections[item.id],
                          type: TicketNavbarElementType.Section,
                          children: [],
                      }
            const nextElement: TicketNavbarElement =
                item.type === TicketNavbarElementType.View
                    ? {
                          data: {
                              ...views[item.id],
                              section_id:
                                  dropResult.sectionId != null &&
                                  dropResult.viewId == null &&
                                  dropResult.direction ===
                                      TicketNavbarDropDirection.Up
                                      ? null
                                      : dropResult.sectionId || null,
                          },
                          type: TicketNavbarElementType.View,
                      }
                    : currentElement

            if (
                currentElement.type === TicketNavbarElementType.View &&
                nextElement.type === TicketNavbarElementType.View &&
                currentElement.data.section_id !== nextElement.data.section_id
            ) {
                viewUpdated(nextElement.data)
            }
            const nextSettings = getNextSettings(
                item,
                dropResult,
                elements,
                views,
                sections
            )

            if (isPrivate) {
                optimisticUserSettingsSet(nextSettings)
            } else {
                optimisticAccountSettingsSet(nextSettings)
            }

            onSubmitMoveItem(
                nextElement,
                currentElement,
                nextSettings,
                isPrivate
            )
        },
        [views, sections, isPrivate, viewUpdated, notify, elements]
    )
    const handleClickOnSection = (sectionId: number) => {
        if (collapsedSections) {
            setCollapsedSections(
                collapsedSections.includes(sectionId)
                    ? produce(collapsedSections, (sections) => {
                          sections.splice(sections.indexOf(sectionId), 1)
                      })
                    : [...collapsedSections, sectionId]
            )
        }
    }

    return (
        <TicketNavbarDropTarget
            accept={Object.values(TicketNavbarElementType)}
            canDrop={(item) => {
                if (isMovingItem) {
                    return false
                }
                return item.type === TicketNavbarElementType.Section
                    ? sections[item.id].private === isPrivate
                    : isPrivate
                    ? views[item.id].visibility === ViewVisibility.Private
                    : views[item.id].visibility !== ViewVisibility.Private
            }}
            className={classnames(css.wrapper, 'menu')}
            onDrop={handleDrop}
            topIndicatorClassName={css.contentTopIndicator}
            bottomIndicatorClassName={css.contentBottomIndicator}
        >
            {elements.map((element) =>
                element.type === TicketNavbarElementType.View ? (
                    <TicketNavbarView
                        key={`view-${element.data.id}`}
                        view={element.data}
                    />
                ) : (
                    <TicketNavbarSection
                        key={`section-${element.data.id}`}
                        isExpanded={
                            !!collapsedSections &&
                            !collapsedSections.includes(element.data.id)
                        }
                        onSectionClick={handleClickOnSection}
                        onSectionDeleteClick={onSectionDeleteClick}
                        onSectionRenameClick={onSectionRenameClick}
                        sectionElement={element}
                    />
                )
            )}
        </TicketNavbarDropTarget>
    )
}

const connector = connect(
    (state: RootState) => ({
        sections: state.entities.sections,
        views: state.entities.views,
    }),
    {
        notify,
        optimisticAccountSettingsSet,
        optimisticUserSettingsSet,
        viewUpdated,
    }
)

export default connector(TicketNavbarContentContainer)

export const getNextSettings = (
    item: TicketNavbarDragObject,
    dropResult: TicketNavbarDropResult,
    orderedElements: TicketNavbarElement[],
    views: ViewsState,
    sections: SectionsState
) => {
    const currentElement: TicketNavbarElement =
        item.type === TicketNavbarElementType.View
            ? {data: views[item.id], type: TicketNavbarElementType.View}
            : {
                  data: sections[item.id],
                  type: TicketNavbarElementType.Section,
                  children: Object.values(views).filter(
                      (view) => view.section_id === item.id
                  ),
              }
    const isShallowContentDropped =
        dropResult.sectionId == null && dropResult.viewId == null
    let iterator = 0

    return orderedElements
        .reduce((acc, element, index) => {
            let handledElement = element
            if (
                index === 0 &&
                isShallowContentDropped &&
                dropResult.direction === TicketNavbarDropDirection.Up
            ) {
                acc.push(currentElement)
            }
            if (
                (handledElement.data.id === dropResult.viewId &&
                    element.type === TicketNavbarElementType.View) ||
                (handledElement.type === TicketNavbarElementType.Section &&
                    item.type === TicketNavbarElementType.Section &&
                    dropResult.sectionId === handledElement.data.id)
            ) {
                if (dropResult.direction === TicketNavbarDropDirection.Up) {
                    acc.push(currentElement)
                }
                acc.push(handledElement)
                if (dropResult.direction === TicketNavbarDropDirection.Down) {
                    acc.push(currentElement)
                }
                return acc
            }
            if (
                element.type === TicketNavbarElementType.Section &&
                dropResult.sectionId === element.data.id &&
                dropResult.viewId == null
            ) {
                if (dropResult.direction === TicketNavbarDropDirection.Up) {
                    acc.push(currentElement)
                    acc.push(handledElement)
                } else {
                    const nextElement: TicketNavbarElement = {
                        ...element,
                        children: [
                            views[item.id],
                            ...element.children.filter((child) => {
                                return item.type ===
                                    TicketNavbarElementType.View
                                    ? child.id !== item.id
                                    : true
                            }),
                        ],
                    }
                    acc.push(nextElement)
                }
                return acc
            }
            if (
                item.type === TicketNavbarElementType.View &&
                handledElement.type === TicketNavbarElementType.Section &&
                (handledElement.data.id === dropResult.sectionId ||
                    views[item.id].section_id === handledElement.data.id)
            ) {
                handledElement = {
                    ...handledElement,
                    children: handledElement.children.reduce((acc, view) => {
                        if (view.id === item.id) {
                            return acc
                        }
                        if (view.id === dropResult.viewId) {
                            if (
                                dropResult.direction ===
                                TicketNavbarDropDirection.Up
                            ) {
                                acc.push(views[item.id])
                            }
                            acc.push(view)
                            if (
                                dropResult.direction ===
                                TicketNavbarDropDirection.Down
                            ) {
                                acc.push(views[item.id])
                            }
                        } else {
                            acc.push(view)
                        }
                        return acc
                    }, [] as View[]),
                }
            }
            if (element.type !== item.type || element.data.id !== item.id) {
                acc.push(handledElement)
            }
            if (
                index === orderedElements.length - 1 &&
                isShallowContentDropped &&
                dropResult.direction === TicketNavbarDropDirection.Down
            ) {
                acc.push(currentElement)
            }

            return acc
        }, [] as TicketNavbarElement[])
        .reduce(
            (acc, element) => {
                if (element.type === TicketNavbarElementType.View) {
                    acc.views[element.data.id] = {display_order: iterator}
                } else {
                    acc.view_sections[element.data.id] = {
                        display_order: iterator,
                    }
                    element.children.map((view) => {
                        iterator++
                        acc.views[view.id] = {display_order: iterator}
                    })
                }
                iterator++
                return acc
            },
            {
                views: {},
                view_sections: {},
            } as UserViewsOrderingSettingData
        )
}
