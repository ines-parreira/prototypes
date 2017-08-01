import {browserHistory} from 'react-router'

export default {
    App: {
        description: 'Gorgias',
        actions: {
            GO_HOME: {
                key: 'g h',
                description: 'Go home.',
                action: (e) => {
                    // prevent h from being typed into search field
                    e.preventDefault()
                    browserHistory.push('/app')
                }
            }
        }
    },
    Search: {
        description: 'Search',
        actions: {
            FOCUS_SEARCH: {
                key: 'g s',
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
    TicketDetailContainer: {
        description: 'Ticket navigation',
        actions: {
            SHOW_MACROS: {
                key: 'ctrl+m',
                description: 'Show available macros for ticket.'
            },
            HIDE_MACROS: {
                key: 'escape'
            },
            GO_BACK: { // remember to change this shortcut in TicketReplyEditor.js:_keyBindingFn too
                key: 'ctrl+j',
                description: 'Go to previous ticket.'
            },
            GO_FORWARD: { // remember to change this shortcut in TicketReplyEditor.js:_keyBindingFn too
                key: 'ctrl+k',
                description: 'Go to next ticket.'
            },
            SUBMIT_TICKET: {
                key: 'mod+enter',
                description: 'Send message.'
            },
            SUBMIT_CLOSE_TICKET: {
                key: 'mod+shift+enter',
                description: 'Send message and close the ticket.'
            }
        }
    },
    TicketHeader: {
        description: 'Ticket status',
        actions: {
            CLOSE_TICKET: { // remember to change this shortcut in TicketReplyEditor.js:_keyBindingFn too
                key: 'ctrl+e',
                description: 'Close the ticket.'
            },
        }
    }
}
