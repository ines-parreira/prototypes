import {
    VoiceCallDirection,
    VoiceCallTerminationStatus,
} from '@gorgias/api-queries'

import { voiceCall } from 'fixtures/voiceCalls'
import {
    getInboundDisplayStatus,
    getOutboundDisplayStatus,
    VoiceCallDisplayStatus,
} from 'models/voiceCall/types'
import { assumeMock, renderWithStore } from 'utils/testing'

import SpotlightCallRow from '../SpotlightCallRow'

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () =>
        ({ customerId }: { customerId: number }) => (
            <div>VoiceCallCustomerLabel {customerId}</div>
        ),
)

jest.mock('models/voiceCall/types', () => {
    const originalModule = jest.requireActual('models/voiceCall/types')
    return {
        ...originalModule,
        getInboundDisplayStatus: jest.fn(),
        getOutboundDisplayStatus: jest.fn(),
    }
})
const getInboundDisplayStatusMock = assumeMock(getInboundDisplayStatus)
const getOutboundDisplayStatusMock = assumeMock(getOutboundDisplayStatus)

describe('<SpotlightCallRow/>', () => {
    const mockOnClick = jest.fn()
    const defaultProps = {
        item: voiceCall,
        onCloseModal: jest.fn(),
        id: 1,
        index: 1,
        onClick: mockOnClick,
    }

    it('should render', () => {
        getInboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Answered,
        )

        const { getByText } = renderWithStore(
            <SpotlightCallRow {...defaultProps} />,
            {},
        )

        expect(
            getByText(
                `${voiceCall.phone_number_source} called ${voiceCall.phone_number_destination}`,
            ),
        ).toBeInTheDocument()
        expect(
            getByText(`VoiceCallCustomerLabel ${voiceCall.customer_id}`),
        ).toBeInTheDocument()
        expect(getByText('Answered')).toBeInTheDocument()
        expect(getByText('Aug 31st, 23')).toBeInTheDocument()
    })

    it('should render highlights', () => {
        getInboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Answered,
        )

        const { getByText } = renderWithStore(
            <SpotlightCallRow
                {...defaultProps}
                item={{
                    ...voiceCall,
                    highlights: {
                        phone_number_source: ['highlighted source'],
                        phone_number_destination: ['highlighted destination'],
                        transcripts: ['highlighted transcript'],
                    },
                }}
            />,
            {},
        )

        expect(
            getByText('highlighted source called highlighted destination'),
        ).toBeInTheDocument()
        expect(getByText('highlighted transcript')).toBeInTheDocument()
        expect(
            getByText(`VoiceCallCustomerLabel ${voiceCall.customer_id}`),
        ).toBeInTheDocument()
        expect(getByText('Answered')).toBeInTheDocument()
        expect(getByText('Aug 31st, 23')).toBeInTheDocument()
    })

    it('should render today', () => {
        defaultProps.item = {
            ...voiceCall,
            created_datetime: new Date().toISOString(),
        }
        const { getByText } = renderWithStore(
            <SpotlightCallRow {...defaultProps} />,
            {},
        )

        expect(getByText('Today')).toBeInTheDocument()
    })

    it('should render this year', () => {
        const currentYear = new Date().getFullYear()
        defaultProps.item = {
            ...voiceCall,
            created_datetime: new Date(`${currentYear}-01-01`).toISOString(),
        }
        const { getByText } = renderWithStore(
            <SpotlightCallRow {...defaultProps} />,
            {},
        )

        expect(getByText('Jan 1st')).toBeInTheDocument()
    })

    it('should render voice call display status for inbound calls', () => {
        getInboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Abandoned,
        )
        defaultProps.item = {
            ...voiceCall,
            termination_status: VoiceCallTerminationStatus.Abandoned,
            last_answered_by_agent_id: 1,
            direction: VoiceCallDirection.Inbound,
        }
        const { getByText } = renderWithStore(
            <SpotlightCallRow {...defaultProps} />,
            {},
        )

        expect(getByText('Abandoned')).toBeInTheDocument
        expect(getInboundDisplayStatus).toHaveBeenCalledWith(
            voiceCall.status,
            VoiceCallTerminationStatus.Abandoned,
            1,
        )
        expect(getOutboundDisplayStatusMock).not.toHaveBeenCalled()
    })

    it('should render voice call display status for outbound calls', () => {
        getOutboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Unanswered,
        )
        defaultProps.item = {
            ...voiceCall,
            direction: VoiceCallDirection.Outbound,
        }
        const { getByText } = renderWithStore(
            <SpotlightCallRow {...defaultProps} />,
            {},
        )

        expect(getByText('Unanswered')).toBeInTheDocument
        expect(getInboundDisplayStatus).not.toHaveBeenCalled()
        expect(getOutboundDisplayStatusMock).toHaveBeenCalledWith(
            voiceCall.status,
        )
    })
})
