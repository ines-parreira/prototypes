import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { EmailDomain } from '@gorgias/helpdesk-queries'

import * as helpers from '../../../helpers'
import RecordDiffStatus from '../RecordDiffStatus'
import RecordsTable from '../RecordsTable'

jest.mock('../RecordDiffStatus')
jest.mock('../RecordsTableSkeleton', () => () => (
    <div>RecordsTableSkeleton</div>
))

const RecordDiffStatusMock = assumeMock(RecordDiffStatus)

const domain: EmailDomain = {
    name: 'gorgias.com',
    provider: 'sendgrid',
    verified: true,
    data: {
        domain: 'gorgias.com',
        valid: true,
        sending_dns_records: [
            {
                verified: true,
                record_type: 'MX',
                host: 'gorgias.com',
                value: 'mx.sendgrid.desired-root',
                current_values: ['mx.sendgrid.current-root'],
            },
            {
                verified: false,
                record_type: 'TXT',
                host: 'subdomain-a.gorgias.com',
                value: 'mx.sendgrid.desired-a',
                current_values: ['mx.sendgrid.current-a'],
            },
            {
                verified: true,
                record_type: 'CNAME',
                host: 'subdomain-b.gorgias.com',
                value: 'mx.sendgrid.desired-b',
                current_values: ['mx.sendgrid.current-b'],
            },
        ],
    },
}

describe('RecordsTable component', () => {
    beforeEach(() => {
        RecordDiffStatusMock.mockReturnValue(<div>StatusDiff</div>)
    })

    it('should render a list of DNS records (with the domain names replaced)', () => {
        render(<RecordsTable domain={domain} domainName="gorgias.com" />)

        expect(screen.getByText('MX')).toBeInTheDocument()
        expect(screen.getByText('TXT')).toBeInTheDocument()
        expect(screen.getByText('CNAME')).toBeInTheDocument()

        expect(screen.getByText('@')).toBeInTheDocument()
        expect(screen.getByText('subdomain-a')).toBeInTheDocument()
        expect(screen.getByText('subdomain-b')).toBeInTheDocument()

        expect(screen.getByText('mx.sendgrid.desired-a')).toBeInTheDocument()
        expect(screen.getByText('mx.sendgrid.desired-b')).toBeInTheDocument()
        expect(screen.getAllByText('StatusDiff')).toHaveLength(3)
    })

    it('should populate the current values for the DNS records', () => {
        const removeDomainMock = jest
            .spyOn(helpers, 'removeDomainFromDNSRecords')
            .mockImplementation((records) => records)

        render(<RecordsTable domain={domain} domainName="gorgias.com" />)

        expect(removeDomainMock).toHaveBeenCalledWith(
            domain.data.sending_dns_records,
            'gorgias.com',
        )
    })

    it('should call populate with an empty list if domain is missing', () => {
        const removeDomainMock = jest
            .spyOn(helpers, 'removeDomainFromDNSRecords')
            .mockImplementation((records) => records)

        render(<RecordsTable domainName="gorgias.com" />)

        expect(removeDomainMock).toHaveBeenCalledWith([], 'gorgias.com')
    })

    it('should render a skeleton when loading', () => {
        render(<RecordsTable domainName="gorgias.com" isLoading />)

        expect(screen.getByText('RecordsTableSkeleton')).toBeInTheDocument()
    })
})
