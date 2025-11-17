import React from 'react'

import { flushPromises } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'

import { IntegrationType } from 'models/integration/constants'
import { renderWithRouter } from 'utils/testing'

import type { App } from '../../types'
import ActionsPlatformAppForm from '../ActionsPlatformAppForm'

describe('<ActionsPlatformAppForm />', () => {
    const app: App = {
        icon: '/assets/img/integrations/app.png',
        id: 'someid',
        name: 'Test App',
        type: IntegrationType.App,
    }

    it('should render a form with name, auth method & instructions URL', () => {
        renderWithRouter(
            <ActionsPlatformAppForm apps={[app]} onSubmit={jest.fn()} />,
        )

        expect(screen.getByText('App')).toBeInTheDocument()
        expect(screen.getByText('Authentication method')).toBeInTheDocument()
        expect(screen.getByText('Instructions URL')).toBeInTheDocument()
    })

    it('should render back button', () => {
        const history = createMemoryHistory()

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <ActionsPlatformAppForm apps={[app]} onSubmit={jest.fn()} />,
            { history },
        )

        act(() => {
            fireEvent.click(screen.getByText('Back to Apps'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/ai-agent/actions-platform/apps',
        )
    })

    it('should render create button if actions app is new', () => {
        renderWithRouter(
            <ActionsPlatformAppForm apps={[app]} onSubmit={jest.fn()} />,
        )

        expect(screen.getByText('Create App settings')).toBeInTheDocument()
    })

    it('should render save changes button if actions app already exists', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />,
        )

        expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })

    it('should make save changes disabled if form is not dirty', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toBeAriaDisabled()
    })

    it('should make cancel button disabled if form is not dirty', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />,
        )

        expect(
            screen.getByRole('button', {
                name: 'Cancel',
            }),
        ).toBeAriaDisabled()
    })

    it('should make app select box disabled if app is already selected', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />,
        )

        expect(
            screen.getByText('Test App').closest('[role="combobox"]'),
        ).toHaveAttribute('tabindex', '-1')
    })

    it('should make auth type select box disabled if auth type is already selected', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />,
        )

        expect(
            screen.getByText('API key').closest('[role="combobox"]'),
        ).toHaveAttribute('tabindex', '-1')
    })

    it('should trigger onSubmit handle', async () => {
        const mockOnSubmit = jest.fn()

        renderWithRouter(
            <ActionsPlatformAppForm apps={[app]} onSubmit={mockOnSubmit} />,
        )

        await act(async () => {
            fireEvent.focus(screen.getByText('Select an App'))
        })

        await act(async () => {
            fireEvent.click(screen.getByText('Test App'))
        })

        await waitFor(() => {
            expect(screen.getByText('Test App')).toBeInTheDocument()
            expect(screen.queryByText('Select an App')).not.toBeInTheDocument()
        })

        await act(async () => {
            fireEvent.change(
                screen.getByPlaceholderText('https://link.gorgias.com/xyz'),
                {
                    target: { value: 'https://example.com' },
                },
            )
        })

        await waitFor(() => {
            const createButton = screen.getByText('Create App settings')
            expect(createButton).toBeEnabled()
        })

        await act(async () => {
            fireEvent.click(screen.getByText('Create App settings'))
        })

        expect(mockOnSubmit).toHaveBeenCalledWith({
            id: 'someid',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://example.com',
            },
        })
    })

    it('should not trigger onSubmit handle if form is submitting', async () => {
        const mockOnSubmit = jest.fn()

        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={mockOnSubmit}
                isSubmitting
            />,
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('https://example.com'), {
                target: { value: 'https://example2.com' },
            })
        })

        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should render refresh token URL input when auth_type is oauth2-token', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        refresh_token_url: '',
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />,
        )

        expect(
            screen.getByText('Refresh token endpoint URL'),
        ).toBeInTheDocument()
    })

    it('should not render refresh token URL input when auth_type is not oauth2-token', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />,
        )
        act(() => {
            fireEvent.change(screen.getByDisplayValue('https://example.com'), {
                target: { value: 'https://example2.com' },
            })
        })

        expect(
            screen.queryByText('Token refresh endpoint'),
        ).not.toBeInTheDocument()
    })

    it('should allow form submission when auth_type is oauth2-token and refresh token URL is provided', async () => {
        const mockOnSubmit = jest.fn()

        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        url: 'https://example.com',
                        refresh_token_url: 'https://refresh.example.com',
                    },
                }}
                apps={[app]}
                onSubmit={mockOnSubmit}
            />,
        )
        act(() => {
            fireEvent.change(screen.getByDisplayValue('https://example.com'), {
                target: { value: 'https://example2.com' },
            })
        })
        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockOnSubmit).toHaveBeenCalledWith({
            id: 'someid',
            auth_type: 'oauth2-token',
            auth_settings: {
                url: 'https://example2.com',
                refresh_token_url: 'https://refresh.example.com',
            },
        })
    })

    it('should not allow form submission when auth_type is oauth2-token and refresh token URL is invalid', async () => {
        const mockOnSubmit = jest.fn()

        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        url: 'https://example.com',
                        refresh_token_url: 'https://refresh.example.com',
                    },
                }}
                apps={[app]}
                onSubmit={mockOnSubmit}
            />,
        )
        act(() => {
            fireEvent.change(screen.getByDisplayValue('https://example.com'), {
                target: { value: 'invalid_url' },
            })
        })
        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should not allow form submission when auth_type is oauth2-token and refresh token URL is empty', async () => {
        const mockOnSubmit = jest.fn()

        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        url: 'https://example.com',
                        refresh_token_url: 'https://refresh.example.com',
                    },
                }}
                apps={[app]}
                onSubmit={mockOnSubmit}
            />,
        )
        act(() => {
            fireEvent.change(screen.getByDisplayValue('https://example.com'), {
                target: { value: '' },
            })
        })
        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should allow form submission with API key input label and instruction URL link text', async () => {
        const mockOnSubmit = jest.fn()

        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[]}
                onSubmit={mockOnSubmit}
            />,
        )

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Input label'), {
                target: { value: 'Test API Key Label' },
            })
        })

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Instructions URL text'), {
                target: { value: 'Test Instructions URL text' },
            })
        })

        await waitFor(() => {
            const saveButton = screen.getByText('Save Changes')
            expect(saveButton).toBeEnabled()
        })

        await act(async () => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockOnSubmit).toHaveBeenCalledWith({
            id: 'someid',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://example.com',
                input_label: 'Test API Key Label',
                instruction_url_text: 'Test Instructions URL text',
            },
        })
    })

    it('should allow form submission for OAuth2 token with just instruction URL link text', async () => {
        const mockOnSubmit = jest.fn()

        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'oauth2-token',
                    auth_settings: {
                        url: 'https://example.com',
                        refresh_token_url: 'https://example.com',
                    },
                }}
                apps={[]}
                onSubmit={mockOnSubmit}
            />,
        )

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Instructions URL text'), {
                target: { value: 'Test Instructions URL text' },
            })
        })

        await waitFor(() => {
            const saveButton = screen.getByText('Save Changes')
            expect(saveButton).toBeEnabled()
        })

        await act(async () => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockOnSubmit).toHaveBeenCalledWith({
            id: 'someid',
            auth_type: 'oauth2-token',
            auth_settings: {
                url: 'https://example.com',
                instruction_url_text: 'Test Instructions URL text',
                refresh_token_url: 'https://example.com',
            },
        })
    })

    it('should render trackstar integration when auth_type is trackstar', async () => {
        const mock = jest.fn()
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'trackstar',
                    auth_settings: {
                        integration_name: 'sandbox',
                    },
                }}
                apps={[app]}
                onSubmit={mock}
            />,
        )

        act(() => {
            fireEvent.focus(screen.getByText('sandbox'))
        })
        act(() => {
            fireEvent.click(screen.getByText('shiphero'))
        })
        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })
        expect(mock).toHaveBeenCalledWith({
            id: 'someid',
            auth_type: 'trackstar',
            auth_settings: {
                integration_name: 'shiphero',
            },
        })
    })
})
