/* keyboard shortcuts
 */

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
    MacroModal: {
        description: 'Manage Macros',
        actions: {
            PREVIEW_PREV_MACRO: {
                key: 'up'
            },
            PREVIEW_NEXT_MACRO: {
                key: 'down'
            },
            APPLY_MACRO: {
                key: 'mod+enter',
                description: 'Use selected macro in ticket.'
            }
        }
    },
    KeyboardHelp: {
        description: 'Help Dialog',
        actions: {
            SHOW_HELP: {
                key: '?',
                description: 'Show this help dialog.'
            }
        }
    },
    TicketDetailContainer: {
        description: 'Ticket Details',
        actions: {
            SHOW_MACROS: {
                key: 'meta+m',
                description: 'Show available macros for ticket.'
            },
            HIDE_MACROS: {
                key: 'escape'
            },
            APPLY_MACRO: {
                key: 'enter'
            },
            PREVIEW_PREV_MACRO: {
                key: 'up'
            },
            PREVIEW_NEXT_MACRO: {
                key: 'down'
            },
            GO_BACK: {
                key: 'left'
            },
            GO_FORWARD: {
                key: 'right'
            },
            SUBMIT_TICKET: {
                key: 'mod+enter',
                description: 'Submit the open ticket.'
            },
            SUBMIT_CLOSE_TICKET: {
                key: 'mod+shift+enter',
                description: 'Submit and close the open ticket.'
            }
        }
    }
}
