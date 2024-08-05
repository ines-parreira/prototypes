import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {act, fireEvent, screen, within} from '@testing-library/react'
import {v4 as uuidv4} from 'uuid'
import _times from 'lodash/times'

import routerDom from 'react-router-dom'
import {QueryClientProvider} from '@tanstack/react-query'
import {renderWithRouterAndDnD} from 'utils/testing'
import {getLDClient} from 'utils/launchDarkly'
import {RootState, StoreDispatch} from 'state/types'
import {selfServiceConfiguration1} from 'fixtures/self_service_configurations'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import {MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS} from 'pages/automate/common/components/constants'
import {GorgiasChatIntegration} from 'models/integration/types'
import {GORGIAS_CHAT_DEFAULT_COLOR} from 'config/integrations/gorgias_chat'
import {TicketChannel} from 'business/types/ticket'

import {useListWorkflowEntryPoints} from 'models/workflows/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import useQuickResponses from '../hooks/useQuickResponses'
import QuickResponsesView from '../QuickResponsesView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
jest.mock('utils/launchDarkly')
jest.mock('../hooks/useQuickResponses')
jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useHistory: jest.fn(),
}))
jest.mock('models/workflows/queries', () => ({
    useListWorkflowEntryPoints: jest.fn(),
}))
const mockedUseListWorkflowEntryPoints = jest.mocked(useListWorkflowEntryPoints)
const allFlagsMock = getLDClient().allFlags as jest.MockedFunction<
    ReturnType<typeof getLDClient>['allFlags']
>
const useQuickResponsesMock = useQuickResponses as jest.MockedFunction<
    typeof useQuickResponses
>
const useSelfServiceChatChannelsMock =
    useSelfServiceChatChannels as jest.MockedFunction<
        typeof useSelfServiceChatChannels
    >

allFlagsMock.mockReturnValue({})

const useHistoryMock = routerDom.useHistory as jest.MockedFunction<
    typeof routerDom.useHistory
>

useHistoryMock.mockReturnValue({
    push: jest.fn(),
} as unknown as ReturnType<typeof useHistoryMock>)

const queryClientMock = mockQueryClient()

describe('<QuickResponsesView />', () => {
    const defaultState = {
        entities: {
            chatsApplicationAutomationSettings: fromJS({}),
        },
    } as RootState

    const quickResponse1 = {
        id: 'ded6b39b-a85c-487e-8658-3f380d238528',
        deactivatedDatetime: null,
        title: 'How do I choose the right size?',
        responseMessageContent: {
            html: '<div>text</div>',
            text: 'text',
            attachments: fromJS([]),
        },
    }

    beforeEach(() => {
        useSelfServiceChatChannelsMock.mockReturnValue([
            {
                type: TicketChannel.Chat,
                value: {
                    id: 1,
                    name: 'sfbibcycles chat',
                    meta: {},
                    decoration: {
                        main_color: GORGIAS_CHAT_DEFAULT_COLOR,
                    },
                } as GorgiasChatIntegration,
            },
        ])
        window.HTMLElement.prototype.scrollTo = jest.fn()
        mockedUseListWorkflowEntryPoints.mockReturnValue({
            isLoading: false,
            data: {},
        } as unknown as ReturnType<typeof useListWorkflowEntryPoints>)
    })

    it('should not display content if quick responses are fetching', () => {
        useQuickResponsesMock.mockReturnValue({
            isFetchPending: true,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: undefined,
            quickResponses: [],
            handleQuickResponsesUpdate: jest.fn(),
            handleQuickResponsesDelete: jest.fn(),
        })

        renderWithRouterAndDnD(
            <QueryClientProvider client={queryClientMock}>
                <Provider store={mockStore(defaultState)}>
                    <QuickResponsesView />
                </Provider>
            </QueryClientProvider>
        )

        expect(
            screen.queryByText('How To Set Up Quick Response Flows')
        ).toBeNull()
    })

    it('should not allow to save without changes', () => {
        useQuickResponsesMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quickResponsePolicies: [quickResponse1],
            },
            quickResponses: [quickResponse1],
            handleQuickResponsesUpdate: jest.fn(),
            handleQuickResponsesDelete: jest.fn(),
        })

        renderWithRouterAndDnD(
            <QueryClientProvider client={queryClientMock}>
                <Provider store={mockStore(defaultState)}>
                    <QuickResponsesView />
                </Provider>
            </QueryClientProvider>
        )

        expect(
            screen.getByRole('button', {name: 'Save changes'})
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('should allow to edit quick response and save changes', () => {
        const newTitle = 'What is your shipping policy?'
        const handleQuickResponsesUpdateMock = jest.fn()

        useQuickResponsesMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quickResponsePolicies: [quickResponse1],
            },
            quickResponses: [quickResponse1],
            handleQuickResponsesUpdate: handleQuickResponsesUpdateMock,
            handleQuickResponsesDelete: jest.fn(),
        })

        renderWithRouterAndDnD(
            <QueryClientProvider client={queryClientMock}>
                <Provider store={mockStore(defaultState)}>
                    <QuickResponsesView />
                </Provider>
            </QueryClientProvider>
        )

        act(() => {
            const textarea = screen.getByDisplayValue(quickResponse1.title)
            fireEvent.click(textarea)
        })

        act(() => {
            const textarea = screen.getByDisplayValue(quickResponse1.title)
            fireEvent.change(textarea, {target: {value: newTitle}})
        })

        const submitButton = screen.getByText('Save changes')

        act(() => {
            fireEvent.click(submitButton)
        })

        expect(handleQuickResponsesUpdateMock).toBeCalledWith([
            {
                ...quickResponse1,
                title: newTitle,
            },
        ])
    })

    it('should allow to edit quick response and cancel', () => {
        useQuickResponsesMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quickResponsePolicies: [quickResponse1],
            },
            quickResponses: [quickResponse1],
            handleQuickResponsesUpdate: jest.fn(),
            handleQuickResponsesDelete: jest.fn(),
        })

        renderWithRouterAndDnD(
            <QueryClientProvider client={queryClientMock}>
                <Provider store={mockStore(defaultState)}>
                    <QuickResponsesView />
                </Provider>
            </QueryClientProvider>
        )

        act(() => {
            const textarea = screen.getByDisplayValue(quickResponse1.title)
            fireEvent.click(textarea)
        })

        act(() => {
            const textarea = screen.getByDisplayValue(quickResponse1.title)
            fireEvent.change(textarea, {
                target: {value: 'What is your shipping policy?'},
            })
        })

        const cancelButton = screen.getByText('Cancel')

        act(() => {
            fireEvent.click(cancelButton)
        })

        expect(
            screen.getByDisplayValue(quickResponse1.title)
        ).toBeInTheDocument()
    })

    it('should allow to reorder quick response', () => {
        const quickResponse2 = {
            id: '57b4828f-c846-4b70-a7a8-b4186f967795',
            deactivatedDatetime: null,
            title: 'What is your shipping policy?',
            responseMessageContent: {
                html: '',
                text: '',
                attachments: fromJS([]),
            },
        }
        const handleQuickResponsesUpdateMock = jest.fn()

        useQuickResponsesMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quickResponsePolicies: [quickResponse1, quickResponse2],
            },
            quickResponses: [quickResponse1, quickResponse2],
            handleQuickResponsesUpdate: handleQuickResponsesUpdateMock,
            handleQuickResponsesDelete: jest.fn(),
        })

        renderWithRouterAndDnD(
            <QueryClientProvider client={queryClientMock}>
                <Provider store={mockStore(defaultState)}>
                    <QuickResponsesView />
                </Provider>
            </QueryClientProvider>
        )

        const quickResponseAccordionItem1 = screen.getByDisplayValue(
            quickResponse1.title
        )

        act(() => {
            const dragHandle = within(
                screen.getByDisplayValue(quickResponse2.title).parentElement!
                    .parentElement!.parentElement!
            ).getByText('drag_indicator')

            fireEvent.dragStart(dragHandle)
            fireEvent.dragOver(quickResponseAccordionItem1)
        })

        act(() => {
            fireEvent.drop(quickResponseAccordionItem1)
        })

        expect(handleQuickResponsesUpdateMock).toBeCalledWith([
            quickResponse2,
            quickResponse1,
        ])
    })

    it('should allow to add new quick response', () => {
        const handleQuickResponsesUpdateMock = jest.fn()

        useQuickResponsesMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quickResponsePolicies: [],
            },
            quickResponses: [],
            handleQuickResponsesUpdate: handleQuickResponsesUpdateMock,
            handleQuickResponsesDelete: jest.fn(),
        })

        renderWithRouterAndDnD(
            <QueryClientProvider client={queryClientMock}>
                <Provider store={mockStore(defaultState)}>
                    <QuickResponsesView />
                </Provider>
            </QueryClientProvider>
        )

        const addQuickResponseButton = screen.getByText('Add Quick Response')

        act(() => {
            fireEvent.click(addQuickResponseButton)
        })

        const input = screen.getByPlaceholderText('Button text')

        act(() => {
            fireEvent.change(input, {
                target: {value: quickResponse1.title},
            })
        })

        const submitButton = screen.getByText('Save changes')

        act(() => {
            fireEvent.click(submitButton)
        })

        expect(handleQuickResponsesUpdateMock).toBeCalledWith([
            expect.objectContaining({
                title: quickResponse1.title,
                responseMessageContent: {
                    html: '',
                    text: '',
                    attachments: fromJS([]),
                },
                id: expect.any(String),
                deactivatedDatetime: expect.any(String),
            }),
        ])
    })

    it('should not allow to save changes without title', () => {
        useQuickResponsesMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quickResponsePolicies: [quickResponse1],
            },
            quickResponses: [quickResponse1],
            handleQuickResponsesUpdate: jest.fn(),
            handleQuickResponsesDelete: jest.fn(),
        })

        renderWithRouterAndDnD(
            <QueryClientProvider client={queryClientMock}>
                <Provider store={mockStore(defaultState)}>
                    <QuickResponsesView />
                </Provider>
            </QueryClientProvider>
        )

        const input = screen.getByDisplayValue(quickResponse1.title)

        act(() => {
            fireEvent.click(input)
        })

        act(() => {
            fireEvent.change(input, {target: {value: ''}})
        })

        expect(
            screen.getByRole('button', {name: 'Save changes'})
        ).toHaveAttribute('aria-disabled', 'true')
    })

    it('should limit the number of active quick responses', () => {
        const quickResponse5 = {
            ...quickResponse1,
            title: 'How do I pick the right size?',
            deactivatedDatetime: new Date().toISOString(),
            id: '2b111cf9-efb0-4a3a-a787-498c32a2b435',
        }
        const quickResponses = [
            ..._times(MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS, () => ({
                ...quickResponse1,
                id: uuidv4(),
            })),
            quickResponse5,
        ]

        useQuickResponsesMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quickResponsePolicies: quickResponses,
            },
            quickResponses,
            handleQuickResponsesUpdate: jest.fn(),
            handleQuickResponsesDelete: jest.fn(),
        })

        renderWithRouterAndDnD(
            <QueryClientProvider client={queryClientMock}>
                <Provider store={mockStore(defaultState)}>
                    <QuickResponsesView />
                </Provider>
            </QueryClientProvider>
        )

        const mySwitch = within(
            screen.getByDisplayValue(quickResponse5.title).parentElement!
                .parentElement!.parentElement!
        ).getByRole('switch')

        expect(
            Array.from(mySwitch.classList).some((cn) =>
                cn.includes('isDisabled')
            )
        ).toBe(true)
    })

    it('should expand a quick response by id from url', () => {
        const quickResponse2 = {
            id: '57b4828f-c846-4b70-a7a8-b4186f967795',
            deactivatedDatetime: null,
            title: 'What is your shipping policy?',
            responseMessageContent: {
                html: '',
                text: '',
                attachments: fromJS([]),
            },
        }

        useQuickResponsesMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quickResponsePolicies: [quickResponse1, quickResponse2],
            },
            quickResponses: [quickResponse1, quickResponse2],
            handleQuickResponsesUpdate: jest.fn(),
            handleQuickResponsesDelete: jest.fn(),
        })

        renderWithRouterAndDnD(
            <QueryClientProvider client={queryClientMock}>
                <Provider store={mockStore(defaultState)}>
                    <QuickResponsesView />
                </Provider>
            </QueryClientProvider>,
            {
                route: '/app/automation/flows/quick-responses?quickResponseId=57b4828f-c846-4b70-a7a8-b4186f967795',
            }
        )

        expect(
            screen.getByDisplayValue(quickResponse2.title)
        ).toBeInTheDocument()
    })

    it('should change the url when quick response is expanded', () => {
        const quickResponse2 = {
            id: '57b4828f-c846-4b70-a7a8-b4186f967795',
            deactivatedDatetime: null,
            title: 'What is your shipping policy?',
            responseMessageContent: {
                html: '',
                text: '',
                attachments: fromJS([]),
            },
        }

        useQuickResponsesMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quickResponsePolicies: [quickResponse1, quickResponse2],
            },
            quickResponses: [quickResponse1, quickResponse2],
            handleQuickResponsesUpdate: jest.fn(),
            handleQuickResponsesDelete: jest.fn(),
        })

        useHistoryMock.mockReturnValue({
            push: jest.fn(),
        } as unknown as ReturnType<typeof useHistoryMock>)

        renderWithRouterAndDnD(
            <QueryClientProvider client={queryClientMock}>
                <Provider store={mockStore(defaultState)}>
                    <QuickResponsesView />
                </Provider>
            </QueryClientProvider>,
            {
                route: '/app/automation/flows/quick-responses',
            }
        )

        act(() => {
            const textarea = screen.getByDisplayValue(quickResponse2.title)
            fireEvent.click(textarea)
        })

        expect(useHistoryMock().push).toBeCalledWith({
            search: '?quickResponseId=57b4828f-c846-4b70-a7a8-b4186f967795',
        })
    })
})
