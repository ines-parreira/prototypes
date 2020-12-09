import {browserHistory} from 'react-router'

export default {
    App: {
        description: 'Global navigation',
        actions: {
            GO_HOME: {
                key: 'g h',
                description: 'Go to the home view.',
                action: (e: Event) => {
                    e.preventDefault()
                    browserHistory.push('/app')
                },
            },
            GO_VIEW: {
                key: 'g v',
                description: 'Go to the current view.',
            },
            UNDO_MESSAGE: {
                key: 'z',
                description: 'Undo message sent',
            },
        },
    },
    View: {
        description: 'Views (Global)',
        actions: {
            GO_NEXT_PAGE: {
                key: 'right',
                description: 'Go to the next page.',
            },
            GO_PREV_PAGE: {
                key: 'left',
                description: 'Go to the previous page.',
            },
            GO_NEXT_ROW: {
                key: ['down', 'j'],
                description: 'Go to the next item.',
            },
            GO_PREV_ROW: {
                key: ['up', 'k'],
                description: 'Go to the previous item.',
            },
            CHECK_ITEM: {
                key: 'x',
                description: 'Toggle the highlighted item.',
            },
            OPEN_ITEM: {
                key: 'enter',
                description: 'Open the highlighted item.',
            },
        },
    },
    ViewNavbar: {
        description: '',
        actions: {
            GO_NEXT_VIEW: {
                key: 'alt+down',
                description: 'Go to the next view.',
            },
            GO_PREV_VIEW: {
                key: 'alt+up',
                description: 'Go to the previous view.',
            },
        },
    },
    TicketListActions: {
        description: 'Views (Tickets)',
        actions: {
            CREATE_TICKET: {
                key: 'n',
                description: 'Create a new ticket.',
            },
            OPEN_ASSIGNEE: {
                key: 'a',
                description: 'Open the assignee dropdown.',
            },

            OPEN_TAGS: {
                key: 't',
                description: 'Open the tags dropdown.',
            },
            OPEN_MACRO: {
                key: 'm',
                description: 'Open the apply macro modal.',
            },
            OPEN_TICKET: {
                key: 'o',
                description: 'Open selected tickets.',
            },
            CLOSE_TICKET: {
                key: 'c',
                description: 'Close selected tickets.',
            },
            DELETE_TICKET: {
                key: '#',
                description: 'Delete selected tickets.',
            },
        },
    },
    CustomerListActions: {
        description: 'Views (Customers)',
        actions: {
            DELETE_CUSTOMER: {
                key: '#',
                description: 'Delete selected customers.',
            },
        },
    },
    Search: {
        description: 'Search',
        actions: {
            FOCUS_SEARCH: {
                key: 's',
                description: 'Focus the search field.',
            },
            LEAVE_SEARCH: {
                key: 'esc',
                description: 'Leave search mode',
            },
        },
    },
    TicketDetailContainer: {
        description: 'Ticket page',
        actions: {
            GO_BACK: {
                key: 'left',
                description: 'Go to the previous ticket.',
            },
            GO_FORWARD: {
                key: 'right',
                description: 'Go to the next ticket.',
            },
            GO_NEXT_MESSAGE: {
                key: 'j',
                description: 'Scroll to the next message.',
            },
            GO_PREV_MESSAGE: {
                key: 'k',
                description: 'Scroll to the previous message.',
            },

            FOCUS_REPLY_AREA: {
                key: 'r',
                description: 'Focus on the reply area.',
            },
            FORWARD_REPLY: {
                key: 'f',
                description: 'Set reply to Forward.',
            },
            INTERNAL_NOTE_REPLY: {
                key: 'i',
                description: 'Set reply to Internal Note.',
            },
            CLOSE_TICKET: {
                key: 'c',
                description: 'Close the ticket.',
            },
            OPEN_TICKET: {
                key: 'o',
                description: 'Open the ticket.',
            },
            DELETE_TICKET: {
                key: '#',
                description: 'Delete the ticket (send to trash).',
            },
            SHOW_MACROS: {
                key: 'm',
                description: 'Show available macros for the ticket.',
            },

            OPEN_ASSIGNEE: {
                key: 'a',
                description: 'Open the assignee dropdown.',
            },
            OPEN_TAGS: {
                key: 't',
                description: 'Open the tags dropdown.',
            },
            OPEN_SNOOZE_TICKET: {
                key: 'b',
                description: 'Open the snooze ticket menu.',
            },

            BLUR_EVERYTHING: {
                // blurs every inputs in the page
                key: 'esc',
                description: 'Close dialogs and unfocus inputs.',
            },
            SEARCH_MACROS: {
                key: 'shift+tab',
                description: 'Search macros while typing a response.',
            },
            SUBMIT_TICKET: {
                key: 'mod+enter',
                description: 'Send message.',
            },
            SUBMIT_CLOSE_TICKET: {
                key: 'mod+shift+enter',
                description: 'Send message and close the ticket.',
            },
        },
    },
    MacroModal: {
        description: 'Macros',
        actions: {
            GO_NEXT_MACRO: {
                key: 'down',
                description: 'Go to the next macro.',
            },
            GO_PREV_MACRO: {
                key: 'up',
                description: 'Go to the previous macro.',
            },
        },
    },
    KeyboardHelp: {
        description: 'Help dialog',
        actions: {
            SHOW_HELP: {
                key: '?',
                description: 'Show this help dialog.',
            },
        },
    },
}
