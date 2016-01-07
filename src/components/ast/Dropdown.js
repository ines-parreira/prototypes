import React from 'react'
import Immutable from 'immutable'


const BASIC_COMPARISON = [
    {value: 'eq', label: 'Is'},
    {value: 'neq', label: 'Is not'}
]

const ADVANCED_COMPARISON = [
    {
        value: 'eq',
        label: 'is equal'
    },
    {
        value: 'neq',
        label: 'is NOT equal'
    },
    {
        value: 'gt',
        label: 'greater than'
    },
    {
        value: 'lt',
        label: 'less than'
    },
    {
        value: 'gte',
        label: 'greater than or equal'
    },
    {
        value: 'lte',
        label: 'less than or equal'
    }
]

export const DEFAULT_OPTION_CHAINS = {
    _: {
        widget: 'select',
        choices: [
            {
                value: 'event',
                label: 'event'
            },
            {
                value: 'ticket',
                label: 'ticket'
            },
            {
                value: 'user',
                label: 'user'
            }
        ],
        event: {
            widget: 'select',
            choices: BASIC_COMPARISON,
            operator: {
                choices: [
                    {
                        value: 'ticket-created',
                        label: 'Ticket created'
                    },
                    {
                        value: 'ticket-updated',
                        label: 'Ticket updated'
                    }
                ]
            }
        },
        user: {
            widget: 'select',
            choices: [
                {
                    value: 'age',
                    label: 'age'
                },
                {
                    value: 'country',
                    label: 'country'
                }
            ],
            age: {
                widget: 'input',
                choices: ADVANCED_COMPARISON
            },
            country: {
                choices: BASIC_COMPARISON,
                operator: {
                    choices: [
                        {
                            value: 'FR',
                            label: 'France'
                        },
                        {
                            value: 'CN',
                            label: 'China'
                        },
                        {
                            value: 'US',
                            label: 'United States'
                        }
                    ]
                }
            }
        },

        ticket: {
            choices: [
                {
                    value: 'status',
                    label: 'status'
                },
                {
                    value: 'channel',
                    label: 'channel'
                },
                {
                    value: 'message',
                    label: 'message'
                }
            ],

            status: {
                choices: ADVANCED_COMPARISON,
                operator: {
                    choices: [
                        {
                            value: 'open',
                            label: 'open'
                        },
                        {
                            value: 'closed',
                            label: 'closed'
                        },
                        {
                            value: 'new',
                            label: 'new'
                        }
                    ]
                }
            },

            channel: {
                choices: BASIC_COMPARISON,
                operator: {
                    choices: [
                        {
                            value: 'facebook',
                            label: 'facebook'
                        },
                        {
                            value: 'twitter',
                            label: 'twitter'
                        },
                        {
                            value: 'email',
                            label: 'email'
                        }
                    ]
                }
            },
            message: {
                choices: [
                    {
                        value: 'from_agent',
                        label: 'From Agent'
                    },
                    {
                        value: 'created_datetime',
                        label: 'Created'
                    }
                ],
                from_agent: {
                    choices: BASIC_COMPARISON,
                    operator: {
                        choices: [
                            {value: true, label: 'True'},
                            {value: false, label: 'False'}
                        ]
                    }
                }
            }
        }
    },
    _action: {
        choices: [
            {
                value: 'notify',
                label: 'Send notification'
            },
            {
                value: 'add_tag',
                label: 'Add tag'
            }
        ],
        notify: {
            channel: {
                widget: 'select',
                choices: [
                    {value: 'email', label: 'email'},
                    {value: 'twitter', label: 'twitter'},
                    {value: 'facebook', label: 'facebook'}
                ]
            },
            sender: {
                widget: 'input'
            },
            subject: {
                widget: 'input'
            },
            body_text: {
                widget: 'textarea'
            },
            body_html: {
                widget: 'textarea'
            }
        },
        action_add_tag_to_ticket: {
            tag: {
                widget: 'input'
            }
        }
    }
}

export default class DropdownButton extends React.Component {
    /**
     * Get the right side of widgets based on the values of the left side widgets.
     *
     * Return the possible options given LEFTSIBLINGS.
    */
    getNextSiblings(schemas, leftsiblings) {
        if (!schemas) {
            return null
        }
        console.log('schemas:', schemas.toJS())

        console.log(leftsiblings.toJS())

        const optionsDict = Immutable.fromJS(DEFAULT_OPTION_CHAINS)
        const options = optionsDict.getIn(leftsiblings.push('choices').toJS())

        let optionItems
        if (options !== undefined) {
            optionItems = options.toJS().map((option, idx) => {
                return (<option
                    value={ option.value }
                    key={ idx }>{ option.label }</option>
                )
            })
            optionItems.unshift((
                <option value="" key="-1">-- select --</option>
            ))
        }

        return optionItems
    }

    handleChange(event) {
        const {actions, index, parent} = this.props

        actions.modifyCodeast(index, parent, event.target.value, 'UPDATE')
        // console.log(actions.modifyCodeast)
    }

    render() {
        const {leftsiblings, text, schemas} = this.props

        let optionItems

        if (leftsiblings !== undefined) {
            optionItems = this.getNextSiblings(schemas, leftsiblings)
        }

        if (optionItems === undefined) {
            optionItems = (
                <option value={text}>{text}</option>
            )
        }

        const neutralBtn = (
            text === 'equal' ||
            text === 'notEqual' ||
            text === 'greaterThan' ||
            text === 'lessThan') ? ' neutral' : ''

        return (
            <select
                className={`ui dropdown${neutralBtn}`}
                value={text}
                onChange={this.handleChange.bind(this)}>
                {optionItems}
            </select>
        )
    }
}

