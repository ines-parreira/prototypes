export const viewItemsDefinitionKeys = {
    all: () => ['view'] as const,
    lists: () => [...viewItemsDefinitionKeys.all(), 'list'] as const,
    list: (params: {query: string}) => [
        ...viewItemsDefinitionKeys.lists(),
        params,
    ],
    details: () => [...viewItemsDefinitionKeys.all(), 'detail'] as const,
    detail: (id: number) => [...viewItemsDefinitionKeys.details(), id] as const,
    updates: (viewId: number) =>
        [
            ...viewItemsDefinitionKeys.all(),
            viewId,
            'tickets',
            'updates',
        ] as const,
}
