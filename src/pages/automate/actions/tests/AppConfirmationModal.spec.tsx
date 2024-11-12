import {render, screen, act, fireEvent} from '@testing-library/react'
import React from 'react'

import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

import AppConfirmationModal from '../components/AppConfirmationModal'

jest.mock('models/integration/queries')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')

const mockUseApps = jest.mocked(useApps)

mockUseApps.mockReturnValue({
    apps: [
        {
            icon: 'https://ok.com/1.png',
            id: 'someid',
            name: 'My test app',
            type: 'app',
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useApps>)

describe('<AppConfirmationModal />', () => {
    it('should render modal details step', () => {
        render(
            <AppConfirmationModal
                templateId="test1"
                templateName="test"
                actionAppConfiguration={{
                    app_id: 'someid',
                    type: 'app',
                }}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                isOpen
            />
        )

        expect(screen.getByText('Action details')).toBeInTheDocument()
        expect(screen.getByText('Use Action')).toBeInTheDocument()
        expect(
            screen.getByText(
                'This Action requires an active My test app account.'
            )
        ).toBeInTheDocument()
    })

    it('should render modal input step', () => {
        render(
            <AppConfirmationModal
                templateId="test1"
                templateName="test"
                actionAppConfiguration={{
                    app_id: 'someid',
                    type: 'app',
                }}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                isOpen
                value="test"
                actionAppConnected={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
            />
        )

        expect(screen.getByText('Connect 3rd party app')).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(
            screen.getByText('Enter the API key from your My test app account.')
        ).toBeInTheDocument()
        expect(
            screen.getByText('Find your API key in My test app.')
        ).toBeInTheDocument()
    })

    it('should allow to discard changes button if initial API key was provided', () => {
        const mockOnConfirm = jest.fn()

        render(
            <AppConfirmationModal
                templateId="test1"
                templateName="test"
                actionAppConfiguration={{
                    app_id: 'someid',
                    type: 'app',
                }}
                onConfirm={mockOnConfirm}
                setOpen={jest.fn()}
                isOpen
                value="test"
            />
        )

        act(() => {
            fireEvent.change(screen.getByLabelText(/API key/), {
                target: {
                    value: 'new api key',
                },
            })
        })

        expect(screen.getByLabelText(/API key/)).toHaveValue('new api key')

        act(() => {
            fireEvent.click(screen.getByText('Discard changes'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockOnConfirm).toHaveBeenCalledWith('test', 'api_key')
    })
    it('should render modal details step for oauth2-token', () => {
        render(
            <AppConfirmationModal
                templateId="test2"
                templateName="OAuth2 Test"
                actionAppConfiguration={{
                    app_id: 'someid',
                    type: 'app',
                }}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                isOpen
                actionAppConnected={{
                    id: 'someid',
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
            />
        )

        expect(screen.getByText('Action details')).toBeInTheDocument()
        expect(screen.getByText('Use Action')).toBeInTheDocument()
        expect(
            screen.getByText(
                'This Action requires an active My test app account.'
            )
        ).toBeInTheDocument()
    })

    it('should switch to input step and prompt for refresh token', () => {
        render(
            <AppConfirmationModal
                templateId="test2"
                templateName="OAuth2 Test"
                actionAppConfiguration={{
                    app_id: 'someid',
                    type: 'app',
                }}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                isOpen
                actionAppConnected={{
                    id: 'someid',
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('Use Action'))
        })

        expect(screen.getByText('Connect 3rd party app')).toBeInTheDocument()
        expect(screen.getByText('Refresh token')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Enter the refresh token from your My test app account'
            )
        ).toBeInTheDocument()
    })

    it('should confirm input with refresh token', () => {
        const mockOnConfirm = jest.fn()

        render(
            <AppConfirmationModal
                templateId="test2"
                templateName="OAuth2 Test"
                actionAppConfiguration={{
                    app_id: 'someid',
                    type: 'app',
                }}
                onConfirm={mockOnConfirm}
                setOpen={jest.fn()}
                isOpen
                value="initial-refresh-token"
                actionAppConnected={{
                    id: 'someid',
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        act(() => {
            fireEvent.change(screen.getByLabelText(/Refresh token/), {
                target: {
                    value: 'new-refresh-token',
                },
            })
        })

        expect(screen.getByLabelText(/Refresh token/)).toHaveValue(
            'new-refresh-token'
        )

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockOnConfirm).toHaveBeenCalledWith(
            'new-refresh-token',
            'refresh_token'
        )
    })

    it('should allow discarding changes in refresh token input', () => {
        const mockOnConfirm = jest.fn()

        render(
            <AppConfirmationModal
                templateId="test2"
                templateName="OAuth2 Test"
                actionAppConfiguration={{
                    app_id: 'someid',
                    type: 'app',
                }}
                onConfirm={mockOnConfirm}
                setOpen={jest.fn()}
                isOpen
                value="initial-refresh-token"
                actionAppConnected={{
                    id: 'someid',
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        act(() => {
            fireEvent.change(screen.getByLabelText(/Refresh token/), {
                target: {
                    value: 'modified-refresh-token',
                },
            })
        })

        expect(screen.getByLabelText(/Refresh token/)).toHaveValue(
            'modified-refresh-token'
        )

        act(() => {
            fireEvent.click(screen.getByText('Discard changes'))
        })

        expect(screen.getByLabelText(/Refresh token/)).toHaveValue(
            'initial-refresh-token'
        )
    })
})
