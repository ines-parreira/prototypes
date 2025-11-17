import type { ComponentProps, ReactNode } from 'react'
import { Fragment } from 'react'

type ObjectWithId = {
    id: string | number
}

const isObjectWithId = (obj: unknown): obj is ObjectWithId => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        (typeof obj.id === 'string' || typeof obj.id === 'number')
    )
}

class ListItem<T> {
    constructor(
        public readonly item: T,
        public readonly index: number,
    ) {}

    getListItemProps() {
        return { role: 'listitem' }
    }
}

const defaultExtractor = <T,>(item: T, index: number) => {
    const id = isObjectWithId(item) ? item.id : index
    return String(id)
}

export interface ListProps<T> extends ComponentProps<'div'> {
    data: readonly T[]
    renderItem: (item: ListItem<T>) => JSX.Element
    keyExtractor?: typeof defaultExtractor<T>
    itemSeparatorElement?: ReactNode
    listEmptyElement?: ReactNode
}

export const List = <T,>({
    data,
    renderItem,
    keyExtractor = defaultExtractor,
    itemSeparatorElement,
    listEmptyElement,
    ...props
}: ListProps<T>) => {
    if (data.length < 1) return listEmptyElement

    return (
        <div role="list" {...props}>
            {data.map((item, index) => (
                <Fragment key={keyExtractor(item, index)}>
                    {Boolean(index) && itemSeparatorElement}
                    {renderItem(new ListItem(item, index))}
                </Fragment>
            ))}
        </div>
    )
}
