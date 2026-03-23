import { useCallback, useMemo } from 'react'

import { useShopifyWidget } from '../../widget/useShopifyWidget'
import {
    createWidgetFromTemplate,
    saveWidgetWithOptimisticUpdate,
} from '../../widget/widgetUtils'
import type {
    ButtonConfig,
    LinkConfig,
    WidgetTemplate,
} from '../utils/customActionTypes'
import {
    buildInitialTemplate,
    findCustomerWidget,
    updateCustomerWidget,
} from '../utils/customActionWidgetUtils'

export function useCustomActions() {
    const {
        shopifyWidget: widget,
        template: rawTemplate,
        queryClient,
        listWidgetsQueryKey,
        updateWidget,
        createWidget,
        invalidateWidgets,
        isLoading,
    } = useShopifyWidget()

    const template = rawTemplate as WidgetTemplate | undefined
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

    const saveCustomActions = useCallback(
        async (newLinks: LinkConfig[], newButtons: ButtonConfig[]) => {
            const custom = { links: newLinks, buttons: newButtons }

            if (widget?.id && template) {
                const updatedTemplate = updateCustomerWidget(template, custom)

                await saveWidgetWithOptimisticUpdate({
                    widgetId: widget.id,
                    updatedTemplate,
                    queryClient,
                    listWidgetsQueryKey,
                    updateWidget,
                    invalidateWidgets,
                })
            } else {
                await createWidgetFromTemplate({
                    createPayload: {
                        integration_id: null,
                        context: 'ticket' as const,
                        type: 'shopify' as const,
                        template: buildInitialTemplate(custom) as {
                            [key: string]: unknown
                        },
                    },
                    createWidget,
                    invalidateWidgets,
                })
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
        await saveCustomActions([...links, link], buttons)
    }

    async function addButton(button: ButtonConfig) {
        await saveCustomActions(links, [...buttons, button])
    }

    async function editLink(index: number, link: LinkConfig) {
        await saveCustomActions(
            links.map((existing, i) => (i === index ? link : existing)),
            buttons,
        )
    }

    async function editButton(index: number, button: ButtonConfig) {
        await saveCustomActions(
            links,
            buttons.map((existing, i) => (i === index ? button : existing)),
        )
    }

    async function removeLink(index: number) {
        await saveCustomActions(
            links.filter((_, i) => i !== index),
            buttons,
        )
    }

    async function removeButton(index: number) {
        await saveCustomActions(
            links,
            buttons.filter((_, i) => i !== index),
        )
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
