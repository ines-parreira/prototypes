export const TicketViewNavigationElementType = {
    Section: 'section',
    View: 'view',
} as const

export type TicketViewNavigationElementTypeValue =
    (typeof TicketViewNavigationElementType)[keyof typeof TicketViewNavigationElementType]

export type TicketViewNavigationOrderMap = Record<
    string,
    { display_order: number }
>

export type TicketViewNavigationOrdering = {
    views: TicketViewNavigationOrderMap
    view_sections: TicketViewNavigationOrderMap
}

export const EMPTY_TICKET_VIEW_NAVIGATION_ORDERING: TicketViewNavigationOrdering =
    {
        view_sections: {},
        views: {},
    }

export type TicketViewNavigationView = {
    category?: string | null
    id?: number | null
    section_id?: number | null
    type?: string | null
}

export type TicketViewNavigationSection = {
    id?: number | null
}

export type TicketViewNavigationSectionElement<
    TView extends TicketViewNavigationView = TicketViewNavigationView,
    TSection extends TicketViewNavigationSection = TicketViewNavigationSection,
    TSectionElementType = typeof TicketViewNavigationElementType.Section,
> = {
    children: Array<TView & { id: number }>
    data: TSection & { id: number }
    type: TSectionElementType
}

export type TicketViewNavigationElement<
    TView extends TicketViewNavigationView = TicketViewNavigationView,
    TSection extends TicketViewNavigationSection = TicketViewNavigationSection,
    TViewElementType = typeof TicketViewNavigationElementType.View,
    TSectionElementType = typeof TicketViewNavigationElementType.Section,
> =
    | {
          data: TView & { id: number }
          type: TViewElementType
      }
    | TicketViewNavigationSectionElement<TView, TSection, TSectionElementType>

export type CreateTicketViewNavigationDataParams<
    TView extends TicketViewNavigationView,
    TSection extends TicketViewNavigationSection,
    TViewElementType = typeof TicketViewNavigationElementType.View,
    TSectionElementType = typeof TicketViewNavigationElementType.Section,
> = {
    elementTypes?: {
        section: TSectionElementType
        view: TViewElementType
    }
    optimisticPrivateOrdering: TicketViewNavigationOrdering
    optimisticSharedOrdering: TicketViewNavigationOrdering
    persistedPrivateOrdering: TicketViewNavigationOrdering
    persistedSharedOrdering: TicketViewNavigationOrdering
    privateSections: TSection[]
    privateViews: TView[]
    sharedSections: TSection[]
    sharedViews: TView[]
}

export type TicketViewNavigationData<
    TView extends TicketViewNavigationView = TicketViewNavigationView,
    TSection extends TicketViewNavigationSection = TicketViewNavigationSection,
    TViewElementType = typeof TicketViewNavigationElementType.View,
    TSectionElementType = typeof TicketViewNavigationElementType.Section,
> = {
    privateElements: TicketViewNavigationElement<
        TView,
        TSection,
        TViewElementType,
        TSectionElementType
    >[]
    sectionsById: Record<number, TSection & { id: number }>
    sharedElements: TicketViewNavigationElement<
        TView,
        TSection,
        TViewElementType,
        TSectionElementType
    >[]
    viewsById: Record<number, TView & { id: number }>
}

const TICKET_LIST_VIEW_TYPE = 'ticket-list'
const SYSTEM_VIEW_CATEGORY = 'system'

export function createTicketViewNavigationData<
    TView extends TicketViewNavigationView,
    TSection extends TicketViewNavigationSection,
    TViewElementType = typeof TicketViewNavigationElementType.View,
    TSectionElementType = typeof TicketViewNavigationElementType.Section,
>({
    elementTypes,
    optimisticPrivateOrdering,
    optimisticSharedOrdering,
    persistedPrivateOrdering,
    persistedSharedOrdering,
    privateSections,
    privateViews,
    sharedSections,
    sharedViews,
}: CreateTicketViewNavigationDataParams<
    TView,
    TSection,
    TViewElementType,
    TSectionElementType
>): TicketViewNavigationData<
    TView,
    TSection,
    TViewElementType,
    TSectionElementType
> {
    const resolvedElementTypes = {
        section: TicketViewNavigationElementType.Section,
        view: TicketViewNavigationElementType.View,
        ...elementTypes,
    } as {
        section: TSectionElementType
        view: TViewElementType
    }

    return {
        privateElements: createTicketViewNavigationElements({
            elementTypes: resolvedElementTypes,
            optimisticOrdering: optimisticPrivateOrdering,
            persistedOrdering: persistedPrivateOrdering,
            sections: privateSections,
            views: privateViews,
        }),
        sectionsById: createSectionsById([
            ...sharedSections,
            ...privateSections,
        ]),
        sharedElements: createTicketViewNavigationElements({
            elementTypes: resolvedElementTypes,
            optimisticOrdering: optimisticSharedOrdering,
            persistedOrdering: persistedSharedOrdering,
            sections: sharedSections,
            views: sharedViews,
        }),
        viewsById: createViewsById([...sharedViews, ...privateViews]),
    }
}

function createTicketViewNavigationElements<
    TView extends TicketViewNavigationView,
    TSection extends TicketViewNavigationSection,
    TViewElementType,
    TSectionElementType,
>({
    elementTypes,
    optimisticOrdering,
    persistedOrdering,
    sections,
    views,
}: {
    elementTypes: {
        section: TSectionElementType
        view: TViewElementType
    }
    optimisticOrdering: TicketViewNavigationOrdering
    persistedOrdering: TicketViewNavigationOrdering
    sections: TSection[]
    views: TView[]
}): TicketViewNavigationElement<
    TView,
    TSection,
    TViewElementType,
    TSectionElementType
>[] {
    const sectionsById = createSectionsById(sections)
    const sectionIds = new Set(Object.keys(sectionsById))
    type ViewElement = {
        data: TView & { id: number }
        type: TViewElementType
    }
    type SectionElement = TicketViewNavigationSectionElement<
        TView,
        TSection,
        TSectionElementType
    >

    const viewElements: ViewElement[] = views
        .filter(isTicketNavigationView)
        .map((view) => ({
            data: view,
            type: elementTypes.view,
        }))

    const sectionElements: SectionElement[] = Object.values(sectionsById).map(
        (section) => ({
            children: viewElements
                .reduce(
                    (acc, viewElement) => {
                        if (viewElement.data.section_id === section.id) {
                            acc.push(viewElement.data)
                        }
                        return acc
                    },
                    [] as Array<TView & { id: number }>,
                )
                .sort((firstView, secondView) => {
                    const displayOrderDiff =
                        getViewDisplayOrder(
                            firstView.id,
                            persistedOrdering,
                            optimisticOrdering,
                        ) -
                        getViewDisplayOrder(
                            secondView.id,
                            persistedOrdering,
                            optimisticOrdering,
                        )

                    return displayOrderDiff || firstView.id - secondView.id
                }),
            data: section,
            type: elementTypes.section,
        }),
    )

    const elements: TicketViewNavigationElement<
        TView,
        TSection,
        TViewElementType,
        TSectionElementType
    >[] = [...viewElements, ...sectionElements]

    return elements
        .filter(
            (element) =>
                isSectionElement(element) ||
                element.data.section_id == null ||
                !sectionIds.has(element.data.section_id.toString()),
        )
        .sort((firstElement, secondElement) => {
            const displayOrderDiff =
                getElementDisplayOrder(
                    firstElement,
                    persistedOrdering,
                    optimisticOrdering,
                ) -
                getElementDisplayOrder(
                    secondElement,
                    persistedOrdering,
                    optimisticOrdering,
                )

            return (
                displayOrderDiff ||
                getLegacyElementTieBreakOrder(firstElement) -
                    getLegacyElementTieBreakOrder(secondElement)
            )
        })
}

function getLegacyElementTieBreakOrder<
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
) {
    const elementTypeOffset = isSectionElement(element) ? 1_000_000_000 : 0
    return elementTypeOffset + element.data.id
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

function isTicketNavigationView<TView extends TicketViewNavigationView>(
    view: TView,
): view is TView & { id: number } {
    return (
        view.id != null &&
        view.type === TICKET_LIST_VIEW_TYPE &&
        view.category !== SYSTEM_VIEW_CATEGORY
    )
}

function createViewsById<TView extends TicketViewNavigationView>(
    views: TView[],
) {
    return views.reduce(
        (acc, view) => {
            if (view.id != null) {
                acc[view.id] = view as TView & { id: number }
            }
            return acc
        },
        {} as Record<number, TView & { id: number }>,
    )
}

function createSectionsById<TSection extends TicketViewNavigationSection>(
    sections: TSection[],
) {
    return sections.reduce(
        (acc, section) => {
            if (section.id != null) {
                acc[section.id] = section as TSection & { id: number }
            }
            return acc
        },
        {} as Record<number, TSection & { id: number }>,
    )
}

function getElementDisplayOrder<
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
    persistedOrdering: TicketViewNavigationOrdering,
    optimisticOrdering: TicketViewNavigationOrdering,
) {
    if (isSectionElement(element)) {
        return (
            optimisticOrdering.view_sections[element.data.id]?.display_order ??
            persistedOrdering.view_sections[element.data.id]?.display_order ??
            Infinity
        )
    }

    return getViewDisplayOrder(
        element.data.id,
        persistedOrdering,
        optimisticOrdering,
    )
}

function getViewDisplayOrder(
    viewId: number,
    persistedOrdering: TicketViewNavigationOrdering,
    optimisticOrdering: TicketViewNavigationOrdering,
) {
    return (
        optimisticOrdering.views[viewId]?.display_order ??
        persistedOrdering.views[viewId]?.display_order ??
        Infinity
    )
}
