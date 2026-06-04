import type {
    TicketViewNavigationElement,
    TicketViewNavigationOrdering,
    TicketViewNavigationSection,
    TicketViewNavigationSectionElement,
    TicketViewNavigationView,
} from './createTicketViewNavigationData'

export const TicketViewNavigationDropDirection = {
    Down: 'down',
    Up: 'up',
} as const

export type TicketViewNavigationDropDirectionValue =
    (typeof TicketViewNavigationDropDirection)[keyof typeof TicketViewNavigationDropDirection]

export type TicketViewNavigationDragItem<
    TViewElementType,
    TSectionElementType,
> = {
    id: number
    type: TViewElementType | TSectionElementType
}

export type TicketViewNavigationDropResult = {
    direction: TicketViewNavigationDropDirectionValue | null
    sectionId?: number | null
    viewId?: number | null
}

export type CreateNextTicketViewNavigationOrderingParams<
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

export function createNextTicketViewNavigationOrdering<
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
}: CreateNextTicketViewNavigationOrderingParams<
    TView,
    TSection,
    TViewElementType,
    TSectionElementType
>): TicketViewNavigationOrdering {
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
    const isShallowContentDropped =
        dropResult.sectionId == null && dropResult.viewId == null
    let iterator = 0

    return orderedElements
        .reduce((acc, element, index) => {
            let handledElement = element
            if (
                index === 0 &&
                isShallowContentDropped &&
                dropResult.direction === TicketViewNavigationDropDirection.Up
            ) {
                acc.push(currentElement)
            }
            if (
                (handledElement.data.id === dropResult.viewId &&
                    element.type === elementTypes.view) ||
                (handledElement.type === elementTypes.section &&
                    item.type === elementTypes.section &&
                    dropResult.sectionId === handledElement.data.id)
            ) {
                if (
                    dropResult.direction ===
                    TicketViewNavigationDropDirection.Up
                ) {
                    acc.push(currentElement)
                }
                acc.push(handledElement)
                if (
                    dropResult.direction ===
                    TicketViewNavigationDropDirection.Down
                ) {
                    acc.push(currentElement)
                }
                return acc
            }
            if (
                isSectionElement(element) &&
                dropResult.sectionId === element.data.id &&
                dropResult.viewId == null
            ) {
                if (
                    dropResult.direction ===
                    TicketViewNavigationDropDirection.Up
                ) {
                    acc.push(currentElement)
                    acc.push(handledElement)
                } else {
                    acc.push({
                        ...element,
                        children: [
                            viewsById[item.id],
                            ...element.children.filter(
                                (child) =>
                                    item.type !== elementTypes.view ||
                                    child.id !== item.id,
                            ),
                        ],
                    })
                }
                return acc
            }
            if (
                item.type === elementTypes.view &&
                isSectionElement(handledElement) &&
                (handledElement.data.id === dropResult.sectionId ||
                    viewsById[item.id].section_id === handledElement.data.id)
            ) {
                handledElement = {
                    ...handledElement,
                    children: handledElement.children.reduce(
                        (children, view) => {
                            if (view.id === item.id) {
                                return children
                            }
                            if (view.id === dropResult.viewId) {
                                if (
                                    dropResult.direction ===
                                    TicketViewNavigationDropDirection.Up
                                ) {
                                    children.push(viewsById[item.id])
                                }
                                children.push(view)
                                if (
                                    dropResult.direction ===
                                    TicketViewNavigationDropDirection.Down
                                ) {
                                    children.push(viewsById[item.id])
                                }
                            } else {
                                children.push(view)
                            }
                            return children
                        },
                        [] as Array<TView & { id: number }>,
                    ),
                }
            }
            if (element.type !== item.type || element.data.id !== item.id) {
                acc.push(handledElement)
            }
            if (
                index === orderedElements.length - 1 &&
                isShallowContentDropped &&
                dropResult.direction === TicketViewNavigationDropDirection.Down
            ) {
                acc.push(currentElement)
            }

            return acc
        }, [] as NavigationElement[])
        .reduce(
            (acc, element) => {
                if (!isSectionElement(element)) {
                    acc.views[element.data.id] = { display_order: iterator }
                } else {
                    acc.view_sections[element.data.id] = {
                        display_order: iterator,
                    }
                    element.children.forEach((view) => {
                        iterator++
                        acc.views[view.id] = { display_order: iterator }
                    })
                }
                iterator++
                return acc
            },
            {
                view_sections: {},
                views: {},
            } as TicketViewNavigationOrdering,
        )
}

function isSectionElement<
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
): element is TicketViewNavigationSectionElement<
    TView,
    TSection,
    TSectionElementType
> {
    return 'children' in element
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
        > => isSectionElement(element) && element.data.id === itemId,
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
