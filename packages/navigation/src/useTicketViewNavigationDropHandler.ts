import { useCallback } from 'react'

import type {
    TicketViewNavigationDragItem,
    TicketViewNavigationDropResult,
} from './createNextTicketViewNavigationOrdering'
import type {
    TicketViewNavigationElement,
    TicketViewNavigationOrdering,
    TicketViewNavigationSection,
    TicketViewNavigationView,
} from './createTicketViewNavigationData'
import { createTicketViewNavigationDropUpdate } from './createTicketViewNavigationDropUpdate'
import { useTicketViewNavigationOrderingStore } from './ticketViewNavigationOrderingStore'

type TicketViewNavigationElementTypes<TViewElementType, TSectionElementType> = {
    section: TSectionElementType
    view: TViewElementType
}

export type UseTicketViewNavigationDropHandlerParams<
    TView extends TicketViewNavigationView,
    TSection extends TicketViewNavigationSection,
    TViewElementType,
    TSectionElementType,
> = {
    elementTypes: TicketViewNavigationElementTypes<
        TViewElementType,
        TSectionElementType
    >
    isMovingItem: boolean
    isPrivate: boolean
    isPrivateSection: (section: TSection & { id: number }) => boolean
    isPrivateView: (view: TView & { id: number }) => boolean
    onSubmitMoveItem: (
        nextElement: TicketViewNavigationElement<
            TView,
            TSection,
            TViewElementType,
            TSectionElementType
        >,
        currentElement: TicketViewNavigationElement<
            TView,
            TSection,
            TViewElementType,
            TSectionElementType
        >,
        nextOrdering: TicketViewNavigationOrdering,
        isPrivate: boolean,
    ) => void
    onViewSectionChange: (view: TView & { id: number }) => void
    orderedElements: TicketViewNavigationElement<
        TView,
        TSection,
        TViewElementType,
        TSectionElementType
    >[]
    sectionsById: Record<number, TSection & { id: number }>
    viewsById: Record<number, TView & { id: number }>
}

export function useTicketViewNavigationDropHandler<
    TView extends TicketViewNavigationView,
    TSection extends TicketViewNavigationSection,
    TViewElementType,
    TSectionElementType,
>({
    elementTypes,
    isMovingItem,
    isPrivate,
    isPrivateSection,
    isPrivateView,
    onSubmitMoveItem,
    onViewSectionChange,
    orderedElements,
    sectionsById,
    viewsById,
}: UseTicketViewNavigationDropHandlerParams<
    TView,
    TSection,
    TViewElementType,
    TSectionElementType
>) {
    const setOptimisticPrivateOrdering = useTicketViewNavigationOrderingStore(
        (state) => state.setOptimisticPrivateOrdering,
    )
    const setOptimisticSharedOrdering = useTicketViewNavigationOrderingStore(
        (state) => state.setOptimisticSharedOrdering,
    )

    const canDrop = useCallback(
        (
            item: TicketViewNavigationDragItem<
                TViewElementType,
                TSectionElementType
            >,
        ) => {
            if (isMovingItem) {
                return false
            }

            if (item.type === elementTypes.section) {
                const section = sectionsById[item.id]

                return (
                    section != null && isPrivateSection(section) === isPrivate
                )
            }

            const view = viewsById[item.id]

            return view != null && isPrivateView(view) === isPrivate
        },
        [
            elementTypes.section,
            isMovingItem,
            isPrivate,
            isPrivateSection,
            isPrivateView,
            sectionsById,
            viewsById,
        ],
    )

    const handleDrop = useCallback(
        (
            item: TicketViewNavigationDragItem<
                TViewElementType,
                TSectionElementType
            >,
            dropResult: TicketViewNavigationDropResult,
        ) => {
            const { currentElement, nextElement, nextOrdering } =
                createTicketViewNavigationDropUpdate({
                    dropResult,
                    elementTypes,
                    item,
                    orderedElements,
                    sectionsById,
                    viewsById,
                })

            if (
                isTicketViewNavigationViewElement(
                    currentElement,
                    elementTypes.view,
                ) &&
                isTicketViewNavigationViewElement(
                    nextElement,
                    elementTypes.view,
                ) &&
                currentElement.data.section_id !== nextElement.data.section_id
            ) {
                onViewSectionChange(nextElement.data)
            }

            if (isPrivate) {
                setOptimisticPrivateOrdering(nextOrdering)
            } else {
                setOptimisticSharedOrdering(nextOrdering)
            }

            onSubmitMoveItem(
                nextElement,
                currentElement,
                nextOrdering,
                isPrivate,
            )
        },
        [
            elementTypes,
            isPrivate,
            onSubmitMoveItem,
            onViewSectionChange,
            orderedElements,
            sectionsById,
            setOptimisticPrivateOrdering,
            setOptimisticSharedOrdering,
            viewsById,
        ],
    )

    return { canDrop, handleDrop }
}

function isTicketViewNavigationViewElement<
    TView extends TicketViewNavigationView,
    TSection extends TicketViewNavigationSection,
    TViewElementType,
    TSectionElementType,
>(
    element: TicketViewNavigationElement<
        TView,
        TSection,
        TViewElementType,
        TSectionElementType
    >,
    viewElementType: TViewElementType,
): element is {
    data: TView & { id: number }
    type: TViewElementType
} {
    return element.type === viewElementType
}
