import React from 'react'

import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { useAudienceLists } from 'AIJourney/queries/useAudienceLists/useAudienceLists'
import { useAudienceSegments } from 'AIJourney/queries/useAudienceSegments/useAudienceSegments'

import { AudienceSelect } from './AudienceSelect'

jest.mock('AIJourney/queries/useAudienceLists/useAudienceLists', () => ({
    useAudienceLists: jest.fn(),
}))

jest.mock('AIJourney/queries/useAudienceSegments/useAudienceSegments', () => ({
    useAudienceSegments: jest.fn(),
}))

const mockUseAudienceLists = useAudienceLists as jest.Mock
const mockUseAudienceSegments = useAudienceSegments as jest.Mock

const defaultProps = {
    integrationId: 123,
    isCampaign: false,
}

describe('AudienceSelect', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
                {...defaultProps}
                name="Segments to include"
                value={[]}
                onChange={() => {}}
            />,
        )

        expect(screen.getByText('Segments to include')).toBeInTheDocument()
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
                {...defaultProps}
                name="Segments to include"
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
                {...defaultProps}
                name="Segments to include"
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
                {...defaultProps}
                name="Segments to include"
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
            isFetching: true,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: null,
            isFetching: false,
        })

        render(
            <AudienceSelect
                {...defaultProps}
                name="Segments to include"
                value={[]}
                onChange={() => {}}
            />,
        )

        const selectButton = screen.getByRole('button')
        expect(selectButton).toBeDisabled()
    })

    it('should not be disabled on campaigns even when the disabled segments query reports isLoading', () => {
        mockUseAudienceLists.mockReturnValue({
            data: { data: [] },
            isFetching: false,
        })
        // react-query v4 reports isLoading=true and isFetching=false
        // when a query is disabled and has never run
        mockUseAudienceSegments.mockReturnValue({
            data: null,
            isLoading: true,
            isFetching: false,
        })

        render(
            <AudienceSelect
                {...defaultProps}
                isCampaign={true}
                name="Segments to include"
                value={[]}
                onChange={() => {}}
            />,
        )

        const selectButton = screen.getByRole('button')
        expect(selectButton).not.toBeDisabled()
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
                {...defaultProps}
                name="Segments to include"
                value={[]}
                onChange={() => {}}
            />,
        )

        const selectButton = screen.getByRole('button')
        expect(selectButton).toBeInTheDocument()
        expect(selectButton).not.toBeDisabled()
    })

    it('should work without integrationId', () => {
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
                {...defaultProps}
                integrationId={undefined}
                name="Segments to include"
                value={[]}
                onChange={() => {}}
            />,
        )

        expect(screen.getByText('Segments to include')).toBeInTheDocument()
        expect(mockUseAudienceLists).toHaveBeenCalledWith(undefined)
        expect(mockUseAudienceSegments).toHaveBeenCalledWith(
            undefined,
            undefined,
            undefined,
            { enabled: true },
        )
    })

    it('should render without name prop and not display FieldPresentation', () => {
        mockUseAudienceLists.mockReturnValue({
            data: null,
            isLoading: false,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: null,
            isLoading: false,
        })

        render(
            <AudienceSelect {...defaultProps} value={[]} onChange={() => {}} />,
        )

        expect(
            screen.queryByText('Segments to include'),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Select audience')).toBeInTheDocument()
    })

    it('should render with label prop', () => {
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
                {...defaultProps}
                label="Choose your audience"
                value={[]}
                onChange={() => {}}
            />,
        )

        expect(screen.getByText('Choose your audience')).toBeInTheDocument()
    })

    it('should render with both name and label props', () => {
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
                {...defaultProps}
                name="Segments to include"
                label="Choose your audience"
                value={[]}
                onChange={() => {}}
            />,
        )

        expect(screen.getByText('Segments to include')).toBeInTheDocument()
        expect(screen.getByText('Choose your audience')).toBeInTheDocument()
    })

    it('should call onValidationChange when selection changes', async () => {
        const handleChange = jest.fn()
        const handleValidationChange = jest.fn()
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
                {...defaultProps}
                value={[]}
                onChange={handleChange}
                onValidationChange={handleValidationChange}
            />,
        )

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

        expect(handleValidationChange).toHaveBeenCalledWith(true)
    })

    it('should show error when required and value is cleared after interaction', async () => {
        const handleChange = jest.fn()
        mockUseAudienceLists.mockReturnValue({
            data: {
                data: [
                    { id: 'list1', name: 'VIP Customers' },
                    { id: 'list2', name: 'Newsletter Subscribers' },
                ],
            },
            isLoading: false,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: { data: [] },
            isLoading: false,
        })

        const user = userEvent.setup()
        const { rerender } = render(
            <AudienceSelect
                {...defaultProps}
                value={[]}
                onChange={handleChange}
                required={true}
            />,
        )

        expect(
            screen.queryByText('At least one audience is required.'),
        ).not.toBeInTheDocument()

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

        rerender(
            <AudienceSelect
                {...defaultProps}
                value={[]}
                onChange={handleChange}
                required={true}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('At least one audience is required.'),
            ).toBeInTheDocument()
        })
    })

    it('should show error when required and showError is true', () => {
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
                {...defaultProps}
                value={[]}
                onChange={() => {}}
                required={true}
                showError={true}
            />,
        )

        expect(
            screen.getByText('At least one audience is required.'),
        ).toBeInTheDocument()
    })

    it('should hide the segments section when isCampaign is true', async () => {
        mockUseAudienceLists.mockReturnValue({
            data: {
                data: [{ id: 'list1', name: 'VIP Customers' }],
            },
            isLoading: false,
        })
        mockUseAudienceSegments.mockReturnValue({
            data: {
                data: [{ id: 'seg1', name: 'High Value' }],
            },
            isLoading: false,
        })

        const user = userEvent.setup()
        render(
            <AudienceSelect
                {...defaultProps}
                isCampaign={true}
                value={[]}
                onChange={() => {}}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: /Select audience/i }),
        )

        await waitFor(() => {
            expect(screen.getByText('Lists')).toBeInTheDocument()
        })
        expect(screen.queryByText('Segments')).not.toBeInTheDocument()
        expect(
            screen.queryByRole('option', { name: /High Value/i }),
        ).not.toBeInTheDocument()
    })

    it('should disable the segments query when isCampaign is true', () => {
        mockUseAudienceLists.mockReturnValue({ data: null, isLoading: false })
        mockUseAudienceSegments.mockReturnValue({
            data: null,
            isLoading: false,
        })

        render(
            <AudienceSelect
                {...defaultProps}
                isCampaign={true}
                value={[]}
                onChange={() => {}}
            />,
        )

        expect(mockUseAudienceSegments).toHaveBeenCalledWith(
            123,
            undefined,
            undefined,
            { enabled: false },
        )
    })

    it('should pass integrationId through to the queries', () => {
        mockUseAudienceLists.mockReturnValue({ data: null, isLoading: false })
        mockUseAudienceSegments.mockReturnValue({
            data: null,
            isLoading: false,
        })

        render(
            <AudienceSelect
                {...defaultProps}
                integrationId={456}
                value={[]}
                onChange={() => {}}
            />,
        )

        expect(mockUseAudienceLists).toHaveBeenCalledWith(456)
        expect(mockUseAudienceSegments).toHaveBeenCalledWith(
            456,
            undefined,
            undefined,
            { enabled: true },
        )
    })
})
