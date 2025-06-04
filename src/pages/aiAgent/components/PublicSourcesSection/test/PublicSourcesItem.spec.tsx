import React from 'react'

import { screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { assumeMock, renderWithRouter } from 'utils/testing'

import { PublicSourcesItem } from '../PublicSourcesItem'

jest.mock('core/flags')

const useFlagMock = assumeMock(useFlag)

const renderComponent = ({
    source = {
        id: 1,
        url: 'https://example.com',
        status: 'idle' as const,
        createdDatetime: '2024-01-01T00:00:00.000Z',
    },
    onDelete = jest.fn(),
    onSync = jest.fn(),
    existingUrls = [],
    helpCenterCustomDomains = [],
    setIsPristine = jest.fn(),
    syncUrlOnCommand = false,
    setSyncUrlOnCommand = jest.fn(),
} = {}) => {
    return renderWithRouter(
        <PublicSourcesItem
            source={source}
            onDelete={onDelete}
            onSync={onSync}
            existingUrls={existingUrls}
            helpCenterCustomDomains={helpCenterCustomDomains}
            setIsPristine={setIsPristine}
            syncUrlOnCommand={syncUrlOnCommand}
            setSyncUrlOnCommand={setSyncUrlOnCommand}
        />,
    )
}

describe('PublicSourcesItem', () => {
    describe('Articles button visibility', () => {
        it('should not show articles button when feature flag is disabled', () => {
            useFlagMock.mockReturnValue(false)

            renderComponent()

            expect(
                screen.queryByRole('button', { name: 'Open articles' }),
            ).not.toBeInTheDocument()
        })

        it('should show articles button when feature flag is enabled', () => {
            useFlagMock.mockReturnValue(true)

            renderComponent()

            expect(
                screen.getByRole('button', { name: 'Open articles' }),
            ).toBeInTheDocument()
        })
    })
})
