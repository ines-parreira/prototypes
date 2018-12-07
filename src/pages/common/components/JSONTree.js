import React, {PropTypes} from 'react'
import {Map, List} from 'immutable'


const switchComponent = (data, root = false, last = false) => {
    if (Map.isMap(data)) {
        if (!!data.size) {
            return (
                <ObjectComponent
                    data={data}
                    root={root}
                    last={last}
                />
            )
        }

        return <span className="empty-object">{'{}'}</span>
    } else if (List.isList(data)) {
        if (data.size) {
            return (
                <ArrayComponent
                    data={data}
                    root={root}
                    last={last}
                />
            )
        }

        return <span className="empty-array">{'[]'}</span>
    } else if (typeof(data) === 'string') {
        return <span className="string-value">{`"${data}"`}</span>
    } else if (typeof(data) === 'number') {
        return <span className="number-value">{data}</span>
    } else if (typeof(data) === 'boolean') {
        return <span className="boolean-value">{data ? 'true' : 'false'}</span>
    } else if (!data) {
        return <span className="null-value">null</span>
    }

    return <span>{data}</span>
}


const ObjectComponent = ({data, root = false, last = false}) => {
    const leftBracket = '{'
    const leftArrayBracket = '['
    const rightBracket = '}'

    let idx = 0

    return (
        <div className="object">
            <span>{root && leftBracket}</span>
            <div className="content">
            {
                data.map((v, k) => {
                    idx++
                    const childNode = switchComponent(v, false, idx >= data.size)
                    const isObject = childNode.type.name && childNode.type.name === 'ObjectComponent'
                    const isArray = childNode.type.name && childNode.type.name === 'ArrayComponent'

                    return (
                        <div
                            key={`${k}-${idx}`}
                            className="field"
                        >
                            <span className="string-key">"{k}": </span>
                            {isObject && leftBracket}
                            {isArray && leftArrayBracket}
                            {childNode}
                            {idx < data.size && !isObject && !isArray && ','}
                        </div>
                    )
                }).toList().toJS()
            }
            </div>
            <span>{rightBracket}{!last && ','}</span>
        </div>
    )
}

ObjectComponent.propTypes = {
    data: PropTypes.object.isRequired,
    root: PropTypes.bool.isRequired,
    last: PropTypes.bool.isRequired
}


const ArrayComponent = ({data, root = false, last = false}) => {
    const leftBracket = '['
    const rightBracket = ']'

    return (
        <div className="object">
            <span>{root && leftBracket}</span>
            <div className="content">
            {
                data.map((v, idx) => {
                    const childNode = switchComponent(v, true, idx >= data.size - 1)
                    const isObject = childNode.type.name && childNode.type.name === 'ObjectComponent'
                    const isArray = childNode.type.name && childNode.type.name === 'ArrayComponent'

                    return (
                        <div
                            key={idx}
                            className="field"
                        >
                            {childNode}
                            {idx < data.size - 1 && !isObject && !isArray && ','}
                        </div>
                    )
                })
            }
            </div>
            <span>{rightBracket}{!last && ','}</span>
        </div>
    )
}

ArrayComponent.propTypes = {
    data: PropTypes.object.isRequired,
    root: PropTypes.bool.isRequired,
    last: PropTypes.bool.isRequired
}


export const JSONTree = ({data}) => {
    return (
        <div className="json-tree">
            {data ? switchComponent(data, true, true) : 'null'}
        </div>
    )
}

JSONTree.propTypes = {
    data: PropTypes.object
}
