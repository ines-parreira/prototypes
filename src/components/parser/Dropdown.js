import React from 'react'
import Immutable from 'immutable'

export const DEFAULT_OPTION_CHAINS = {
    _: {
        choices: [
            {
                value: 'ticket',
                label: 'ticket'
            },
            {
                value: 'user',
                label: 'user'
            }
        ],

        user: {
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
                choices: [
                    {
                        value: 'equal',
                        label: 'Is'
                    },
                    {
                        value: 'notEqual',
                        label: 'Is not'
                    },
                    {
                        value: 'greaterThan',
                        label: 'Greater than'
                    },
                    {
                        value: 'lessThan',
                        label: 'Less than'
                    }
                ],
                operator: {
                    choices: [
                        {
                            value: 20,
                            label: '20'
                        },
                        {
                            value: 30,
                            label: '30'
                        },
                        {
                            value: 40,
                            label: '40'
                        }
                    ]
                }
            },
            country: {
                choices: [
                    {
                        value: 'equal',
                        label: 'Is'
                    },
                    {
                        value: 'notEqual',
                        label: 'Is not'
                    }
                ],
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
                }
            ],

            status: {
                choices: [
                    {
                        value: 'equal',
                        label: 'Is'
                    },
                    {
                        value: 'notEqual',
                        label: 'Is not'
                    },
                    {
                        value: 'greaterThan',
                        label: 'Greater than'
                    },
                    {
                        value: 'lessThan',
                        label: 'Less than'
                    }
                ],
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
                choices: [
                    {
                        value: 'equal',
                        label: 'Is'
                    },
                    {
                        value: 'notEqual',
                        label: 'Is not'
                    }
                ],
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
            }
        }
    },
    _action: {
        choices: [
            {
                value: 'action_send_email_notification',
                label: 'Send email notification to user'
            },
            {
                value: 'action_add_tag_to_ticket',
                label: 'Add tag to ticket'
            }
        ],
        action_send_email_notification: {
            subject: {
                widget: 'input'
            },
            body: {
                widget: 'textarea'
            }
        },
        action_add_tag_to_ticket: {
            tag: {
                widget: 'input'
            }
        },
    }
}

/**
 * The options list depend on the previous choices user made.
 * Return the possible options given LEFTSIBLINGS.
 */
function getOptionsBySiblings(leftsiblings) {
    const optionsDict = Immutable.fromJS(DEFAULT_OPTION_CHAINS)
    const options = optionsDict.getIn(leftsiblings.push('choices').toJS())

    let optionItems
    if (options !== undefined) {
        optionItems = options.toJS().map(function(option, idx) {
            return <option value={ option.value } key={ idx }>{ option.label }</option>
        })
        optionItems.unshift((
            <option value="" key="-1">-- select --</option>
        ))
    }

    return optionItems
}

class DropdownButton extends React.Component {

    handleChange(event) {
        const {actions, index, parent, options } = this.props

        actions.modifyCodeast(index, parent, event.target.value, 'UPDATE')
    }

    render() {
        const leftsiblings = this.props.leftsiblings

        let optionItems

        if (leftsiblings !== undefined) {
            optionItems = getOptionsBySiblings(leftsiblings)
        }

        if (optionItems === undefined) {
            optionItems = (
                <option value={ this.props.text }>{ this.props.text }</option>
            )
        }

        return (
            <select className="ui dropdown" value={ this.props.text } onChange={ this.handleChange.bind(this) }>
                { optionItems }
            </select>
        )
    }
}

export default DropdownButton