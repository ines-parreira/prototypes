import {render} from '@testing-library/react'
import React from 'react'

import RecordItem from '../RecordItem'

describe('RecordItem component', () => {
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
        expect(getByText('mx.sendgrid.net-desired')).toBeInTheDocument()
        expect(getByText('mx.sendgrid.net-current')).toBeInTheDocument()
    })

    it('should render None Found if the current values are unknown', () => {
        const record = {
            verified: true,
            record_type: 'MX',
            host: 'gorgias.com',
            value: 'mx.sendgrid.net-desired',
            current_values: [],
        }

        const {getByText} = render(<RecordItem record={record} />)

        expect(getByText('MX')).toBeInTheDocument()
        expect(getByText('gorgias.com')).toBeInTheDocument()
        expect(getByText('mx.sendgrid.net-desired')).toBeInTheDocument()
        expect(getByText('None found')).toBeInTheDocument()
    })
})
