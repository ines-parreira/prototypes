import { render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'
import { Call } from '@twilio/voice-sdk'

import { mockMonitoringCall } from 'tests/twilioMocks'

import MonitoringPhoneCall from '../MonitoringPhoneCall'

describe('MonitoringPhoneCall', () => {
    it('should render end call button', () => {
        const call = mockMonitoringCall() as Call

        render(<MonitoringPhoneCall call={call} />)

        expect(
            screen.getByRole('button', { name: /End Call/i }),
        ).toBeInTheDocument()
    })

    it('should disconnect call when end button is clicked', async () => {
        const userEvent = user.setup()
        const call = mockMonitoringCall() as Call

        render(<MonitoringPhoneCall call={call} />)

        await userEvent.click(screen.getByRole('button', { name: /End Call/i }))

        expect(call.disconnect).toHaveBeenCalled()
    })
})
