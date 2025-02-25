import React from 'react'

import { voiceCall } from 'fixtures/voiceCalls'
import { renderWithStore } from 'utils/testing'

import SpotlightCallRow from '../SpotlightCallRow'

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () =>
        ({ customerId }: { customerId: number }) => (
            <div>VoiceCallCustomerLabel {customerId}</div>
        ),
)

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
})
