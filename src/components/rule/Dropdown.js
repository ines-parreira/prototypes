import React from 'react'
import Immutable from 'immutable'

const DEFAULT_OPTION_CHAINS = {
    root: {
        choices: [
            {
                value: 'ticket',
                label: 'ticket'
            },
            {
                value: 'user',
                label: 'user'
            }
        ]
    },

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
                    value: '==',
                    label: 'Is'
                },
                {
                    value: '!=',
                    label: 'Is not'
                },
                {
                    value: '>',
                    label: 'Greater than'
                },
                {
                    value: '<',
                    label: 'Less than'
                }
            ],
            operator: {
                choices: [
                    {
                        value: '20',
                        label: '20'
                    },
                    {
                        value: '30',
                        label: '30'
                    },
                    {
                        value: '40',
                        label: '40'
                    }
                ]
            }
        },
        country: {
            choices: [
                {
                    value: '==',
                    label: 'Is'
                },
                {
                    value: '!=',
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
                    value: '==',
                    label: 'Is'
                },
                {
                    value: '!=',
                    label: 'Is not'
                },
                {
                    value: '>',
                    label: 'Greater than'
                },
                {
                    value: '<',
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
                    value: '==',
                    label: 'Is'
                },
                {
                    value: '!=',
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
}

/**
 * The options list depend on the previous choices user made.
 * Return the possible options given LEFTSIBLINGS.
 */
function getOptionsBySiblings(leftsiblings) {
    const optionsDict = Immutable.fromJS(DEFAULT_OPTION_CHAINS)

    leftsiblings.push('choices')
    const options = optionsDict.getIn(leftsiblings)

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
                <option value="{ this.props.text }">{ this.props.text }</option>
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