import { findNestedWidget } from '../../widget/widgetUtils'
import type {
    ButtonConfig,
    LinkConfig,
    WidgetTemplate,
} from './customActionTypes'

export {
    applyOptimisticWidgetUpdate,
    findShopifyWidget,
} from '../../widget/widgetUtils'

export function findCustomerWidget(template: WidgetTemplate | undefined) {
    return findNestedWidget(template, 'customer')
}

export function updateCustomerWidget(
    template: WidgetTemplate,
    custom: { links: LinkConfig[]; buttons: ButtonConfig[] },
): WidgetTemplate {
    return {
        ...template,
        widgets: template.widgets?.map((w) =>
            w.path === 'customer'
                ? {
                      ...w,
                      meta: {
                          ...w.meta,
                          custom: {
                              ...w.meta?.custom,
                              ...custom,
                          },
                      },
                  }
                : w,
        ),
    }
}

export function buildInitialTemplate(custom: {
    links: LinkConfig[]
    buttons: ButtonConfig[]
}): WidgetTemplate {
    return {
        type: 'wrapper',
        widgets: [
            {
                path: 'customer',
                type: 'customer',
                meta: { custom },
            },
        ],
    }
}
