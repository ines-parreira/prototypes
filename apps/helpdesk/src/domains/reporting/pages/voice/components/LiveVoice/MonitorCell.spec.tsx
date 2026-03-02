import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'

import MonitorCell from 'domains/reporting/pages/voice/components/LiveVoice/MonitorCell'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { getCallMonitorability } from 'hooks/integrations/phone/monitoring.utils'
import MonitorCallButton from 'pages/common/components/MonitorCallButton/MonitorCallButton'
import { renderWithStore } from 'utils/testing'

jest.mock('hooks/integrations/phone/monitoring.utils')
jest.mock('pages/common/components/MonitorCallButton/MonitorCallButton')

const getCallMonitorabilityMock = assumeMock(getCallMonitorability)
const MonitorCallButtonMock = assumeMock(MonitorCallButton)

describe('MonitorCell', () => {
    const mockVoiceCall = {
        callSid: 'CA123',
        agentId: 789,
    } as VoiceCallSummary

    const mockCurrentUser = fromJS({ id: 456 })
    const mockInCallAgent = { id: 789, name: 'Guybrush Threepwood' }

    beforeEach(() => {
        getCallMonitorabilityMock.mockReturnValue({
            isMonitorable: false,
            reason: 'You cannot monitor this call',
        })
        MonitorCallButtonMock.mockReturnValue(<div>MonitorCallButton</div>)
    })

    it('should render MonitorCallButton with correct props', () => {
        const { getByText } = renderWithStore(
            <MonitorCell voiceCall={mockVoiceCall} />,
            {
                currentUser: mockCurrentUser,
                agents: fromJS({
                    all: [fromJS(mockInCallAgent)],
                }),
            },
        )

        expect(getByText('MonitorCallButton')).toBeInTheDocument()
        expect(MonitorCallButtonMock).toHaveBeenCalledWith(
            {
                voiceCallToMonitor: mockVoiceCall,
                agentId: 456,
                isMonitorable: false,
                reason: 'You cannot monitor this call',
            },
            {},
        )
        expect(getCallMonitorabilityMock).toHaveBeenCalledWith(
            mockVoiceCall,
            456,
            mockInCallAgent,
        )
    })
})
