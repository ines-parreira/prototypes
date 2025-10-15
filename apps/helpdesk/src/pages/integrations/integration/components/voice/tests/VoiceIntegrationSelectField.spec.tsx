import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { useGetIntegration } from '@gorgias/helpdesk-queries'

import usePhoneNumbers from 'pages/integrations/integration/components/phone/usePhoneNumbers'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import { useInfiniteListVoiceIntegrations } from '../hooks/useInfiniteListVoiceIntegrations'
import VoiceIntegrationSelectField from '../VoiceIntegrationSelectField'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetIntegration: jest.fn(),
}))

jest.mock(
    '@gorgias/axiom',
    () =>
        ({
            ...jest.requireActual('@gorgias/axiom'),
            Skeleton: () => <div>Skeleton</div>,
        }) as typeof import('@gorgias/axiom'),
)

jest.mock('../hooks/useInfiniteListVoiceIntegrations')
const useInfiniteListVoiceIntegrationsMock = assumeMock(
    useInfiniteListVoiceIntegrations,
)

jest.mock('pages/integrations/integration/components/phone/usePhoneNumbers')
const usePhoneNumbersMock = assumeMock(usePhoneNumbers)

const mockNotify = {
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

const useGetIntegrationMock = assumeMock(useGetIntegration)

const handleChange = jest.fn()
const renderComponent = (value?: number, hiddenIntegrations?: number[]) =>
    render(
        <QueryClientProvider client={mockQueryClient()}>
            <Provider store={mockStore({} as any)}>
                <VoiceIntegrationSelectField
                    value={value}
                    onChange={handleChange}
                    hiddenIntegrations={hiddenIntegrations}
                />
            </Provider>
        </QueryClientProvider>,
    )

const mockIntegrations = [
    {
        id: 1,
        name: 'Voice Integration 1',
        meta: { phone_number_id: 1 },
    },
    {
        id: 2,
        name: 'Voice Integration 2',
        meta: { phone_number_id: 2 },
    },
    {
        id: 3,
        name: 'Voice Integration 3',
        meta: { phone_number_id: 3 },
    },
]

const mockPhoneNumbers: Record<
    number,
    { id: number; phone_number_friendly: string }
> = {
    1: {
        id: 1,
        phone_number_friendly: '+1 213 373 4253',
    },
    2: {
        id: 2,
        phone_number_friendly: '+1 213 373 4254',
    },
    3: {
        id: 3,
        phone_number_friendly: '+1 213 373 4255',
    },
}
const useInfiniteListVoiceIntegrationsResponseBase = {
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
}

describe('<VoiceIntegrationSelectField />', () => {
    beforeEach(() => {
        usePhoneNumbersMock.mockReturnValue({
            getPhoneNumberById: (id: number) => mockPhoneNumbers[id],
        } as any)

        useGetIntegrationMock.mockReturnValue({
            data: null,
            isFetching: false,
            error: null,
        } as any)

        useInfiniteListVoiceIntegrationsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: mockIntegrations,
                        },
                    },
                ],
            },
            ...useInfiniteListVoiceIntegrationsResponseBase,
        } as any)
    })

    it('should display the selected integration name', () => {
        const { getByText } = renderComponent(2)

        expect(getByText('Voice Integration 2')).toBeInTheDocument()
    })

    it('should not display the hidden integration', () => {
        const { getByText, queryByText } = renderComponent(2, [1])

        expect(getByText('Voice Integration 2')).toBeInTheDocument()
        expect(queryByText('Voice Integration 1')).not.toBeInTheDocument()
    })

    it('should display placeholder when no integration is selected', () => {
        const { getByText } = renderComponent()

        expect(getByText('Select voice integration')).toBeInTheDocument()
    })

    it('should open the dropdown when clicked', () => {
        const { getByText } = renderComponent()

        const selectInput = getByText('Select voice integration')
        fireEvent.focus(selectInput)

        expect(getByText('Voice Integration 1')).toBeInTheDocument()
        expect(getByText('Voice Integration 2')).toBeInTheDocument()
        expect(getByText('Voice Integration 3')).toBeInTheDocument()
    })

    it('should display phone numbers in dropdown options', () => {
        const { getByText } = renderComponent()

        const selectInput = getByText('Select voice integration')
        fireEvent.focus(selectInput)

        expect(getByText('+1 213 373 4253')).toBeInTheDocument()
        expect(getByText('+1 213 373 4254')).toBeInTheDocument()
        expect(getByText('+1 213 373 4255')).toBeInTheDocument()
    })

    it('should call the onChange function when an integration is selected', () => {
        const { getByText } = renderComponent()

        const selectInput = getByText('Select voice integration')
        fireEvent.focus(selectInput)

        const integration2Option = getByText('Voice Integration 2')
        fireEvent.click(integration2Option)
        expect(handleChange).toHaveBeenCalledWith(2)
    })

    it('should fetch the integration data when the integration is not found in the list', () => {
        useInfiniteListVoiceIntegrationsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [mockIntegrations[1]],
                        },
                    },
                ],
            },
            ...useInfiniteListVoiceIntegrationsResponseBase,
        } as any)

        useGetIntegrationMock.mockReturnValue({
            data: { data: mockIntegrations[0] },
            isFetching: false,
            error: null,
        } as any)

        renderComponent(mockIntegrations[0].id)

        expect(screen.getByText(mockIntegrations[0].name)).toBeInTheDocument()
    })

    it('should disable input when there is an error', () => {
        const mockRefetch = jest.fn()
        useInfiniteListVoiceIntegrationsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: mockIntegrations,
                        },
                    },
                ],
            },
            ...useInfiniteListVoiceIntegrationsResponseBase,
            isError: true,
            refetch: mockRefetch,
        } as any)

        const { getByText } = renderComponent()

        expect(
            getByText(
                'There was an error while trying to fetch the integrations. Please try again later.',
            ),
        ).toBeInTheDocument()
        expect(getByText('Retry')).toBeInTheDocument()

        fireEvent.click(getByText('Retry'))
        expect(mockRefetch).toHaveBeenCalled()
    })

    it('should display skeletons when data is loading', () => {
        useInfiniteListVoiceIntegrationsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: mockIntegrations,
                        },
                    },
                ],
            },
            ...useInfiniteListVoiceIntegrationsResponseBase,
            isLoading: true,
        } as any)

        const { getAllByText } = renderComponent()

        expect(getAllByText('Skeleton')).toHaveLength(2)
    })

    it('should display empty state for no integrations', () => {
        useInfiniteListVoiceIntegrationsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [],
                        },
                    },
                ],
            },
            ...useInfiniteListVoiceIntegrationsResponseBase,
        } as any)

        const { getByText } = renderComponent()

        const selectInput = getByText('Select voice integration')
        fireEvent.focus(selectInput)

        // When there are no integrations, the dropdown should be empty
        expect(
            screen.queryByText('Voice Integration 1'),
        ).not.toBeInTheDocument()
    })

    it('should handle infinite scroll when hasNextPage is true', () => {
        const mockFetchNextPage = jest.fn()
        useInfiniteListVoiceIntegrationsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: mockIntegrations,
                        },
                    },
                ],
            },
            ...useInfiniteListVoiceIntegrationsResponseBase,
            hasNextPage: true,
            fetchNextPage: mockFetchNextPage,
        } as any)

        const { getByText } = renderComponent()

        const selectInput = getByText('Select voice integration')
        fireEvent.focus(selectInput)

        // The infinite scroll component should be present and ready to load more
        expect(mockFetchNextPage).not.toHaveBeenCalled()
    })

    it('should handle phone number not found gracefully', () => {
        usePhoneNumbersMock.mockReturnValue({
            getPhoneNumberById: () => undefined,
        } as any)

        const { getByText } = renderComponent()

        const selectInput = getByText('Select voice integration')
        fireEvent.focus(selectInput)

        // Should still display integration names even if phone numbers are not found
        expect(getByText('Voice Integration 1')).toBeInTheDocument()
        expect(getByText('Voice Integration 2')).toBeInTheDocument()
        expect(getByText('Voice Integration 3')).toBeInTheDocument()
    })
})
