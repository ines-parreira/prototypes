export const AVAILABLE_HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] // keep uppercase strings
export const TICKET_STATUSES = ['open', 'new', 'closed']
export const TICKET_CHANNELS = ['email', 'phone', 'sms', 'chat', 'twitter', 'facebook', 'api']
export const TICKET_VIA = TICKET_CHANNELS.concat(['form', 'helpdesk', 'app', 'rule'])
export const TICKET_ANSWERABLE_SOURCE_TYPES = ['email', 'chat', 'facebook-post', 'facebook-comment', 'facebook-message']
