import {render} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import RecordDiffStatus from '../RecordDiffStatus'
import RecordItem from '../RecordItem'

jest.mock('../RecordDiffStatus')

const RecordDiffStatusMock = assumeMock(RecordDiffStatus)

describe('RecordItem component', () => {
    beforeEach(() => {
        RecordDiffStatusMock.mockReturnValue(<div>StatusDiff</div>)
    })

    it('should render a row for a DNS record', () => {
        const record = {
            verified: true,
            record_type: 'MX',
            host: 'gorgias.com',
            value: 'mx.sendgrid.net-desired',
            current_values: ['mx.sendgrid.net-current'],
        }

        const {getByText} = render(<RecordItem record={record} />)

        expect(getByText('MX')).toBeInTheDocument()
        expect(getByText('gorgias.com')).toBeInTheDocument()
        expect(getByText('StatusDiff')).toBeInTheDocument()
    })

    it('should pass correct props to RecordDiffStatus', () => {
        const record = {
            verified: true,
            record_type: 'MX',
            host: 'gorgias.com',
            value: 'mx.sendgrid.net-desired',
            current_values: ['mx.sendgrid.net-current'],
        }

        render(<RecordItem record={record} />)

        expect(RecordDiffStatusMock).toHaveBeenCalledWith({record}, {})
    })
})
