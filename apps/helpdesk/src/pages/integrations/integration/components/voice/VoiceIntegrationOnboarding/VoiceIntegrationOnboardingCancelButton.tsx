import React from 'react'

import { history } from '@repo/routing'

import { LegacyButton as Button } from '@gorgias/axiom'

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
