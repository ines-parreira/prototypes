export const SEARCH_ADVANCED_PATHS = {
    all: '/app/tickets/search',
    tickets: '/app/tickets/search',
    customers: '/app/customers/search',
} as const

export const SEARCH_GROUP_LIMIT = 3
export const SEARCH_RESULT_PREFETCH_DISTANCE = 240
export const SEARCH_QUERY_EXPIRY_TIME = 1000 * 60 * 30
export const SEARCH_QUERY_STORAGE_KEY = 'recent-search-query'
export const SEARCH_RESULT_LIMIT = 50
export const RECENT_ITEMS_TABLES = {
    tickets: 'recent-tickets',
    customers: 'recent-customers',
    calls: 'recent-calls',
} as const

export const SEARCH_INPUT_PLACEHOLDER = 'Search for anything...'
