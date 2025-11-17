import type { AutomatedResponseReturnAction } from 'models/selfServiceConfiguration/types'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'

export const DEFAULT_RETURN_ACTION: AutomatedResponseReturnAction = {
    type: ReturnActionType.AutomatedResponse,
    responseMessageContent: {
        html: '',
        text: '',
    },
}
export const LOOP_RETURNS_API_URL = 'https://api.loopreturns.com/'
export const LOOP_RETURNS_INTEGRATION_URL =
    'https://api.loopreturns.com/api/v2/returns?from=2010-01-01&to=2050-01-01&customer_email={{ticket.customer.email}}'
export const LOOP_RETURNS_INTEGRATION_HEADER_NAME = 'X-Authorization'
