import { history } from '@repo/routing'

import type { Shortcuts } from './types'

export const shortcuts: Shortcuts = {
    App: {
        description: 'Global navigation',
        actions: {
            GO_HOME: {
                key: 'g h',
                description: 'Go to the home view.',
                action: (e: Event) => {
                    e.preventDefault()
                    history.push('/app')
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
            TOGGLE_NAVBAR: {
                key: '[',
                description: 'Toggle the navbar',
            },
        },
    },
    SpotlightModal: {
        description: 'Spotlight search',
        actions: {
            TOGGLE_SPOTLIGHT: {
                key: ['mod+k'],
                description: 'Open the spotlight search',
            },
            GO_ADVANCED_SEARCH: {
                key: 'shift+enter',
                description: 'Go to advanced search',
            },
            EXIT_SEARCH: {
                // the action is handled internally by the Modal component
                // this is only a placeholder to show the shortcut in the KeyboardHelp menu
                key: 'esc',
                description: 'Exit search',
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
    CreateTicketButton: {
        description: 'Create Ticket button',
        actions: {
            CREATE_TICKET: {
                key: 'n',
                description: 'Create a new ticket.',
            },
        },
    },
    TicketListActions: {
        description: 'Views (Tickets)',
        actions: {
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
            MARK_TICKET_READ: {
                key: 'shift+i',
                description: 'Mark selected tickets as read.',
            },
            MARK_TICKET_UNREAD: {
                key: 'shift+u',
                description: 'Mark selected tickets as unread.',
            },
            DELETE_TICKET: {
                key: '#',
                description: 'Delete selected tickets (send to trash).',
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
            MARK_TICKET_SPAM: {
                key: '!',
                description: 'Mark ticket as spam.',
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
                key: 'mod+shift+enter', // gitleaks:allow
                description: 'Send message and close the ticket.',
            },
            APPLY_QUICK_MACROS: {
                key: ['mod+alt+1', 'mod+alt+2', 'mod+alt+3'],
                description: 'Apply quick macro',
            },
        },
    },
    TicketActions: {
        description: 'Ticket actions menu',
        actions: {
            MARK_TICKET_SPAM: {
                key: '!',
                description: 'Mark ticket as spam.',
            },
            DELETE_TICKET: {
                key: '#',
                description: 'Delete the ticket (send to trash).',
            },
        },
    },
    TicketStatusMenu: {
        description: 'Ticket status menu',
        actions: {
            OPEN_TICKET: {
                key: 'o',
                description: 'Open selected tickets.',
            },
            CLOSE_TICKET: {
                key: 'c',
                description: 'Close selected tickets.',
            },
        },
    },
    InfobarTicketTags: {
        description: 'Infobar ticket tags',
        actions: {
            OPEN_TAGS: {
                key: 't',
                description: 'Open the tags dropdown.',
            },
        },
    },
    TicketHeader: {
        description: 'Ticket header shortcuts',
        actions: {
            OPEN_USER_ASSIGNEE: {
                key: 'a',
                description: 'Open the user assignee dropdown.',
            },
            OPEN_TEAM_ASSIGNEE: {
                key: 'shift+a',
                description: 'Open the team assignee dropdown.',
            },
        },
    },
    TimelineModal: {
        description: 'Timeline ticket modal',
        actions: {
            GO_PREVIOUS: {
                key: 'left',
                description: 'Go to the previous item.',
            },
            GO_NEXT: {
                key: 'right',
                description: 'Go to the next item.',
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
    Dialpad: {
        description: 'Dialpad',
        actions: {
            OPEN_DIALPAD: {
                key: 'mod+e',
                description: 'Open the dialpad.',
            },
            CLOSE_DIALPAD: {
                // the action is handled internally by the Modal component
                // this is only a placeholder to show the shortcut in the KeyboardHelp menu
                key: 'esc',
                description: 'Close the dialpad.',
            },
        },
    },
    PhoneCall: {
        description: 'Phone call',
        actions: {
            ACCEPT_CALL: {
                key: 'p',
                description: 'Accept incoming call.',
            },
        },
    },
    Infobar: {
        description: 'Infobar',
        actions: {
            TOGGLE_INFOBAR: {
                key: ']',
                description: 'Toggle the infobar.',
            },
        },
    },
}
