import React from 'react'

export class AddAction extends React.Component {
    handleClick(event) {
        const actionNode = {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'Action',
                },
                arguments: [
                    {
                        type: 'Identifier',
                        name: 'list_of_actions',
                    },
                    {
                        type: 'Literal',
                        value: "action_default_no_action",
                        raw: "'action_default_no_action'",
                    },
                ],
            },
        }

        const { parent, actions, index } = this.props
        actions.modifyCodeast(index, parent, actionNode, 'INSERT')
    }

    render() {
        return (
            <button className="ui basic tiny button" onClick={ this.handleClick.bind(this) }>
                Add action +
            </button>
        )
    }
}


export class AddIf extends React.Component {
    handleClick(event) {
        const actionNode = {
            type: 'IfStatement',
            test: {
                type: 'BinaryExpression',
                operator: '==',
                left: {
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
                right: {
                    type: 'Literal',
                    value: 'channel',
                    raw: '\'channel\''
                }
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

        const { parent, actions, index } = this.props
        actions.modifyCodeast(index, parent, actionNode, 'INSERT')
    }

    render() {
        return (
            <button className="ui basic tiny button" onClick={ this.handleClick.bind(this) }>
                Add IF +
            </button>
        )
    }
}

export class DeleteBlockStatementItem extends React.Component {
    handleClick(event) {
        const { parent, actions, index } = this.props
        actions.modifyCodeast(index, parent, null, 'DELETE')
    }

    render() {
        return (
            <button className="ui red tiny button delete-blockstatement" onClick={ this.handleClick.bind(this) }>
                Delete -
            </button>
        )
    }
}