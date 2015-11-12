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
                Add +
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
            <button className="ui red tiny button" onClick={ this.handleClick.bind(this) }>
                Delete -
            </button>
        )
    }
}