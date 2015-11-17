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
                        value: 'action_default_no_action',
                        raw: '\'action_default_no_action\'',
                    },
                ],
            },
        }

        const { parent, actions, index } = this.props
        actions.modifyCodeast(index, parent, actionNode, 'INSERT')
    }

    render() {
        const options = [
            {
                label: "Send notification email to user",
                value: "send_notification_to_user"
            },
            {
                label: "Add tag to the ticket",
                value: "action_add_tag_to_ticket"
            }
        ]
        return (
            <button className="ui basic tiny button" onClick={ this.handleClick.bind(this) } options={ options }>
                Add action +
            </button>
        )
    }
}
export class AddLogicalAndCondition extends React.Component {
    handleClick(event) {
        const actionNode = {
            type: 'LogicalExpression',
            operator: '&&',
            left: {
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
                    value: 'open',
                    raw: '\'open\''
                }
            },
            right: null,
        }

        const { parent, actions, index } = this.props
        actions.modifyCodeast(index, parent, actionNode, 'UPDATE_LOGICAL_AND')
    }

    render() {
        return (
            <button className="ui basic tiny button" onClick={ this.handleClick.bind(this) }>
                Add +
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

export class DeleteBinaryExpression extends React.Component {
    handleClick(event) {
        const { parent, actions, index } = this.props
        actions.modifyCodeast(index, parent, null, 'DELETE_BINARY_EXPRESSION')
    }

    render() {
        return (
            <button className="ui red tiny button delete-binaryexpression" onClick={ this.handleClick.bind(this) }>
                -
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