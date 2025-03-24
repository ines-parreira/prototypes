import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import history from 'pages/history'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'

export default function VoiceIntegrationOnboardingCancelButton() {
    return (
        <Button
            intent="secondary"
            onClick={() => history.push(`${PHONE_INTEGRATION_BASE_URL}`)}
        >
            Cancel
        </Button>
    )
}
