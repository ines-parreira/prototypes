import React, {PropTypes} from 'react'
// import Sortable from 'sortablejs'

const styles = {
    string: {
        color: '#0e4889',
        cursor: 'default',
    },
    bool: {
        color: '#06624b',
        cursor: 'default',
        fontStyle: 'italic',
    },
    number: {
        color: '#ca000a',
        cursor: 'default',
    },
    date: {
        color: '#009f7b',
        cursor: 'default',
    },
    empty: {
        color: '#999999',
        cursor: 'default',
    },
    array: {
        color: '#666666',
        cursor: 'default',
    },
    object: {
        color: '#0b89b6',
        cursor: 'default',
    },
    comma: {
        color: '#999999',
        cursor: 'default',
    },
}

class JsonSource extends React.Component {
    componentDidMount() {
        console.log('source', document.getElementsByClassName('object'))
        // Sortable.create(document.getElementById('json-source'), {
        //     sort: true,
        //     draggable: '.field',
        //     group: {
        //         name: 'field',
        //         pull: 'clone',
        //         put: false
        //     },
        //     animation: 150,
        //     onStart(e) {
        //         console.log(e)
        //     }
        // })
    }

    _transform = (obj, parentKey, fromRecur, hasComma) => {
        const tag = (fromRecur) ? 'span' : 'div'
        const nextLevel = (fromRecur || 0) + 1
        let children = []
        const comma = hasComma ? <span style={styles.comma}>,</span> : null

        if (typeof obj === 'string') {
            // strings
            return (
                <span>{obj}</span>
            )
        } else if (typeof obj === 'boolean' || obj === null || obj === undefined) {
            // booleans, null and undefined
            return React.createElement(tag, {style: styles.bool}, String(obj), comma)
        } else if (typeof obj === 'number') {
            // numbers
            return React.createElement(tag, {style: styles.number}, String(obj), comma)
        } else if (Object.prototype.toString.call(obj) === '[object Date]') {
            // dates
            return React.createElement(tag, {style: styles.date}, String(obj), comma)
        } else if (Array.isArray(obj)) {
            // arrays

            if (!obj.length) {
                return React.createElement(tag, {style: styles.empty}, 'Array: []')
            }

            children.push(React.createElement(tag, {key: '__array:open__', style: styles.array}, 'Array: ['))

            for (let i = 0; i < obj.length; i++) {
                const arraySuffix = '[]'
                const ownKey = `${parentKey || ''}${arraySuffix}`

                children.push(
                    <div
                        key={i}
                        className="object"
                        style={{paddingLeft: '20px'}}
                        onClick={() => {
                            /*
                             e.stopPropagation()
                             this.props.actions.drag(ownKey)
                             console.log('CHILD', ownKey, obj[i])
                             */
                        }}
                    >
                        {
                            this._transform(obj[i], ownKey, nextLevel, i < obj.length - 1)
                        }
                    </div>
                )
            }

            children.push(React.createElement(tag, {key: '__array:close__', style: styles.array}, ']'))
        } else if (obj && typeof obj === 'object') {
            // objects
            const len = Object.keys(obj).length

            if (fromRecur && !len) {
                return React.createElement(tag, {style: styles.empty}, 'Object: {}')
            }

            if (fromRecur) {
                children.push(React.createElement(tag, {key: '__object:open__', style: styles.object}, 'Object: {'))
            }

            obj.forEach((value, key) => {
                if (typeof obj[key] !== 'function') {
                    const ownKey = parentKey
                        ? `${parentKey}${key ? `.${key}` : ''}`
                        : key

                    children.push(
                        <div
                            key={key}
                            style={{paddingLeft: fromRecur ? '20px' : '0px'}}
                            onClick={() => {
                                /*
                                 e.stopPropagation()
                                 this.props.actions.drag(ownKey)
                                 console.log('KEY', ownKey, key, obj[key])
                                 */
                            }}
                        >
                            <span style={{paddingRight: '5px', cursor: 'default'}}>{key}: </span>
                            {
                                this._transform(obj[key], ownKey, nextLevel)
                            }
                        </div>
                    )
                }
            })

            if (fromRecur) {
                children.push(React.createElement(tag, {key: '__object:close__', style: styles.object}, '}'))
            }
        }

        return (
            <div>
                {children}{comma}
            </div>
        )
    }

    render() {
        const {
            json
        } = this.props

        return (
            <div id="json-source">
                {
                    this._transform(json)
                }
            </div>
        )
    }
}

/*

 {
 this._transform(json)
 }
 */

JsonSource.propTypes = {
    json: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

export default JsonSource
