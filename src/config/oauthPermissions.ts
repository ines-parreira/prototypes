export interface OAuthPermission {
    icon: string
    name: string
    description: string
}

export interface AppOAuthPermission extends OAuthPermission {
    verbs: string[]
}

export const oauthPermissions: Record<string, OAuthPermission> = {
    account: {
        icon: 'account_circle',
        name: 'Your account',
        description:
            'Information about your account, including account-wide settings like business hours. The write scope can be used to update the account owner.',
    },
    users: {
        icon: 'business',
        name: 'Users & Teams',
        description:
            'Users of your helpdesk and any data associated with them, including: email address; first name; last name; bio; role (basic agent, admin, etc.); teams.',
    },
    customers: {
        icon: 'contacts',
        name: 'Customers',
        description:
            'Data associated with your customers, including: email address; first name; last name; language; notes; data received via integrations (such as Shopify).',
    },
    tickets: {
        icon: 'forum',
        name: 'Tickets & Ticket Views',
        description:
            'Ticket views and their settings, as well as tickets with their content, including messages, tags, assignees, etc.',
    },
    events: {
        icon: 'history',
        name: 'Helpdesk Events',
        description:
            'Changes that are being tracked for your account, including events like: ticket created/updated/closed, etc; user created/updated/deleted, etc; rule created/updated/deleted, etc.',
    },
    integrations: {
        icon: 'extension',
        name: 'Integrations & Widgets',
        description:
            'HTTP integrations, native integrations, and widgets that are connected to your account.',
    },
    jobs: {
        icon: 'timer',
        name: 'Long-running Tasks',
        description: 'E.g.: closing 10k tickets, exporting 500k tickets, etc.',
    },
    macros: {
        icon: 'bolt',
        name: 'Macros',
        description: 'Macros and their configuration',
    },
    rules: {
        icon: 'device_hub',
        name: 'Rules',
        description: 'Rules and their configuration',
    },
    satisfaction_survey: {
        icon: 'star',
        name: 'Satisfaction Surveys',
        description:
            'Satisfaction surveys that have been or will be sent to your customers.',
    },
    statistics: {
        icon: 'insert_chart',
        name: 'Statistics',
        description: 'Support metrics calculated for your account.',
    },
    tags: {
        icon: 'label',
        name: 'Tags',
        description: 'Tags that can be added to tickets. ',
    },
    apps: {
        icon: 'apps',
        name: 'Apps',
        description: 'List and uninstall third party Apps.',
    },
    self_service: {
        icon: 'auto_awesome',
        name: 'Self Service',
        description: 'Configure your self service settings.',
    },

    // Legacy scope
    'write:all': {
        icon: 'folder',
        name: 'All resources',
        description: 'View and manage all resources in Gorgias.',
    },
}

/**
 * Convert a list of OAuth scopes into a list of AppPermission objects
 */
export function scopesToPermissions(scopes: string[]): AppOAuthPermission[] {
    const ret: Record<string, AppOAuthPermission> = {}
    for (const scope of scopes) {
        // Special case for legacy "write:all" scope
        if (scope === 'write:all') {
            ret['all'] = {
                ...oauthPermissions['write:all'],
                verbs: ['read', 'write'],
            }
            continue
        }

        const [target, verb] = scope.split(':')
        if (!(target in oauthPermissions)) {
            continue
        }
        if (!(target in ret)) {
            ret[target] = {
                ...oauthPermissions[target],
                verbs: [],
            }
        }
        ret[target].verbs.push(verb)
    }
    return Object.values(ret)
}
