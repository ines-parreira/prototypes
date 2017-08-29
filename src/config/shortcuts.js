import {browserHistory} from 'react-router'

export default {
    App: {
        description: 'Global navigation',
        actions: {
            GO_HOME: {
                key: 'g h',
                description: 'Go to the home view.',
                action: (e) => {
                    e.preventDefault()
                    browserHistory.push('/app')
                }
            },
            // GO_VIEW: {
            //     key: 'g v',
            //     description: 'Go to the current view.',
            //     action: (e) => {
            //         e.preventDefault()
            //         browserHistory.push('/app')
            //     }
            // }
        }
    },
    TicketDetailContainer: {
        description: 'Ticket page',
        actions: {
            GO_BACK: {
                key: 'left',
                description: 'Go to previous ticket.'
            },
            GO_FORWARD: {
                key: 'right',
                description: 'Go to next ticket.'
            },

            FOCUS_REPLY_AREA: {
                key: 'r',
                description: 'Focus on reply area.'
            },
            CLOSE_TICKET: {
                key: 'c',
                description: 'Close the ticket.'
            },
            OPEN_TICKET: {
                key: 'o',
                description: 'Open the ticket.'
            },
            DELETE_TICKET: {
                key: '#',
                description: 'Delete the ticket (send to trash).'
            },
            SHOW_MACROS: {
                key: 'm',
                description: 'Show available macros for ticket.'
            },

            SUBMIT_TICKET: {
                key: 'mod+enter',
                description: 'Send message.'
            },
            SUBMIT_CLOSE_TICKET: {
                key: 'mod+shift+enter',
                description: 'Send message and close the ticket.'
            },
            BLUR_EVERYTHING: { // blurs every inputs in the page
                key: 'escape',
                description: 'Close windows and unfocus inputs'
            },
        }
    },
    Search: {
        description: 'Search',
        actions: {
            FOCUS_SEARCH: {
                key: 's',
                description: 'Focus the search field.'
            }
        }
    },
    KeyboardHelp: {
        description: 'Help dialog',
        actions: {
            SHOW_HELP: {
                key: '?',
                description: 'Show this help dialog.'
            }
        }
    },
}
