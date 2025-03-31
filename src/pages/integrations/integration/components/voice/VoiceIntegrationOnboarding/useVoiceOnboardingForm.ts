import { PhoneFunction } from '@gorgias/api-queries'

import { IntegrationType } from 'models/integration/constants'

export const getDefaultValues = () => {
    return {
        name: '',
        type: IntegrationType.Phone,
        meta: {
            emoji: null,
            phone_number_id: null,
            function: PhoneFunction.Standard,
        },
    }
}
