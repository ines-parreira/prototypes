import {act, fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import {renderWithRouter} from 'utils/testing'

import AppConfirmationModal from '../AppConfirmationModal'

jest.mock('models/integration/queries')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')

const mockUseApps = jest.mocked(useApps)

mockUseApps.mockReturnValue({
    apps: [
        {
            icon: 'https://ok.com/1.png',
            id: 'app_id',
            name: 'My test app',
            type: 'app',
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useApps>)

describe('<AppConfirmationModal />', () => {
    it('should render component', () => {
        renderWithRouter(
            <AppConfirmationModal
                actionAppConfiguration={{app_id: 'app_id', type: 'app'}}
                isOpen={true}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                templateId="1"
                templateName="test template"
            />
        )

        expect(screen.getByText('test template')).toBeInTheDocument()
    })

    it('should render component with details step', () => {
        renderWithRouter(
            <AppConfirmationModal
                actionAppConfiguration={{app_id: 'app_id', type: 'app'}}
                isOpen={true}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                templateId="1"
                templateName="test template"
            />
        )

        expect(screen.getByText('test template')).toBeInTheDocument()
        expect(screen.getByText('Action details')).toBeInTheDocument()
        expect(screen.getByText('Use Action')).toBeInTheDocument()
    })

    it('should proceed to input step when clicking "Use Action"', () => {
        renderWithRouter(
            <AppConfirmationModal
                actionAppConfiguration={{app_id: 'app_id', type: 'app'}}
                isOpen={true}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                templateId="1"
                templateName="test template"
            />
        )

        fireEvent.click(screen.getByText('Use Action'))

        expect(screen.getByText('Connect 3rd party app')).toBeInTheDocument()
    })

    it('should render input fields correctly in input step', () => {
        const actionAppConnected = {
            id: 'app_id',
            auth_type: 'oauth2-token' as const,
            auth_settings: {
                url: 'https://example.com',
                instruction_url_text: 'Find your token here',
            },
        }

        renderWithRouter(
            <AppConfirmationModal
                actionAppConfiguration={{app_id: 'app_id', type: 'app'}}
                isOpen={true}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                templateId="1"
                templateName="test template"
                actionAppConnected={actionAppConnected}
            />
        )

        fireEvent.click(screen.getByText('Use Action'))

        expect(
            screen.getByText(
                'Enter the refresh token below from your My test app account.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Refresh token')).toBeInTheDocument()
        expect(screen.getByText('Find your token here')).toBeInTheDocument()
    })

    it('should call onConfirm with correct values when saving changes', async () => {
        const onConfirmMock = jest.fn()
        const actionAppConnected = {
            id: 'app_id',
            auth_type: 'oauth2-token' as const,
            auth_settings: {
                input_label: 'Refresh token',
            },
        }

        renderWithRouter(
            <AppConfirmationModal
                actionAppConfiguration={{app_id: 'app_id', type: 'app'}}
                isOpen={true}
                setOpen={jest.fn()}
                templateId="1"
                templateName="test template"
                actionAppConnected={actionAppConnected}
                onConfirm={onConfirmMock}
            />
        )

        fireEvent.click(screen.getByText('Use Action'))

        const input = screen.getByRole('textbox')
        await userEvent.type(input, 'test-token')
        fireEvent.click(screen.getByText('Continue'))

        expect(onConfirmMock).toHaveBeenCalledWith(
            'test-token',
            'refresh_token'
        )
    })

    it('should discard changes when clicking "Discard changes"', async () => {
        const setOpenMock = jest.fn()
        const value = 'initial-value'

        renderWithRouter(
            <AppConfirmationModal
                actionAppConfiguration={{app_id: 'app_id', type: 'app'}}
                onConfirm={jest.fn()}
                templateId="1"
                templateName="test template"
                value={value}
                isOpen={true}
                setOpen={setOpenMock}
            />
        )

        const input = screen.getByRole('textbox')
        await userEvent.type(input, 'new-value')
        fireEvent.click(screen.getByText('Discard changes'))

        expect(screen.getByRole('textbox')).toHaveValue(value)
    })

    it('should close the modal when clicking "Cancel"', () => {
        const setOpenMock = jest.fn()

        renderWithRouter(
            <AppConfirmationModal
                actionAppConfiguration={{app_id: 'app_id', type: 'app'}}
                onConfirm={jest.fn()}
                templateId="1"
                templateName="test template"
                isOpen={true}
                setOpen={setOpenMock}
            />
        )

        fireEvent.click(screen.getByText('Cancel'))

        expect(setOpenMock).toHaveBeenCalledWith(false)
    })
    it('should render modal details step', () => {
        render(
            <AppConfirmationModal
                templateId="test1"
                templateName="test"
                actionAppConfiguration={{
                    app_id: 'app_id',
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
                    app_id: 'app_id',
                    type: 'app',
                }}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                isOpen
                value="test"
                actionAppConnected={{
                    id: 'app_id',
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
            screen.getByText(
                'Enter the API key below from your My test app account.'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText('How to find your API Key in My test app')
        ).toBeInTheDocument()
    })

    it('should allow to discard changes button if initial API key was provided', () => {
        const mockOnConfirm = jest.fn()

        render(
            <AppConfirmationModal
                templateId="test1"
                templateName="test"
                actionAppConfiguration={{
                    app_id: 'app_id',
                    type: 'app',
                }}
                onConfirm={mockOnConfirm}
                setOpen={jest.fn()}
                isOpen
                value="test"
            />
        )

        act(() => {
            fireEvent.change(screen.getByLabelText(/API Key/), {
                target: {
                    value: 'new api key',
                },
            })
        })

        expect(screen.getByLabelText(/API Key/)).toHaveValue('new api key')

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
                    app_id: 'app_id',
                    type: 'app',
                }}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                isOpen
                actionAppConnected={{
                    id: 'app_id',
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
                    app_id: 'app_id',
                    type: 'app',
                }}
                onConfirm={jest.fn()}
                setOpen={jest.fn()}
                isOpen
                actionAppConnected={{
                    id: 'app_id',
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
                'Enter the refresh token below from your My test app account.'
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
                    app_id: 'app_id',
                    type: 'app',
                }}
                onConfirm={mockOnConfirm}
                setOpen={jest.fn()}
                isOpen
                value="initial-refresh-token"
                actionAppConnected={{
                    id: 'app_id',
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
                    app_id: 'app_id',
                    type: 'app',
                }}
                onConfirm={mockOnConfirm}
                setOpen={jest.fn()}
                isOpen
                value="initial-refresh-token"
                actionAppConnected={{
                    id: 'app_id',
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
