import React from 'react'
import {render, waitFor} from '@testing-library/react'
import * as helpers from 'pages/integrations/integration/components/email/helpers'

import RecordsTable from '../RecordsTable'

const populateCurrentValuesForDNSRecords = jest
    .spyOn(helpers, 'populateCurrentValuesForDNSRecords')
    .mockImplementation((records) => Promise.resolve(records))
const removeDomainFromDNSRecords = jest
    .spyOn(helpers, 'removeDomainFromDNSRecords')
    .mockImplementation((records) => records)

describe('RecordsTable component', () => {
    it('should render a list of DNS records', () => {
        const records = [
            {
                verified: true,
                record_type: 'MX',
                host: 'gorgias.com',
                value: 'mx.sendgrid.net-desired',
                current_values: ['mx.sendgrid.net-current'],
            },
        ]
        const {getByText} = render(
            <RecordsTable
                records={records}
                provider="sendgrid"
                domain="gorgias.com"
            />
        )

        expect(getByText('MX')).toBeInTheDocument()
        expect(getByText('gorgias.com')).toBeInTheDocument()
        expect(getByText('mx.sendgrid.net-desired')).toBeInTheDocument()
        expect(getByText('mx.sendgrid.net-current')).toBeInTheDocument()
    })

    it('should remove the domain name from the host, when the provider is mailgun', () => {
        const records = [
            {
                verified: true,
                record_type: 'MX',
                host: 'gorgias.com',
                value: 'mx.mailgun.net-desired',
                current_values: ['mx.mailgun.net-current'],
            },
        ]

        render(
            <RecordsTable
                records={records}
                provider="mailgun"
                domain="gorgias.com"
            />
        )

        expect(removeDomainFromDNSRecords).toHaveBeenCalledWith(
            records,
            'gorgias.com'
        )
        expect(populateCurrentValuesForDNSRecords).not.toHaveBeenCalled()
    })

    it('should remove the domain name from the host AND populate current values, when the provider is sendgrid', async () => {
        const records = [
            {
                verified: true,
                record_type: 'MX',
                host: 'gorgias.com',
                value: 'mx.sendgrid.net-desired',
                current_values: ['mx.sendgrid.net-current'],
            },
        ]

        render(
            <RecordsTable
                records={records}
                provider="sendgrid"
                domain="gorgias.com"
            />
        )

        expect(populateCurrentValuesForDNSRecords).toHaveBeenCalledWith(records)

        await waitFor(() => {
            expect(removeDomainFromDNSRecords).toHaveBeenCalledWith(
                records,
                'gorgias.com'
            )
        })
    })
})
