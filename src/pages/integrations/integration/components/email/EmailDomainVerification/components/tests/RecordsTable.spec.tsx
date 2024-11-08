import {EmailDomain} from '@gorgias/api-queries'
import {render, screen} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import * as helpers from '../../../helpers'
import * as hook from '../../useDomainVerification'
import RecordDiffStatus from '../RecordDiffStatus'
import RecordsTable from '../RecordsTable'

jest.mock('../RecordDiffStatus')

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

const defaultHookState: hook.UseDomainVerificationRequestHookResult = {
    domain,
    verifyDomain: jest.fn(),
    deleteDomain: jest.fn(),
    isRequested: true,
    isVerifying: false,
    isFetching: false,
    isDeleting: false,
    isPending: false,
}

describe('RecordsTable component', () => {
    beforeEach(() => {
        RecordDiffStatusMock.mockReturnValue(<div>StatusDiff</div>)
    })

    it('should render a list of DNS records (with the domain names replaced)', () => {
        jest.spyOn(hook, 'useDomainVerification').mockImplementation(
            () => defaultHookState
        )

        render(<RecordsTable domainName="gorgias.com" />)

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
        jest.spyOn(hook, 'useDomainVerification').mockImplementation(
            () => defaultHookState
        )

        const removeDomainMock = jest
            .spyOn(helpers, 'removeDomainFromDNSRecords')
            .mockImplementation((records) => records)

        render(<RecordsTable domainName="gorgias.com" />)

        expect(removeDomainMock).toHaveBeenCalledWith(
            defaultHookState.domain?.data.sending_dns_records,
            'gorgias.com'
        )
    })

    it('should call populate with an empty list if domain is missing', () => {
        jest.spyOn(hook, 'useDomainVerification').mockImplementation(() => ({
            ...defaultHookState,
            domain: undefined,
        }))

        const removeDomainMock = jest
            .spyOn(helpers, 'removeDomainFromDNSRecords')
            .mockImplementation((records) => records)

        render(<RecordsTable domainName="gorgias.com" />)

        expect(removeDomainMock).toHaveBeenCalledWith([], 'gorgias.com')
    })
})
