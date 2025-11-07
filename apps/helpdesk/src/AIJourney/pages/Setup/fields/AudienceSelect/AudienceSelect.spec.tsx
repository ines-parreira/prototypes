import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useJourneyContext } from 'AIJourney/providers'
import { useAudienceLists } from 'AIJourney/queries/useAudienceLists/useAudienceLists'
import { useAudienceSegments } from 'AIJourney/queries/useAudienceSegments/useAudienceSegments'

import { AudienceSelect } from './AudienceSelect'

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/queries/useAudienceLists/useAudienceLists', () => ({
    useAudienceLists: jest.fn(),
}))

jest.mock('AIJourney/queries/useAudienceSegments/useAudienceSegments', () => ({
    useAudienceSegments: jest.fn(),
}))

const mockUseJourneyContext = useJourneyContext as jest.Mock
const mockUseAudienceLists = useAudienceLists as jest.Mock
const mockUseAudienceSegments = useAudienceSegments as jest.Mock

describe('AudienceSelect', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 123, name: 'Test Store' },
        })
    })

    it('should render with audience select field', () => {
        mockUseAudienceLists.mockReturnValue({
            data: null,
            isLoading: false,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: null,
            isLoading: false,
        })

        render(
            <AudienceSelect
                name="Audience to include"
                value={[]}
                onChange={() => {}}
            />,
        )

        expect(screen.getByText('Audience to include')).toBeInTheDocument()
        expect(screen.getByText('Select audience')).toBeInTheDocument()
    })

    it('should display lists and segments when data is available', async () => {
        mockUseAudienceLists.mockReturnValue({
            data: {
                data: [
                    { id: 'list1', name: 'VIP Customers' },
                    { id: 'list2', name: 'Newsletter Subscribers' },
                    { id: 'list3', name: 'Excluded list' },
                ],
            },
            isLoading: false,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: {
                data: [
                    { id: 'seg1', name: 'High Value' },
                    { id: 'seg2', name: 'Frequent Buyers' },
                    { id: 'seg3', name: 'Excluded segment' },
                ],
            },
            isLoading: false,
        })

        const user = userEvent.setup()
        render(
            <AudienceSelect
                name="Audience to include"
                value={[]}
                exclude={['list3', 'seg3']}
                onChange={() => {}}
            />,
        )

        // Open dropdown
        const selectButton = screen.getByRole('button', {
            name: /Select audience/i,
        })
        await user.click(selectButton)

        // Check sections are rendered
        await waitFor(() => {
            expect(screen.getByText('Lists')).toBeInTheDocument()
            expect(screen.getByText('Segments')).toBeInTheDocument()
        })

        // Check items are rendered
        expect(
            screen.getByRole('option', {
                name: /VIP Customers/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', {
                name: /Newsletter Subscribers/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('option', {
                name: /Excluded list/i,
            }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('option', {
                name: /High Value/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', {
                name: /Frequent Buyers/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('option', {
                name: /Excluded segment/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('should call onChange when items are selected', async () => {
        const handleChange = jest.fn()
        mockUseAudienceLists.mockReturnValue({
            data: {
                data: [{ id: 'list1', name: 'VIP Customers' }],
            },
            isLoading: false,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: { data: [] },
            isLoading: false,
        })

        const user = userEvent.setup()
        render(
            <AudienceSelect
                name="Audience to include"
                value={[]}
                onChange={handleChange}
            />,
        )

        // Open dropdown and select an item
        const selectField = screen.getByText('Select audience')
        await user.click(selectField)

        await waitFor(() => {
            expect(
                screen.getByRole('option', {
                    name: /VIP Customers/i,
                }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('option', {
                name: /VIP Customers/i,
            }),
        )

        expect(handleChange).toHaveBeenCalledWith(['list1'])
    })

    it('should be disabled when isDisabled is true', () => {
        mockUseAudienceLists.mockReturnValue({
            data: null,
            isLoading: false,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: null,
            isLoading: false,
        })

        render(
            <AudienceSelect
                name="Audience to include"
                value={[]}
                onChange={() => {}}
                isDisabled={true}
            />,
        )

        const selectButton = screen.getByRole('button')
        expect(selectButton).toBeDisabled()
    })

    it('should be disabled when loading data', () => {
        mockUseAudienceLists.mockReturnValue({
            data: null,
            isLoading: true,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: null,
            isLoading: false,
        })

        render(
            <AudienceSelect
                name="Audience to include"
                value={[]}
                onChange={() => {}}
            />,
        )

        const selectButton = screen.getByRole('button')
        expect(selectButton).toBeDisabled()
    })

    it('should handle empty data gracefully', () => {
        mockUseAudienceLists.mockReturnValue({
            data: { data: [] },
            isLoading: false,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: { data: [] },
            isLoading: false,
        })

        render(
            <AudienceSelect
                name="Audience to include"
                value={[]}
                onChange={() => {}}
            />,
        )

        const selectButton = screen.getByRole('button')
        expect(selectButton).toBeInTheDocument()
        expect(selectButton).not.toBeDisabled()
    })

    it('should work without currentIntegration', () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: null,
        })
        mockUseAudienceLists.mockReturnValue({
            data: null,
            isLoading: false,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: null,
            isLoading: false,
        })

        render(
            <AudienceSelect
                name="Audience to include"
                value={[]}
                onChange={() => {}}
            />,
        )

        expect(screen.getByText('Audience to include')).toBeInTheDocument()
        expect(mockUseAudienceLists).toHaveBeenCalledWith(undefined)
        expect(mockUseAudienceSegments).toHaveBeenCalledWith(undefined)
    })
})
