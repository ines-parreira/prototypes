import { useMemo } from 'react'

export function useChildOrder(
    container: HTMLDivElement | null,
    names: string[],
    ids: string[],
) {
    return useMemo(() => {
        if (!container || !names.length) {
            return { handlesMap: {}, panelOrder: [] }
        }

        const selectors = [
            ...names.map((name) => `[data-panel-name="${name}"]`),
            ...ids.map((id) => `[data-handle-id="${id}"]`),
        ]
        const els = Array.from(container.querySelectorAll(selectors.join(',')))
        const handlesMap = els
            .map((el, i): [string, string] | null => {
                const id = el.getAttribute('data-handle-id')
                const name = els[i + 1]?.getAttribute('data-panel-name')
                if (!id || !name) return null
                return [name, id]
            })
            .filter((mapping): mapping is [string, string] => !!mapping)
            .reduce(
                (acc, [name, id]) => ({ ...acc, [name]: id }),
                {} as Record<string, string>,
            )

        const panelOrder = els
            .map((element) => element.getAttribute('data-panel-name'))
            .filter((el): el is string => !!el)

        return { handlesMap, panelOrder }
    }, [container, ids, names])
}
