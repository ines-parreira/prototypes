import React, {ReactElement, FC} from 'react'
import {Map, List} from 'immutable'

type DataType = Map<any, any> | List<any> | string | number | boolean | null

type ObjectComponentProps = {
    data: Map<any, any>
    root: boolean
    last: boolean
}
type ArrayComponentProps = {
    data: List<any>
    root: boolean
    last: boolean
}
const switchComponent = (
    data: DataType,
    root = false,
    last = false
): ReactElement => {
    if (Map.isMap(data)) {
        if (!!(data as Map<any, any>).size) {
            return (
                <ObjectComponent
                    data={data as Map<any, any>}
                    root={root}
                    last={last}
                />
            )
        }

        return <span className="empty-object">{'{}'}</span>
    } else if (List.isList(data)) {
        if ((data as List<any>).size) {
            return (
                <ArrayComponent
                    data={data as List<any>}
                    root={root}
                    last={last}
                />
            )
        }

        return <span className="empty-array">{'[]'}</span>
    } else if (typeof data === 'string') {
        return <span className="string-value">{`"${data}"`}</span>
    } else if (typeof data === 'number') {
        return <span className="number-value">{data}</span>
    } else if (typeof data === 'boolean') {
        return <span className="boolean-value">{data ? 'true' : 'false'}</span>
    } else if (!data) {
        return <span className="null-value">null</span>
    }

    return <span>{data}</span>
}

const ObjectComponent = ({
    data,
    root = false,
    last = false,
}: ObjectComponentProps) => {
    const leftBracket = '{'
    const leftArrayBracket = '['
    const rightBracket = '}'

    let idx = 0

    return (
        <div className="object">
            <span>{root && leftBracket}</span>
            <div className="content">
                {data
                    .map((v, k: string) => {
                        idx++
                        const childNode = switchComponent(
                            v,
                            false,
                            idx >= data.size
                        )
                        const isObject =
                            (childNode.type as FC)?.name === 'ObjectComponent'
                        const isArray =
                            (childNode.type as FC)?.name === 'ArrayComponent'

                        return (
                            <div key={`${k}-${idx}`} className="field">
                                <span className="string-key">"{k}": </span>
                                {isObject && leftBracket}
                                {isArray && leftArrayBracket}
                                {childNode}
                                {idx < data.size &&
                                    !isObject &&
                                    !isArray &&
                                    ','}
                            </div>
                        )
                    })
                    .toList()
                    .toJS()}
            </div>
            <span>
                {rightBracket}
                {!last && ','}
            </span>
        </div>
    )
}

const ArrayComponent = ({
    data,
    root = false,
    last = false,
}: ArrayComponentProps) => {
    const leftBracket = '['
    const rightBracket = ']'

    return (
        <div className="object">
            <span>{root && leftBracket}</span>
            <div className="content">
                {data.map((v, idx) => {
                    const childNode = switchComponent(
                        v,
                        true,
                        (idx as number) >= data.size - 1
                    )
                    const isObject =
                        (childNode.type as FC)?.name === 'ObjectComponent'
                    const isArray =
                        (childNode.type as FC)?.name === 'ArrayComponent'

                    return (
                        <div key={idx} className="field">
                            {childNode}
                            {(idx as number) < data.size - 1 &&
                                !isObject &&
                                !isArray &&
                                ','}
                        </div>
                    )
                })}
            </div>
            <span>
                {rightBracket}
                {!last && ','}
            </span>
        </div>
    )
}

export const JSONTree = ({data}: {data: DataType}) => {
    return (
        <div className="json-tree">
            {data ? switchComponent(data, true, true) : 'null'}
        </div>
    )
}
