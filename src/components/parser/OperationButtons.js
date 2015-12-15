import React from 'react'

export class AddAction extends React.Component {
    handleClick(event) {
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
                        type: 'Identifier',
                        name: 'list_of_actions'
                    },
                    {
                        type: 'Literal',
                        value: 'action_send_email_notification',
                        raw: '\'action_send_email_notification\''
                    },
                    {
                        type: 'ObjectExpression',
                        'properties': [
                            {
                                type: 'Property',
                                key: {
                                    type: 'Identifier',
                                    name: 'to'
                                },
                                computed: false,
                                value: {
                                    type: 'Literal',
                                    value: 'user@email.com',
                                    raw: '\'user@email.com\''
                                },
                                kind: 'init',
                                method: false,
                                shorthand: false
                            },
                            {
                                type: 'Property',
                                key: {
                                    type: 'Identifier',
                                    name: 'subject'
                                },
                                computed: false,
                                value: {
                                    type: 'Literal',
                                    value: 'Hello Gorgias',
                                    raw: '\'Hello Gorgias\''
                                },
                                kind: 'init',
                                method: false,
                                shorthand: false
                            },
                            {
                                type: 'Property',
                                key: {
                                    type: 'Identifier',
                                    name: 'body'
                                },
                                computed: false,
                                value: {
                                    type: 'Literal',
                                    value: '42',
                                    raw: '\'42\''
                                },
                                kind: 'init',
                                method: false,
                                shorthand: false
                            }
                        ]
                    }
                ]
            }
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
            <button className="ui circular red tiny icon button delete-binaryexpression" onClick={ this.handleClick.bind(this) }>
                &times;
            </button>
        )
    }
}

// displays a number of matching rules for a given condition
export class ShowMatchingRulesNumber extends React.Component {
    render() {
        return (
            <button className="ui button basic green circular matching-rules-num">12345</button>
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