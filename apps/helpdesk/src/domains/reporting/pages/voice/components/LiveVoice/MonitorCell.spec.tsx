import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import useAppSelector from 'hooks/useAppSelector'
import MonitorCallButton from 'pages/common/components/MonitorCallButton/MonitorCallButton'

import MonitorCell from './MonitorCell'

jest.mock('hooks/useAppSelector')
jest.mock('pages/common/components/MonitorCallButton/MonitorCallButton')

const useAppSelectorMock = assumeMock(useAppSelector)
const MonitorCallButtonMock = assumeMock(MonitorCallButton)

describe('MonitorCell', () => {
    const mockVoiceCall = {
        callSid: 'CA123',
    } as VoiceCallSummary

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(fromJS({ id: 456 }))
        MonitorCallButtonMock.mockReturnValue(<div>MonitorCallButton</div>)
    })

    it('should render MonitorCallButton with correct props', () => {
        const { getByText } = render(<MonitorCell voiceCall={mockVoiceCall} />)

        expect(getByText('MonitorCallButton')).toBeInTheDocument()
        expect(MonitorCallButtonMock).toHaveBeenCalledWith(
            {
                voiceCallToMonitor: mockVoiceCall,
                agentId: 456,
            },
            {},
        )
    })
})
