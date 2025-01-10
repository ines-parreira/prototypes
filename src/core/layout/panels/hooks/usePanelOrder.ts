import {useMemo} from 'react'

export default function usePanelOrder(
    container: HTMLDivElement | null,
    names: string[]
) {
    return useMemo(() => {
        if (!container || !names.length) return []

        const selectors = names.map((name) => `[data-panel-name="${name}"]`)
        return Array.from(container.querySelectorAll(selectors.join(',')))
            .map((element) => element.getAttribute('data-panel-name'))
            .filter((el): el is string => !!el)
    }, [container, names])
}
