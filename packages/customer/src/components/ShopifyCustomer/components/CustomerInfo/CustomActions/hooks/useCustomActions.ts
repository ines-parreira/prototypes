import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useCreateWidget,
    useListWidgets,
    useUpdateWidget,
} from '@gorgias/helpdesk-queries'

import type {
    ButtonConfig,
    LinkConfig,
    WidgetTemplate,
} from '../utils/customActionTypes'
import {
    addItem,
    applyOptimisticWidgetUpdate,
    buildInitialTemplate,
    editItem,
    findCustomerWidget,
    findShopifyWidget,
    removeItem,
    updateCustomerWidget,
} from '../utils/customActionWidgetUtils'

export function useCustomActions() {
    const queryClient = useQueryClient()

    const listWidgetsParams = { limit: 100 } as const
    const { data: widgetsResponse, isLoading } =
        useListWidgets(listWidgetsParams)

    const { mutateAsync: updateWidget } = useUpdateWidget()
    const { mutateAsync: createWidget } = useCreateWidget()

    const widget = useMemo(() => {
        if (!widgetsResponse) return undefined
        const widgets =
            'data' in widgetsResponse ? widgetsResponse.data.data : []
        if (!Array.isArray(widgets)) return undefined

        return findShopifyWidget(widgets)
    }, [widgetsResponse])

    const template = widget?.template as WidgetTemplate | undefined
    const customerWidget = useMemo(
        () => findCustomerWidget(template),
        [template],
    )
    const links = useMemo(
        () => customerWidget?.meta?.custom?.links ?? [],
        [customerWidget],
    )
    const buttons = useMemo(
        () => customerWidget?.meta?.custom?.buttons ?? [],
        [customerWidget],
    )

    const listWidgetsQueryKey = queryKeys.widgets.listWidgets(listWidgetsParams)

    const invalidateWidgets = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: listWidgetsQueryKey,
        })
    }, [queryClient, listWidgetsQueryKey])

    const saveCustomActions = useCallback(
        async (newLinks: LinkConfig[], newButtons: ButtonConfig[]) => {
            const custom = { links: newLinks, buttons: newButtons }

            if (widget?.id && template) {
                const updatedTemplate = updateCustomerWidget(template, custom)

                const previousData =
                    queryClient.getQueryData(listWidgetsQueryKey)
                queryClient.setQueryData(
                    listWidgetsQueryKey,
                    (old: { data: { data: unknown[] } } | undefined) =>
                        applyOptimisticWidgetUpdate(
                            old as Parameters<
                                typeof applyOptimisticWidgetUpdate
                            >[0],
                            widget.id!,
                            updatedTemplate,
                        ),
                )

                try {
                    await updateWidget({
                        id: widget.id,
                        data: { template: updatedTemplate },
                    })
                } catch (error) {
                    queryClient.setQueryData(listWidgetsQueryKey, previousData)
                    throw error
                } finally {
                    invalidateWidgets()
                }
            } else {
                const initialTemplate = buildInitialTemplate(custom)

                await createWidget({
                    data: {
                        integration_id: null,
                        context: 'ticket' as const,
                        type: 'shopify' as const,
                        template: initialTemplate as { [key: string]: unknown },
                    },
                })
                invalidateWidgets()
            }
        },
        [
            widget,
            template,
            updateWidget,
            createWidget,
            invalidateWidgets,
            queryClient,
            listWidgetsQueryKey,
        ],
    )

    async function addLink(link: LinkConfig) {
        await saveCustomActions(addItem(links, link), buttons)
    }

    async function addButton(button: ButtonConfig) {
        await saveCustomActions(links, addItem(buttons, button))
    }

    async function editLink(index: number, link: LinkConfig) {
        await saveCustomActions(editItem(links, index, link), buttons)
    }

    async function editButton(index: number, button: ButtonConfig) {
        await saveCustomActions(links, editItem(buttons, index, button))
    }

    async function removeLink(index: number) {
        await saveCustomActions(removeItem(links, index), buttons)
    }

    async function removeButton(index: number) {
        await saveCustomActions(links, removeItem(buttons, index))
    }

    return {
        links,
        buttons,
        addLink,
        addButton,
        editLink,
        editButton,
        removeLink,
        removeButton,
        isLoading,
    }
}
