import { appQueryClient } from '@repo/api-resources'
import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { applications as mockApplications } from 'fixtures/applications'
import { channels as mockChannels } from 'fixtures/channels'
import { applicationsQueryKeys as mockApplicationsQueryKeys } from 'models/application/queries'
import { channelsQueryKeys as mockChannelsQueryKeys } from 'models/channel/queries'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import type { ChannelIdentifier } from 'services/channels'
import { makeExecuteKeyboardAction } from 'utils/testing'

import ChannelSelect from '../ChannelSelect'

jest.mock('@repo/utils', () => {
    const React = jest.requireActual('react')
    const actual = jest.requireActual('@repo/utils')
    const mockBind = jest.fn()
    const mockUnbind = jest.fn()

    return {
        ...actual,
        shortcutManager: {
            bind: mockBind,
            unbind: mockUnbind,
        },
        useShortcuts: (component: string, actions: Record<string, any>) => {
            React.useEffect(() => {
                mockBind(component, actions)
                return () => {
                    mockUnbind(component)
                }
            }, [actions, component])
        },
    }
})

// Get the mocked shortcutManager from the module
const { shortcutManager: shortcutManagerMock } = jest.requireMock('@repo/utils')

const shortcutEventMock = {
    preventDefault: jest.fn(),
} as unknown as jest.Mocked<Event>

beforeEach(() => {
    appQueryClient.setQueryData(mockChannelsQueryKeys.list(), {
        data: mockChannels,
    })
    appQueryClient.setQueryData(mockApplicationsQueryKeys.list(), {
        data: mockApplications,
    })
})

afterEach(() => {
    appQueryClient.clear()
})

jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(() => ({
        isStandaloneAiAgent: false,
    })),
}))

jest.mock('state/newMessage/actions', () => ({
    prepare: jest.fn().mockImplementation((channel: ChannelIdentifier) => ({
        type: 'MOCKED_PREPARE_NEW_MESSAGE',
        payload: channel,
    })),
}))

describe('<ChannelSelect />', () => {
    const mockUseStandaloneAiAccess = useStandaloneAiAccess as jest.Mock

    beforeEach(() => {
        mockUseStandaloneAiAccess.mockReturnValue({
            accessFeaturesMapped: {
                statistics: { canRead: false, canWrite: false },
                ticketsView: {
                    canRead: false,
                    canCreateInternalNote: false,
                    canWrite: false,
                },
            },
            isStandaloneAiAgent: false,
        })
    })

    it('should render a list of (new and legacy) channels', () => {
        const store = configureMockStore()({
            integrations: fromJS({
                integrations: [{ type: 'email' }],
            }),
        })

        render(
            <Provider store={store}>
                <ChannelSelect />
            </Provider>,
        )

        expect(screen.queryByText('Email')).toBeInTheDocument()
        expect(screen.queryByText('TikTok Shop')).toBeInTheDocument()
    })

    it('should trigger a channel change when selecting a channel', () => {
        const store = configureMockStore([thunk])({
            ticket: fromJS({ messages: [] }),
            integrations: fromJS({
                integrations: [
                    { type: 'email', meta: { address: 'test@gorgias.com' } },
                ],
            }),
        })

        render(
            <Provider store={store}>
                <ChannelSelect />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Email'))
        expect(store.getActions()).toEqual([
            {
                type: 'MOCKED_PREPARE_NEW_MESSAGE',
                payload: 'email',
            },
        ])
    })

    it('should trigger channel change on keyboard shorcuts usage', () => {
        const store = configureMockStore()({
            ticket: fromJS({
                id: 1,
                reply_options: {
                    email: true,
                    'internal-note': true,
                },
            }),
            integrations: fromJS({
                integrations: [{ type: 'email' }],
            }),
        })

        render(
            <Provider store={store}>
                <ChannelSelect />
            </Provider>,
        )

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'TicketDetailContainer',
        )('FORWARD_REPLY')
        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'TicketDetailContainer',
        )('INTERNAL_NOTE_REPLY')

        expect(store.getActions()).toEqual([
            {
                type: 'MOCKED_PREPARE_NEW_MESSAGE',
                payload: 'email-forward',
            },
            {
                type: 'MOCKED_PREPARE_NEW_MESSAGE',
                payload: 'internal-note',
            },
        ])
    })
})
