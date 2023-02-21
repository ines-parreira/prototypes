import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {act, fireEvent, screen, within} from '@testing-library/react'
import {v4 as uuidv4} from 'uuid'
import _times from 'lodash/times'

import {renderWithRouterAndDnD} from 'utils/testing'
import {getLDClient} from 'utils/launchDarkly'
import {RootState, StoreDispatch} from 'state/types'
import {selfServiceConfiguration1} from 'fixtures/self_service_configurations'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import useSelfServiceChatChannels from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import {GorgiasChatIntegration} from 'models/integration/types'
import {GORGIAS_CHAT_DEFAULT_COLOR} from 'config/integrations/gorgias_chat'
import {TicketChannel} from 'business/types/ticket'
import {MAX_ACTIVE_QUICK_RESPONSES} from '../constants'

import QuickResponsesView from '../QuickResponsesView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

jest.mock('pages/automation/common/hooks/useSelfServiceConfiguration')
jest.mock('pages/automation/common/hooks/useSelfServiceChatChannels')
jest.mock('utils/launchDarkly')

const allFlagsMock = getLDClient().allFlags as jest.MockedFunction<
    ReturnType<typeof getLDClient>['allFlags']
>
const useSelfServiceConfigurationMock =
    useSelfServiceConfiguration as jest.MockedFunction<
        typeof useSelfServiceConfiguration
    >
const useSelfServiceChatChannelsMock =
    useSelfServiceChatChannels as jest.MockedFunction<
        typeof useSelfServiceChatChannels
    >

allFlagsMock.mockReturnValue({})

describe('<QuickResponsesView />', () => {
    const quickResponse1 = {
        id: 'ded6b39b-a85c-487e-8658-3f380d238528',
        deactivated_datetime: null,
        title: 'How do I choose the right size?',
        response_message_content: {
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
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should not display content if quick responses are fetching', () => {
        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: true,
            isUpdatePending: false,
            selfServiceConfiguration: undefined,
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore()}>
                <QuickResponsesView />
            </Provider>
        )

        expect(screen.queryByText('How To Set Up Quick Responses')).toBeNull()
    })

    it('should not allow to save without changes', () => {
        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quick_response_policies: [quickResponse1],
            },
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore()}>
                <QuickResponsesView />
            </Provider>
        )

        expect(screen.getByText('Save changes')).toBeDisabled()
    })

    it('should allow to edit quick response and save changes', () => {
        const newTitle = 'What is your shipping policy?'
        const handleSelfServiceConfigurationUpdateMock = jest.fn()

        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quick_response_policies: [quickResponse1],
            },
            handleSelfServiceConfigurationUpdate:
                handleSelfServiceConfigurationUpdateMock,
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore()}>
                <QuickResponsesView />
            </Provider>
        )

        const input = screen.getByDisplayValue(quickResponse1.title)

        act(() => {
            fireEvent.click(input)
        })

        act(() => {
            fireEvent.change(input, {target: {value: newTitle}})
        })

        const submitButton = screen.getByText('Save changes')

        act(() => {
            fireEvent.click(submitButton)
        })

        expect(handleSelfServiceConfigurationUpdateMock).toBeCalledWith(
            expect.objectContaining({
                quick_response_policies: [
                    {
                        ...quickResponse1,
                        title: newTitle,
                    },
                ],
            })
        )
    })

    it('should allow to edit quick response and cancel', () => {
        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quick_response_policies: [quickResponse1],
            },
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore()}>
                <QuickResponsesView />
            </Provider>
        )

        const input = screen.getByDisplayValue(quickResponse1.title)

        act(() => {
            fireEvent.click(input)
        })

        act(() => {
            fireEvent.change(input, {
                target: {value: 'What is your shipping policy?'},
            })
        })

        const cancelButton = screen.getByText('Cancel')

        act(() => {
            fireEvent.click(cancelButton)
        })

        expect(input).toHaveDisplayValue(quickResponse1.title)
    })

    it('should allow to reorder quick response', () => {
        const quickResponse2 = {
            id: '57b4828f-c846-4b70-a7a8-b4186f967795',
            deactivated_datetime: null,
            title: 'What is your shipping policy?',
            response_message_content: {
                html: '',
                text: '',
                attachments: fromJS([]),
            },
        }
        const handleSelfServiceConfigurationUpdateMock = jest.fn()

        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quick_response_policies: [quickResponse1, quickResponse2],
            },
            handleSelfServiceConfigurationUpdate:
                handleSelfServiceConfigurationUpdateMock,
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore()}>
                <QuickResponsesView />
            </Provider>
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

        expect(handleSelfServiceConfigurationUpdateMock).toBeCalledWith(
            expect.objectContaining({
                quick_response_policies: [quickResponse2, quickResponse1],
            })
        )
    })

    it('should allow to add new quick response', () => {
        const handleSelfServiceConfigurationUpdateMock = jest.fn()

        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quick_response_policies: [],
            },
            handleSelfServiceConfigurationUpdate:
                handleSelfServiceConfigurationUpdateMock,
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore()}>
                <QuickResponsesView />
            </Provider>
        )

        const addQuickResponseButton = screen.getByText('Add quick response')

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

        expect(handleSelfServiceConfigurationUpdateMock).toBeCalledWith(
            expect.objectContaining({
                quick_response_policies: [
                    expect.objectContaining({
                        title: quickResponse1.title,
                        response_message_content: {
                            html: '',
                            text: '',
                            attachments: fromJS([]),
                        },
                        id: expect.any(String),
                        deactivated_datetime: expect.any(String),
                    }),
                ],
            })
        )
    })

    it('should not allow to save changes without title', () => {
        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quick_response_policies: [quickResponse1],
            },
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore()}>
                <QuickResponsesView />
            </Provider>
        )

        const input = screen.getByDisplayValue(quickResponse1.title)

        act(() => {
            fireEvent.click(input)
        })

        act(() => {
            fireEvent.change(input, {target: {value: ''}})
        })

        expect(screen.getByText('Save changes')).toBeDisabled()
    })

    it('should limit the number of active quick responses', () => {
        const quickResponse5 = {
            ...quickResponse1,
            title: 'How do I pick the right size?',
            deactivated_datetime: new Date().toISOString(),
            id: '2b111cf9-efb0-4a3a-a787-498c32a2b435',
        }

        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                quick_response_policies: [
                    ..._times(MAX_ACTIVE_QUICK_RESPONSES, () => ({
                        ...quickResponse1,
                        id: uuidv4(),
                    })),
                    quickResponse5,
                ],
            },
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore()}>
                <QuickResponsesView />
            </Provider>
        )

        expect(
            within(
                screen.getByDisplayValue(quickResponse5.title).parentElement!
                    .parentElement!.parentElement!
            ).getByRole('switch')
        ).toHaveClass('isDisabled')
    })
})
