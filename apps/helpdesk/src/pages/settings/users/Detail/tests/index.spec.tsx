import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { Detail } from '..'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: { NewUsersListPage: 'new-users-list-page' },
    useFlag: jest.fn(),
}))
jest.mock('../DetailV2', () => ({ DetailV2: () => <div>detail v2</div> }))
jest.mock('../Detail', () => ({ Detail: () => <div>legacy detail</div> }))

const mockUseFlag = assumeMock(useFlag)

describe('Detail route', () => {
    it('renders DetailV2 when the new users list flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)

        render(<Detail />)

        expect(screen.getByText('detail v2')).toBeInTheDocument()
    })

    it('renders the legacy Detail when the flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        render(<Detail />)

        expect(screen.getByText('legacy detail')).toBeInTheDocument()
    })
})
