import React from 'react'
import {
    act,
    createEvent,
    fireEvent,
    screen,
    waitFor,
} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import {getInitialConfiguration} from '../../utils'
import useUpsertAction from '../../hooks/useUpsertAction'
import useDeleteAction from '../../hooks/useDeleteAction'
import CustomActionForm from '../CustomActionForm'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('../../hooks/useUpsertAction')
jest.mock('../../hooks/useDeleteAction')

const mockStore = configureMockStore([thunk])
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseDeleteAction = jest.mocked(useDeleteAction)
const mockUseFlags = jest.mocked(useFlags)

const queryClient = mockQueryClient()

const configuration = getInitialConfiguration()

describe('<CustomActionForm />', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseFlags.mockReturnValue({})
        mockUseUpsertAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        mockUseDeleteAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useDeleteAction>)
    })

    it('should render custom Action form ', () => {
        renderWithRouter(
            <Provider store={mockStore()}>
                <QueryClientProvider client={queryClient}>
                    <CustomActionForm configuration={configuration} />,
                </QueryClientProvider>
            </Provider>,
            {
                path: `:shopType/:shopName/ai-agent/actions/new`,
                route: 'shopify/test-shop/ai-agent/actions/new',
            }
        )

        expect(
            screen.getByLabelText('Action name', {exact: false})
        ).toBeInTheDocument()
    })

    it('should save custom Action ', async () => {
        const mockUpsertAction = jest.fn()

        mockUseUpsertAction.mockReturnValue({
            mutate: mockUpsertAction,
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider store={mockStore()}>
                <QueryClientProvider client={queryClient}>
                    <CustomActionForm configuration={configuration} />,
                </QueryClientProvider>
            </Provider>,
            {
                path: `:shopType/:shopName/ai-agent/actions/new`,
                route: 'shopify/test-shop/ai-agent/actions/new',
            }
        )

        act(() => {
            fireEvent.change(
                screen.getByLabelText('Action name', {exact: false}),
                {
                    target: {
                        value: 'Test name',
                    },
                }
            )
            fireEvent.change(
                screen.getByLabelText('Action description', {
                    exact: false,
                }),
                {
                    target: {
                        value: 'Test instructions',
                    },
                }
            )

            const editor = screen.getAllByRole('textbox')[2]
            const event = createEvent.paste(editor, {
                clipboardData: {
                    types: ['text/plain'],
                    getData: () => 'https://example.com',
                },
            })

            fireEvent(editor, event)
        })

        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Create Action'})
            ).toBeAriaEnabled()
        })

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        expect(mockUpsertAction).toHaveBeenCalledWith([
            {
                internal_id: configuration.internal_id,
                store_name: 'test-shop',
                store_type: 'shopify',
            },
            {
                available_languages: [],
                entrypoints: [
                    {
                        deactivated_datetime: null,
                        kind: 'llm-conversation',
                        settings: {
                            instructions: 'Test instructions',
                            requires_confirmation: false,
                        },
                        trigger: 'llm-prompt',
                    },
                ],
                id: configuration.id,
                initial_step_id: configuration.initial_step_id,
                internal_id: configuration.internal_id,
                is_draft: false,
                name: 'Test name',
                steps: [
                    {
                        id: expect.any(String),
                        kind: 'http-request',
                        settings: {
                            headers: {},
                            method: 'GET',
                            name: '',
                            url: 'https://example.com',
                            variables: [
                                {
                                    id: expect.any(String),
                                    name: 'Request result',
                                    jsonpath: '$',
                                    data_type: null,
                                },
                            ],
                        },
                    },
                ],
                transitions: [],
                triggers: [
                    {
                        kind: 'llm-prompt',
                        settings: {
                            conditions: null,
                            custom_inputs: [],
                            object_inputs: [],
                            outputs: [
                                {
                                    description: '',
                                    id: expect.any(String),
                                    path: expect.any(String),
                                },
                            ],
                        },
                    },
                ],
            },
        ])
    })

    it('should display validation error', () => {
        mockUseUpsertAction.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: false,
            error: {response: {status: 409}, isAxiosError: true},
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider store={mockStore()}>
                <QueryClientProvider client={queryClient}>
                    <CustomActionForm configuration={configuration} />,
                </QueryClientProvider>
            </Provider>
        )

        expect(
            screen.getByText('An Action already exists with this name.')
        ).toBeVisible()
    })

    it('should delete Action', () => {
        const mockDeleteAction = jest.fn()
        mockUseDeleteAction.mockReturnValue({
            mutate: mockDeleteAction,
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useDeleteAction>)

        renderWithRouter(
            <Provider store={mockStore()}>
                <QueryClientProvider client={queryClient}>
                    <CustomActionForm
                        configuration={{
                            ...configuration,
                            updated_datetime: new Date().toISOString(),
                        }}
                    />
                    ,
                </QueryClientProvider>
            </Provider>
        )

        expect(
            screen.getByLabelText('Action name', {exact: false})
        ).toBeInTheDocument()

        expect(screen.getAllByText('Delete Action')[0]).toBeEnabled()
        expect(screen.getAllByText('Delete Action')[0]).toBeVisible()
        fireEvent.click(screen.getByText('Delete Action'))

        expect(
            screen.getByText(/Deleting this Action will remove/)
        ).toBeVisible()
        fireEvent.click(screen.getAllByText('Delete Action')[1])

        expect(mockDeleteAction).toHaveBeenCalledWith([
            {internal_id: configuration.internal_id},
        ])
    })
})
