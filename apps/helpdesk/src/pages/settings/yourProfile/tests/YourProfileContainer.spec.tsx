import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router-dom'

import {
    mockGetCurrentUserHandler,
    mockUpdateCurrentUserHandler,
    mockUpdateCurrentUserSettingsHandler,
} from '@gorgias/helpdesk-mocks'
import { UserSettingType } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'

import { CurrentUser } from '../types'
import YourProfileContainer from '../YourProfileContainer'

jest.mock('../components/YourProfileView', () => ({
    YourProfileView: jest.fn(
        ({
            currentUser,
            settingsPreferences,
            languagePreferences,
            isGorgiasAgent,
        }) => (
            <div data-testid="your-profile-view">
                <div data-testid="current-user-profile-info">
                    <pre>{JSON.stringify(currentUser, null, 2)}</pre>
                </div>
                <div data-testid="settings-preferences">
                    <pre>{JSON.stringify(settingsPreferences, null, 2)}</pre>
                </div>
                <div data-testid="language-preferences">
                    <pre>{JSON.stringify(languagePreferences, null, 2)}</pre>
                </div>
                <div data-testid="is-gorgias-agent">{`${isGorgiasAgent}`}</div>
            </div>
        ),
    ),
}))

// Mock the LoadingSpinner component
jest.mock('@gorgias/axiom', () => ({
    LoadingSpinner: jest.fn(() => (
        <div data-testid="loading-spinner">Loading...</div>
    )),
}))

const server = setupServer()

const settingsPreferences = {
    id: 1,
    type: UserSettingType.Preferences,
    data: {
        available: true,
        date_format: 'en_GB',
        time_format: '24-hour',
        prefill_best_macro: false,
        show_macros: false,
        show_macros_suggestions: true,
    },
}

const languagePreferences = {
    id: 1,
    type: UserSettingType.LanguagePreferences,
    data: {
        primary: 'en',
        proficient: [],
    },
}

const mockUpdateCurrentUserSettings = mockUpdateCurrentUserSettingsHandler()
const mockUpdateCurrentUser = mockUpdateCurrentUserHandler()
const mockGetCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        settings: [settingsPreferences, languagePreferences],
    } as CurrentUser['data']),
)

const localHandlers = [
    mockGetCurrentUser.handler,
    mockUpdateCurrentUserSettings.handler,
    mockUpdateCurrentUser.handler,
]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const renderComponent = () =>
    render(
        <MemoryRouter>
            <QueryClientProvider client={appQueryClient}>
                <YourProfileContainer />
            </QueryClientProvider>
        </MemoryRouter>,
    )

describe('YourProfileContainer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Loading state', () => {
        it('should show loading spinner when current user data is not available', async () => {
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json(null),
            )

            server.use(handler)

            renderComponent()

            expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
            expect(screen.getByText('Loading...')).toBeInTheDocument()
        })
    })

    describe('Memoized objects', () => {
        it('should pass correct memoized currentUserProfileInfo to YourProfileView', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByTestId('your-profile-view'),
                ).toBeInTheDocument()
            })

            const currentUserProfileInfo = screen.getByTestId(
                'current-user-profile-info',
            )
            const displayedData = JSON.parse(
                currentUserProfileInfo.textContent || '{}',
            )

            expect(displayedData).toEqual({
                id: mockGetCurrentUser.data.id,
                name: mockGetCurrentUser.data.name,
                email: mockGetCurrentUser.data.email,
                bio: mockGetCurrentUser.data.bio,
                timezone: mockGetCurrentUser.data.timezone,
                language: mockGetCurrentUser.data.language,
                settings: [settingsPreferences, languagePreferences],
                meta: mockGetCurrentUser.data.meta,
            })
        })

        it('should pass correct memoized settingsPreferences to YourProfileView', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByTestId('your-profile-view'),
                ).toBeInTheDocument()
            })

            const settingsPreferencesElement = screen.getByTestId(
                'settings-preferences',
            )
            const displayedSettings = JSON.parse(
                settingsPreferencesElement.textContent || '{}',
            )

            expect(displayedSettings).toEqual(settingsPreferences)
        })

        it('should pass correct memoized languagePreferences to YourProfileView', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByTestId('your-profile-view'),
                ).toBeInTheDocument()
            })

            const languagePreferencesElement = screen.getByTestId(
                'language-preferences',
            )
            const displayedLanguagePreferences = JSON.parse(
                languagePreferencesElement.textContent || '{}',
            )

            expect(displayedLanguagePreferences).toEqual(languagePreferences)
        })

        it('should pass correct isGorgiasAgent value for regular user', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [settingsPreferences, languagePreferences],
                } as CurrentUser['data']),
            )

            server.use(handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByTestId('your-profile-view'),
                ).toBeInTheDocument()
            })

            const isGorgiasAgentElement = screen.getByTestId('is-gorgias-agent')
            expect(isGorgiasAgentElement).toHaveTextContent('false')
        })
    })
})
