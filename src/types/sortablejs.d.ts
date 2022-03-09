declare module 'sortablejs' {
    class Sortable {
        destroy: () => void

        toArray: () => string[]
    }

    namespace Sortable {
        function create(element: Element, options: SortableOptions): Sortable

        export interface SortableEvent extends Event {
            from: HTMLElement
            item: HTMLElement
            oldIndex: number | undefined
            newIndex: number | undefined
        }

        export interface MoveEvent extends Event {
            from: HTMLElement
        }

        type PullResult = ReadonlyArray<string> | boolean | 'clone'

        export interface GroupOptions {
            name: string
            put: boolean
            pull?:
                | PullResult
                | ((
                      to: Sortable,
                      from: Sortable,
                      dragEl: HTMLElement,
                      event: SortableEvent
                  ) => PullResult)
        }

        export interface SortableOptions {
            animation?: number
            chosenClass?: string
            draggable?: string
            ghostClass?: string
            group?: string | GroupOptions
            handle?: string
            onAdd?: (event: SortableEvent) => void
            onEnd?: (event: SortableEvent) => void
            onFilter?: (event: SortableEvent) => void
            onMove?: (evt: MoveEvent) => void
            onRemove?: (event: SortableEvent) => void
            onSort?: (event: SortableEvent) => void
            onStart?: (event: SortableEvent) => void
            onUpdate?: (event: SortableEvent) => void
            sort?: boolean
        }
    }

    export = Sortable
}
