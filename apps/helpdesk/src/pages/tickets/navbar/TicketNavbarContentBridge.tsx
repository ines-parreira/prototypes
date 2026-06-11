import { useTicketViewNavigationDropHandler } from '@repo/navigation'
import type {
    TicketViewNavigationDragItem,
    TicketViewNavigationDropResult,
} from '@repo/navigation'
import type { DropTargetMonitor } from 'react-dnd'

import type { UserViewsOrderingSettingData } from 'config/types/user'
import type { Section } from 'models/section/types'
import type { View } from 'models/view/types'
import { ViewVisibility } from 'models/view/types'
import type { TicketNavbarDropDirection } from 'pages/tickets/navbar/TicketNavbarDropTarget'
import { TicketNavbarDropTarget } from 'pages/tickets/navbar/TicketNavbarDropTarget'
import type { SectionsState } from 'state/entities/sections/types'
import type { ViewsState } from 'state/entities/views/types'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'

import { DefaultExportTicketNavbarSectionBridge as TicketNavbarSectionBridge } from './TicketNavbarSectionBridge'
import { TicketNavbarView } from './TicketNavbarView'

import css from './TicketNavbarContent.less'

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
        isAccountSetting: boolean,
    ) => void
    sections: SectionsState
    viewUpdated: (view: View) => void
    views: ViewsState
}

export function TicketNavbarContentBridgeContainer({
    elements,
    isMovingItem,
    isPrivate = false,
    onSectionDeleteClick,
    onSectionRenameClick,
    onSubmitMoveItem,
    sections,
    viewUpdated,
    views,
}: OwnProps) {
    const { canDrop, handleDrop } = useTicketViewNavigationDropHandler<
        View,
        Section,
        TicketNavbarElementType.View,
        TicketNavbarElementType.Section
    >({
        elementTypes: {
            section: TicketNavbarElementType.Section,
            view: TicketNavbarElementType.View,
        },
        isMovingItem,
        isPrivate,
        isPrivateSection: (section) => section.private,
        isPrivateView: (view) => view.visibility === ViewVisibility.Private,
        onSubmitMoveItem: (
            nextElement,
            currentElement,
            nextOrdering,
            isPrivateSetting,
        ) => {
            onSubmitMoveItem(
                nextElement as TicketNavbarElement,
                currentElement as TicketNavbarElement,
                nextOrdering as UserViewsOrderingSettingData,
                isPrivateSetting,
            )
        },
        onViewSectionChange: viewUpdated,
        orderedElements: elements,
        sectionsById: sections as Record<number, Section>,
        viewsById: views as Record<number, View>,
    })

    return (
        <TicketNavbarDropTarget
            accept={[
                TicketNavbarElementType.View,
                TicketNavbarElementType.Section,
            ]}
            canDrop={(item) => {
                return canDrop(
                    item as TicketViewNavigationDragItem<
                        TicketNavbarElementType.View,
                        TicketNavbarElementType.Section
                    >,
                )
            }}
            onDrop={(item, monitor, direction) => {
                handleDrop(
                    item as TicketViewNavigationDragItem<
                        TicketNavbarElementType.View,
                        TicketNavbarElementType.Section
                    >,
                    resolveDropResult(monitor, direction),
                )
            }}
            className={css.wrapper}
            topIndicatorClassName={css.contentTopIndicator}
            bottomIndicatorClassName={css.contentBottomIndicator}
        >
            {elements.map((element) =>
                element.type === TicketNavbarElementType.View ? (
                    <TicketNavbarView
                        key={`view-${element.data.id}`}
                        isNested={true}
                        sections={sections}
                        view={element.data}
                        views={views}
                    />
                ) : (
                    <TicketNavbarSectionBridge
                        key={`section-${element.data.id}`}
                        onSectionDeleteClick={onSectionDeleteClick}
                        onSectionRenameClick={onSectionRenameClick}
                        sectionElement={element}
                        sections={sections}
                        views={views}
                    />
                ),
            )}
        </TicketNavbarDropTarget>
    )
}

function resolveDropResult(
    monitor: DropTargetMonitor,
    direction: TicketNavbarDropDirection | null,
): TicketViewNavigationDropResult {
    return (
        (monitor.getDropResult() as TicketViewNavigationDropResult | null) ?? {
            direction: direction as TicketViewNavigationDropResult['direction'],
            sectionId: null,
            viewId: null,
        }
    )
}
