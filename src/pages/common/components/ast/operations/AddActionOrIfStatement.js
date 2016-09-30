import React from 'react'

import Hoverable from '../../Hoverable'

class AddActionOrIfStatement extends React.Component {

    componentDidMount() {
        $(this.refs.dropdown).dropdown({
            onChange: (value) => {
                if (value === 'action') this._addAction()
                else this._addIfStatement()
            }
        })
    }

    _addAction = () => {
        const actionNode = {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'Action'
                },
                arguments: [
                    {
                        type: 'Literal',
                        value: '',
                        raw: '\'\''
                    },
                    {
                        type: 'ObjectExpression',
                        properties: []
                    }
                ]
            }
        }

        const { actions, index, parent } = this.props
        actions.rules.modifyCodeast(index, parent.push('body'), actionNode, 'INSERT')
    }

    _addIfStatement = () => {
        const actionNode = {
            type: 'IfStatement',
            test: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'equal'
                },
                arguments: [
                    {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                            type: 'Identifier',
                            name: 'ticket'
                        },
                        property: {
                            type: 'Identifier',
                            name: 'status'
                        }
                    },
                    {
                        type: 'Literal',
                        value: 'open',
                        raw: '\'open\''
                    }
                ],
            },
            consequent: {
                type: 'BlockStatement',
                body: []
            },
            alternate: {
                type: 'BlockStatement',
                body: []
            }
        }

        const { actions, index, parent } = this.props
        actions.rules.modifyCodeast(index, parent.push('body'), actionNode, 'INSERT')
    }

    render() {
        const { title } = this.props
        const { hovered } = this.context

        return (
            <div className="ui keyword floating dropdown icon button" ref="dropdown">
                {
                    !hovered
                        ? <span className="text">{title}</span>
                        : <i className="fitted large plus icon" />
                }
                <div className="menu">
                    <div className="item" data-value="action">Action</div>
                    <div className="item" data-value="if-statement">If Statement</div>
                </div>
            </div>
        )
    }
}

AddActionOrIfStatement.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
    title: React.PropTypes.string.isRequired,
}

AddActionOrIfStatement.contextTypes = {
    hovered: React.PropTypes.bool,
}

export default Hoverable(AddActionOrIfStatement)
