import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

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

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

const renderComponent = async (
    type: 'include' | 'exclude',
    defaultValues: Record<string, unknown> = {},
    onSubmit: jest.Mock = jest.fn(),
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <AudienceSelect type={type} />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    await await act(async () => {
        render(<Wrapper />)
    })
    return { onSubmit }
}

describe('<AudienceSelect />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 123 },
        })
        mockUseAudienceLists.mockReturnValue({ data: null, isLoading: false })
        mockUseAudienceSegments.mockReturnValue({
            data: null,
            isLoading: false,
        })
    })

    describe('label', () => {
        it('renders "Audience to include" label for include type', async () => {
            await renderComponent('include')

            expect(screen.getByText('Audience to include')).toBeInTheDocument()
        })

        it('renders "Audience to exclude" label for exclude type', async () => {
            await renderComponent('exclude')

            expect(screen.getByText('Audience to exclude')).toBeInTheDocument()
        })
    })

    describe('data display', () => {
        it('shows list and segment sections when data is available', async () => {
            mockUseAudienceLists.mockReturnValue({
                data: { data: [{ id: 'list1', name: 'VIP Customers' }] },
                isLoading: false,
            })
            mockUseAudienceSegments.mockReturnValue({
                data: { data: [{ id: 'seg1', name: 'High Value' }] },
                isLoading: false,
            })

            const user = userEvent.setup()
            await renderComponent('include')
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /Select audience/i }),
                )
            })
            await waitFor(() => {
                expect(screen.getByText('Lists')).toBeInTheDocument()
                expect(screen.getByText('Segments')).toBeInTheDocument()
                expect(
                    screen.getByRole('option', { name: /VIP Customers/i }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('option', { name: /High Value/i }),
                ).toBeInTheDocument()
            })
        })

        it('filters out items already selected in the opposite field', async () => {
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
            await renderComponent('include', {
                excluded_audience_list_ids: ['list2'],
            })
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /Select audience/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /VIP Customers/i }),
                ).toBeInTheDocument()
                expect(
                    screen.queryByRole('option', {
                        name: /Newsletter Subscribers/i,
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('filters out items from the included field when rendering exclude type', async () => {
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
            await renderComponent('exclude', {
                included_audience_list_ids: ['list1'],
            })
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /Select audience/i }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.queryByRole('option', { name: /VIP Customers/i }),
                ).not.toBeInTheDocument()
                expect(
                    screen.getByRole('option', {
                        name: /Newsletter Subscribers/i,
                    }),
                ).toBeInTheDocument()
            })
        })
    })

    describe('disabled state', () => {
        it('is disabled when audience lists are loading', async () => {
            mockUseAudienceLists.mockReturnValue({
                data: null,
                isLoading: true,
            })

            await renderComponent('include')

            expect(
                screen.getByRole('button', { name: /Select audience/i }),
            ).toBeDisabled()
        })

        it('is disabled when audience segments are loading', async () => {
            mockUseAudienceSegments.mockReturnValue({
                data: null,
                isLoading: true,
            })

            await renderComponent('include')

            expect(
                screen.getByRole('button', { name: /Select audience/i }),
            ).toBeDisabled()
        })

        it('is not disabled when data has loaded', async () => {
            await renderComponent('include')

            expect(
                screen.getByRole('button', { name: /Select audience/i }),
            ).not.toBeDisabled()
        })
    })

    describe('form submission', () => {
        it('submits with included_audience_list_ids for include type', async () => {
            const onSubmit = jest.fn()
            await renderComponent(
                'include',
                { included_audience_list_ids: ['list1', 'list2'] },
                onSubmit,
            )

            const user = userEvent.setup()
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /submit/i }),
                )
            })

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        included_audience_list_ids: ['list1', 'list2'],
                    }),
                    expect.anything(),
                )
            })
        })

        it('submits with excluded_audience_list_ids for exclude type', async () => {
            const onSubmit = jest.fn()
            await renderComponent(
                'exclude',
                { excluded_audience_list_ids: ['seg1'] },
                onSubmit,
            )

            const user = userEvent.setup()
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /submit/i }),
                )
            })

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        excluded_audience_list_ids: ['seg1'],
                    }),
                    expect.anything(),
                )
            })
        })

        it('updates form value when an item is selected and submits correct field', async () => {
            mockUseAudienceLists.mockReturnValue({
                data: { data: [{ id: 'list1', name: 'VIP Customers' }] },
                isLoading: false,
            })
            mockUseAudienceSegments.mockReturnValue({
                data: { data: [] },
                isLoading: false,
            })

            const onSubmit = jest.fn()
            const user = userEvent.setup()
            await renderComponent('include', {}, onSubmit)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /Select audience/i }),
                )
            })
            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /VIP Customers/i }),
                ).toBeInTheDocument()
            })

            await act(async () => {
                await user.click(
                    screen.getByRole('option', { name: /VIP Customers/i }),
                )
            })

            // Close the dropdown so elements outside it become accessible again
            await act(async () => {
                await user.keyboard('{Escape}')
            })

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /submit/i }),
                )
            })

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        included_audience_list_ids: ['list1'],
                    }),
                    expect.anything(),
                )
            })
        })
    })

    describe('integration context', () => {
        it('passes integration id to audience queries', async () => {
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: { id: 456 },
            })
            await renderComponent('include')

            expect(mockUseAudienceLists).toHaveBeenCalledWith(456)
            expect(mockUseAudienceSegments).toHaveBeenCalledWith(456)
        })

        it('passes undefined to audience queries when integration is not available', async () => {
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: null,
            })
            await renderComponent('include')

            expect(mockUseAudienceLists).toHaveBeenCalledWith(undefined)
            expect(mockUseAudienceSegments).toHaveBeenCalledWith(undefined)
        })
    })
})
