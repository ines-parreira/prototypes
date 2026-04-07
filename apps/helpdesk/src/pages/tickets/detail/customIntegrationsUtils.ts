import type { List, Map } from 'immutable'

export function getWidgetType(widget: Map<string, unknown>): string {
    return widget.get('type') as string
}

export function getWidgetId(widget: Map<string, unknown>): number | undefined {
    return widget.get('id') as number | undefined
}

export function toWidgetArray(
    list: List<Map<string, unknown>> | undefined,
): Map<string, unknown>[] {
    return list?.toArray() ?? []
}
