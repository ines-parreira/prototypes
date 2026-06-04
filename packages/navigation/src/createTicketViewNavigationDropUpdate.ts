import {
    createNextTicketViewNavigationOrdering,
    TicketViewNavigationDropDirection,
} from './createNextTicketViewNavigationOrdering'
import type {
    TicketViewNavigationDragItem,
    TicketViewNavigationDropResult,
} from './createNextTicketViewNavigationOrdering'
import type {
    TicketViewNavigationElement,
    TicketViewNavigationOrdering,
    TicketViewNavigationSection,
    TicketViewNavigationSectionElement,
    TicketViewNavigationView,
} from './createTicketViewNavigationData'

export type CreateTicketViewNavigationDropUpdateParams<
    TView extends TicketViewNavigationView,
    TSection extends TicketViewNavigationSection,
    TViewElementType,
    TSectionElementType,
> = {
    dropResult: TicketViewNavigationDropResult
    elementTypes: {
        section: TSectionElementType
        view: TViewElementType
    }
    item: TicketViewNavigationDragItem<TViewElementType, TSectionElementType>
    orderedElements: TicketViewNavigationElement<
        TView,
        TSection,
        TViewElementType,
        TSectionElementType
    >[]
    sectionsById: Record<number, TSection & { id: number }>
    viewsById: Record<number, TView & { id: number }>
}

export type TicketViewNavigationDropUpdate<
    TView extends TicketViewNavigationView,
    TSection extends TicketViewNavigationSection,
    TViewElementType,
    TSectionElementType,
> = {
    currentElement: TicketViewNavigationElement<
        TView,
        TSection,
        TViewElementType,
        TSectionElementType
    >
    nextElement: TicketViewNavigationElement<
        TView,
        TSection,
        TViewElementType,
        TSectionElementType
    >
    nextOrdering: TicketViewNavigationOrdering
}

export function createTicketViewNavigationDropUpdate<
    TView extends TicketViewNavigationView,
    TSection extends TicketViewNavigationSection,
    TViewElementType,
    TSectionElementType,
>({
    dropResult,
    elementTypes,
    item,
    orderedElements,
    sectionsById,
    viewsById,
}: CreateTicketViewNavigationDropUpdateParams<
    TView,
    TSection,
    TViewElementType,
    TSectionElementType
>): TicketViewNavigationDropUpdate<
    TView,
    TSection,
    TViewElementType,
    TSectionElementType
> {
    type NavigationElement = TicketViewNavigationElement<
        TView,
        TSection,
        TViewElementType,
        TSectionElementType
    >

    const currentElement: NavigationElement =
        item.type === elementTypes.view
            ? {
                  data: viewsById[item.id],
                  type: elementTypes.view,
              }
            : getCurrentSectionElement({
                  elementTypes,
                  itemId: item.id,
                  orderedElements,
                  sectionsById,
                  viewsById,
              })

    const nextElement: NavigationElement =
        item.type === elementTypes.view
            ? {
                  data: {
                      ...viewsById[item.id],
                      section_id: getNextViewSectionId(dropResult),
                  },
                  type: elementTypes.view,
              }
            : currentElement

    return {
        currentElement,
        nextElement,
        nextOrdering: createNextTicketViewNavigationOrdering({
            dropResult,
            elementTypes,
            item,
            orderedElements,
            sectionsById,
            viewsById,
        }),
    }
}

function getNextViewSectionId(dropResult: TicketViewNavigationDropResult) {
    if (
        dropResult.sectionId != null &&
        dropResult.viewId == null &&
        dropResult.direction === TicketViewNavigationDropDirection.Up
    ) {
        return null
    }

    return dropResult.sectionId ?? null
}

function getCurrentSectionElement<
    TView extends TicketViewNavigationView,
    TSection extends TicketViewNavigationSection,
    TViewElementType,
    TSectionElementType,
>({
    elementTypes,
    itemId,
    orderedElements,
    sectionsById,
    viewsById,
}: {
    elementTypes: {
        section: TSectionElementType
        view: TViewElementType
    }
    itemId: number
    orderedElements: TicketViewNavigationElement<
        TView,
        TSection,
        TViewElementType,
        TSectionElementType
    >[]
    sectionsById: Record<number, TSection & { id: number }>
    viewsById: Record<number, TView & { id: number }>
}): TicketViewNavigationSectionElement<TView, TSection, TSectionElementType> {
    const existingSectionElement = orderedElements.find(
        (
            element,
        ): element is TicketViewNavigationSectionElement<
            TView,
            TSection,
            TSectionElementType
        > => 'children' in element && element.data.id === itemId,
    )

    return (
        existingSectionElement ?? {
            children: Object.values(viewsById).filter(
                (view) => view.section_id === itemId,
            ),
            data: sectionsById[itemId],
            type: elementTypes.section,
        }
    )
}
