import React from 'react'
import {render, screen} from '@testing-library/react'
import Core from '../Core' // Adjust the import path as necessary

jest.mock('common/notifications', () => ({
    NotificationsProvider: ({children}: {children: React.ReactNode}) => (
        <div data-testid="notifications-provider">{children}</div>
    ),
}))

jest.mock('pages/ErrorBoundary', () => ({
    ErrorBoundary: ({children}: {children: React.ReactNode}) => (
        <div data-testid="error-boundary">{children}</div>
    ),
}))

jest.mock('providers/ui/SpotlightProvider', () => ({
    SpotlightProvider: ({children}: {children: React.ReactNode}) => (
        <div data-testid="spotlight-provider">{children}</div>
    ),
}))

jest.mock('split-ticket-view-toggle', () => ({
    SplitTicketViewProvider: ({children}: {children: React.ReactNode}) => (
        <div data-testid="split-ticket-view-provider">{children}</div>
    ),
}))

jest.mock('theme', () => ({
    ThemeProvider: ({children}: {children: React.ReactNode}) => (
        <div data-testid="theme-provider">{children}</div>
    ),
}))

jest.mock(
    'pages/integrations/integration/components/voice/VoiceDeviceProvider',
    () => ({
        __esModule: true,
        default: ({children}: {children: React.ReactNode}) => (
            <div data-testid="voice-device-provider">{children}</div>
        ),
    })
)

jest.mock('react-cookie', () => ({
    CookiesProvider: ({children}: {children: React.ReactNode}) => (
        <div data-testid="cookies-provider">{children}</div>
    ),
}))

jest.mock('../App', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => (
        <div data-testid="app">{children}</div>
    ),
}))

describe('Core component', () => {
    it('should render all providers and pass children to App component', () => {
        const childrenText = 'Test Child'
        render(
            <Core>
                <div>{childrenText}</div>
            </Core>
        )

        expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
        expect(screen.getByTestId('notifications-provider')).toBeInTheDocument()
        expect(screen.getByTestId('spotlight-provider')).toBeInTheDocument()
        expect(screen.getByTestId('voice-device-provider')).toBeInTheDocument()
        expect(
            screen.getByTestId('split-ticket-view-provider')
        ).toBeInTheDocument()
        expect(screen.getByTestId('cookies-provider')).toBeInTheDocument()
        expect(screen.getByTestId('app')).toBeInTheDocument()
        expect(screen.getByText(childrenText)).toBeInTheDocument()
    })
})
