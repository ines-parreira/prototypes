import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MetafieldsContainer from '../MetafieldsContainer'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

describe('<MetafieldsContainer />', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should expand when clicked', () => {
        const wrapper = render(
            <MetafieldsContainer title="Metafields">
                <div className={'test-class'}>expect when expanded</div>
            </MetafieldsContainer>,
        )

        const clickWrapper = wrapper.getByTitle('Unfold this card')
        expect(clickWrapper).toBeInTheDocument()

        expect(wrapper.queryByText('expect when expanded')).toBeNull()
        fireEvent.click(clickWrapper)
        expect(wrapper.getByText('expect when expanded')).toBeInTheDocument()
    })

    it('should display tooltip with disclaimer text on hover when feature flag is enabled', async () => {
        useFlagMock.mockReturnValue(true)

        render(
            <MetafieldsContainer title="Metafields">
                <div>Test content</div>
            </MetafieldsContainer>,
        )

        const header = screen.getByAltText('Metafields').parentElement

        await act(() => userEvent.hover(header!))

        await waitFor(() => {
            const tooltip = screen.getByRole('tooltip')
            expect(tooltip).toBeInTheDocument()
            expect(tooltip).toHaveTextContent(
                "Shopify metafields apply only to new or updated customers and orders. Anything created before the import won't be updated retroactively.",
            )
        })
    })

    it('should not display tooltip when feature flag is disabled', async () => {
        useFlagMock.mockReturnValue(false)

        render(
            <MetafieldsContainer title="Metafields">
                <div>Test content</div>
            </MetafieldsContainer>,
        )

        const header = screen.getByAltText('Metafields').parentElement

        await act(() => userEvent.hover(header!))

        await waitFor(
            () => {
                expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
            },
            { timeout: 500 },
        )
    })
})
