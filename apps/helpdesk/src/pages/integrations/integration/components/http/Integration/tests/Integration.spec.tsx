import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { baseHttp, httpIntegration } from 'fixtures/integrations'
import { ContentType, HttpMethod } from 'models/api/types'
import type { HTTPForm } from 'models/integration/types'
import { IntegrationType, OAuth2TokenLocation } from 'models/integration/types'
import { Integration } from 'pages/integrations/integration/components/http/Integration/Integration'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'

describe('HTTP Integration', () => {
    const minProps = {
        integration: undefined,
        isUpdate: false,
        loading: {},
        deactivateIntegration: jest.fn(),
        activateIntegration: jest.fn(),
        deleteIntegration: jest.fn(),
        updateOrCreateIntegration: jest.fn(),
    }

    it('should render creation form with default values when no integration exists', () => {
        render(<Integration {...minProps} />)

        expect(screen.getByLabelText('Integration name')).toBeInTheDocument()
        expect(screen.getByLabelText('Description')).toBeInTheDocument()
        expect(screen.getByLabelText('URL')).toBeInTheDocument()
        expect(screen.getByLabelText('HTTP Method')).toBeInTheDocument()
    })

    it('should display integration data in update mode', () => {
        const mockIntegration = {
            ...httpIntegration,
            id: 1,
            type: IntegrationType.Http as IntegrationType.Http,
            name: 'Test Integration',
            meta: {},
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-01T00:00:00Z',
            deleted_datetime: null,
            deactivated_datetime: null,
            decoration: null,
            application_id: null,
            account_id: 1,
            created_by_id: 1,
            locked_datetime: null,
            uri: '/api/integrations/1',
            user: {
                id: 1,
                email: 'test@example.com',
            },
            managed: false,
            http: {
                ...httpIntegration.http,
                id: 1,
                url: 'https://test.com',
                execution_order: 0,
                method: HttpMethod.Get,
                request_content_type: ContentType.Json,
                response_content_type: ContentType.Json,
                headers: {},
                triggers: {
                    'ticket-created': true,
                    'ticket-updated': true,
                },
                form: '' as HTTPForm,
            },
        }

        render(
            <Integration
                {...minProps}
                integration={mockIntegration}
                isUpdate={true}
            />,
        )

        expect(screen.getByLabelText('Integration name')).toHaveValue(
            'Test Integration',
        )
    })

    it('should handle form submission with correct data', () => {
        const mockUpdateOrCreate = jest.fn()
        render(
            <Integration
                {...minProps}
                updateOrCreateIntegration={mockUpdateOrCreate}
            />,
        )

        fireEvent.change(screen.getByLabelText('Integration name'), {
            target: { value: 'Test Integration' },
        })
        fireEvent.change(screen.getByLabelText('URL'), {
            target: { value: 'https://test.com/webhook' },
        })

        const checkbox = screen
            .getByText('Ticket message failed')
            .closest('label')
            ?.querySelector('input')

        if (checkbox) {
            fireEvent.click(checkbox)
        }

        fireEvent.click(screen.getByText('Add integration'))

        const expectedData = fromJS({
            type: 'http',
            name: 'Test Integration',
            description: '',
            http: {
                headers: {},
                url: 'https://test.com/webhook',
                method: 'GET',
                request_content_type: 'application/json',
                response_content_type: 'application/json',
                triggers: {
                    'ticket-created': false,
                    'ticket-updated': false,
                    'ticket-self-unsnoozed': false,
                    'ticket-message-created': false,
                    'ticket-message-failed': true,
                    'ticket-assignment-updated': false,
                    'ticket-status-updated': false,
                },
                form: null,
                oauth2: undefined,
            },
        })

        expect(mockUpdateOrCreate).toHaveBeenCalledWith(expectedData)
    })

    it('should validate header names correctly', () => {
        render(<Integration {...minProps} />)

        const addHeaderButton = screen.getByText(/Add header/)
        fireEvent.click(addHeaderButton)

        const headerInput = screen.getByPlaceholderText('Key')
        fireEvent.change(headerInput, { target: { value: 'Invalid Header!' } })

        expect(
            screen.getByText('Header name contains invalid characters'),
        ).toBeInTheDocument()
    })

    it('should handle state change for ticketMessageCreated', () => {
        const component = React.createRef<Integration>()
        render(<Integration {...minProps} ref={component} />)

        const setStateSpy = jest.spyOn(component.current!, 'setState')

        const checkbox = screen
            .getByText('Ticket message created')
            .closest('label')
            ?.querySelector('input')

        if (checkbox) {
            fireEvent.click(checkbox)
            expect(setStateSpy).toHaveBeenCalledWith({
                ticketMessageCreated: true,
            })
        }
    })

    it('should handle state change for ticketMessageFailed', () => {
        const component = React.createRef<Integration>()
        render(<Integration {...minProps} ref={component} />)

        const setStateSpy = jest.spyOn(component.current!, 'setState')

        const checkbox = screen
            .getByText('Ticket message failed')
            .closest('label')
            ?.querySelector('input')

        if (checkbox) {
            fireEvent.click(checkbox)
            expect(setStateSpy).toHaveBeenCalledWith({
                ticketMessageFailed: true,
            })
        }
    })

    it('should handle state change for ticketSelfUnsnoozed', () => {
        const component = React.createRef<Integration>()
        render(<Integration {...minProps} ref={component} />)

        const setStateSpy = jest.spyOn(component.current!, 'setState')

        const checkbox = screen
            .getByText('Ticket self unsnoozed')
            .closest('label')
            ?.querySelector('input')

        if (checkbox) {
            fireEvent.click(checkbox)
            expect(setStateSpy).toHaveBeenCalledWith({
                ticketSelfUnsnoozed: true,
            })
        }
    })

    it('should handle state change for ticketUpdated', () => {
        const component = React.createRef<Integration>()
        render(<Integration {...minProps} ref={component} />)

        const setStateSpy = jest.spyOn(component.current!, 'setState')

        const checkbox = screen
            .getByText('Ticket updated')
            .closest('label')
            ?.querySelector('input')

        if (checkbox) {
            fireEvent.click(checkbox)
            expect(setStateSpy).toHaveBeenCalledWith({
                ticketUpdated: true,
            })
        }
    })

    it('should handle state change for ticketAssignmentUpdated', () => {
        const component = React.createRef<Integration>()
        render(<Integration {...minProps} ref={component} />)

        const setStateSpy = jest.spyOn(component.current!, 'setState')

        const checkbox = screen
            .getByText('Ticket assignment updated')
            .closest('label')
            ?.querySelector('input')

        if (checkbox) {
            fireEvent.click(checkbox)
            expect(setStateSpy).toHaveBeenCalledWith({
                ticketAssignmentUpdated: true,
            })
        }
    })

    it('should handle state change for ticketStatusUpdated', () => {
        const component = React.createRef<Integration>()
        render(<Integration {...minProps} ref={component} />)

        const setStateSpy = jest.spyOn(component.current!, 'setState')

        const checkbox = screen
            .getByText('Ticket status updated')
            .closest('label')
            ?.querySelector('input')

        if (checkbox) {
            fireEvent.click(checkbox)
            expect(setStateSpy).toHaveBeenCalledWith({
                ticketStatusUpdated: true,
            })
        }
    })

    it('should handle content type changes correctly', () => {
        render(
            <Integration
                {...minProps}
                integration={{
                    ...httpIntegration,
                    http: {
                        ...baseHttp,
                        request_content_type: ContentType.Form,
                    },
                }}
                isUpdate={true}
            />,
        )

        const contentTypeSelect = screen.getByLabelText('Request content type')
        fireEvent.change(contentTypeSelect, {
            target: { value: ContentType.Json },
        })

        expect(screen.getByLabelText('Request content type')).toHaveValue(
            ContentType.Json,
        )
    })

    describe('Integration actions', () => {
        it('should handle activation/deactivation', () => {
            const mockDeactivate = jest.fn()
            render(
                <Integration
                    {...minProps}
                    integration={httpIntegration}
                    isUpdate={true}
                    deactivateIntegration={mockDeactivate}
                />,
            )

            fireEvent.click(screen.getByText('Deactivate HTTP integration'))
            expect(mockDeactivate).toHaveBeenCalledWith(httpIntegration.id)
        })

        it('should show confirmation dialog before deletion', () => {
            render(
                <Integration
                    {...minProps}
                    integration={httpIntegration}
                    isUpdate={true}
                />,
            )

            fireEvent.click(screen.getByText('Delete HTTP integration'))
            expect(
                screen.getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT),
            ).toBeInTheDocument()
        })
    })

    describe('Method and Content Type interactions', () => {
        it('should set default form when switching from GET to another method', () => {
            render(<Integration {...minProps} />)

            const methodSelect = screen.getByLabelText('HTTP Method')
            fireEvent.change(methodSelect, {
                target: { value: HttpMethod.Post },
            })

            // Request content type should appear
            expect(
                screen.getByLabelText('Request content type'),
            ).toBeInTheDocument()
            expect(screen.getByText('Request Body (JSON)')).toBeInTheDocument()
        })

        it('should not show request content type for GET method', () => {
            render(<Integration {...minProps} />)

            const methodSelect = screen.getByLabelText('HTTP Method')
            fireEvent.change(methodSelect, {
                target: { value: HttpMethod.Get },
            })

            expect(
                screen.queryByLabelText('Request content type'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Request Body (JSON)'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Loading states', () => {
        it('should show loader when integration is loading', () => {
            render(
                <Integration
                    {...minProps}
                    isUpdate={true}
                    integration={undefined}
                />,
            )

            const loaderIcon = document.querySelector(
                '.icon-circle-o-notch.md-spin',
            )
            expect(loaderIcon).toBeInTheDocument()
        })

        it('should disable submit button while submitting', () => {
            const mockIntegration = {
                ...httpIntegration,
                id: 1,
                type: IntegrationType.Http as IntegrationType.Http,
                name: 'Test Integration',
                meta: {},
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                deleted_datetime: null,
                deactivated_datetime: null,
                decoration: null,
                application_id: null,
                account_id: 1,
                created_by_id: 1,
                locked_datetime: null,
                uri: '/api/integrations/1',
                user: {
                    id: 1,
                    email: 'test@example.com',
                },
                managed: false,
                http: {
                    ...httpIntegration.http,
                    id: 1,
                    url: 'https://test.com',
                    execution_order: 0,
                    method: HttpMethod.Get,
                    request_content_type: ContentType.Json,
                    response_content_type: ContentType.Json,
                    headers: {},
                    triggers: {
                        'ticket-created': true,
                        'ticket-updated': true,
                    },
                    form: '' as HTTPForm,
                },
            }

            render(
                <Integration
                    {...minProps}
                    loading={{ updateIntegration: 1 }}
                    integration={mockIntegration}
                />,
            )

            const submitButton = screen.getByRole('button', {
                name: /Add integration/,
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should disable submit button if form is invalid', () => {
            const mockUpdateOrCreate = jest.fn()
            render(
                <Integration
                    {...minProps}
                    updateOrCreateIntegration={mockUpdateOrCreate}
                />,
            )

            fireEvent.change(screen.getByLabelText('URL'), {
                target: { value: 'https://test.com/webhook' },
            })

            const checkbox = screen
                .getByText('Ticket message failed')
                .closest('label')
                ?.querySelector('input')

            if (checkbox) {
                fireEvent.click(checkbox)
            }

            fireEvent.click(screen.getByText('Add integration'))

            const submitButton = screen.getByRole('button', {
                name: /Add integration/i,
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Reactivation', () => {
        it('should show reactivate button for deactivated integration', () => {
            const mockActivate = jest.fn()
            const deactivatedIntegration = {
                ...httpIntegration,
                deactivated_datetime: '2024-01-01',
            }

            render(
                <Integration
                    {...minProps}
                    integration={deactivatedIntegration}
                    isUpdate={true}
                    activateIntegration={mockActivate}
                />,
            )

            const reactivateButton = screen.getByText(
                'Re-activate HTTP integration',
            )
            fireEvent.click(reactivateButton)
            expect(mockActivate).toHaveBeenCalledWith(deactivatedIntegration.id)
        })
    })

    describe('Form validation', () => {
        it('should validate required fields before submission', () => {
            render(<Integration {...minProps} />)

            fireEvent.click(screen.getByText('Add integration'))

            expect(screen.getByLabelText('Integration name')).toBeInvalid()
            expect(screen.getByLabelText('URL')).toBeInvalid()
        })

        it('should validate URL format', () => {
            render(<Integration {...minProps} />)

            const urlInput = screen.getByLabelText('URL')
            fireEvent.change(urlInput, { target: { value: 'invalid-url' } })

            expect(urlInput).toBeInvalid()
        })

        it('should disable submit button when name is empty', () => {
            render(<Integration {...minProps} />)

            const urlInput = screen.getByLabelText('URL')
            fireEvent.change(urlInput, {
                target: { value: 'https://test.com' },
            })

            const submitButton = screen.getByRole('button', {
                name: /Add integration/i,
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should disable submit button when URL is empty', () => {
            render(<Integration {...minProps} />)

            const nameInput = screen.getByLabelText('Integration name')
            fireEvent.change(nameInput, {
                target: { value: 'Test Integration' },
            })

            const submitButton = screen.getByRole('button', {
                name: /Add integration/i,
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should disable submit button when no triggers are selected', () => {
            render(<Integration {...minProps} />)

            const nameInput = screen.getByLabelText('Integration name')
            const urlInput = screen.getByLabelText('URL')
            fireEvent.change(nameInput, {
                target: { value: 'Test Integration' },
            })
            fireEvent.change(urlInput, {
                target: { value: 'https://test.com' },
            })

            const submitButton = screen.getByRole('button', {
                name: /Add integration/i,
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should enable submit button when triggers are selected', () => {
            render(<Integration {...minProps} />)

            const nameInput = screen.getByLabelText('Integration name')
            const urlInput = screen.getByLabelText('URL')
            fireEvent.change(nameInput, {
                target: { value: 'Test Integration' },
            })
            fireEvent.change(urlInput, {
                target: { value: 'https://test.com' },
            })

            const checkbox = screen
                .getByText('Ticket created')
                .closest('label')
                ?.querySelector('input')
            if (checkbox) {
                fireEvent.click(checkbox)
            }

            const submitButton = screen.getByRole('button', {
                name: /Add integration/i,
            })
            expect(submitButton).not.toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Initialization', () => {
        it('should initialize state from integration in componentWillMount', () => {
            const mockIntegration = {
                ...httpIntegration,
                id: 1,
                type: IntegrationType.Http as IntegrationType.Http,
                name: 'Test Integration',
                meta: {},
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                deleted_datetime: null,
                deactivated_datetime: null,
                decoration: null,
                application_id: null,
                account_id: 1,
                created_by_id: 1,
                locked_datetime: null,
                uri: '/api/integrations/1',
                user: {
                    id: 1,
                    email: 'test@example.com',
                },
                managed: false,
                http: {
                    ...httpIntegration.http,
                    id: 1,
                    url: 'https://test.com',
                    execution_order: 0,
                    method: HttpMethod.Get,
                    request_content_type: ContentType.Json,
                    response_content_type: ContentType.Json,
                    headers: {},
                    triggers: {
                        'ticket-created': true,
                        'ticket-updated': true,
                    },
                    form: '' as HTTPForm,
                },
            }

            const component = React.createRef<Integration>()
            render(
                <Integration
                    {...minProps}
                    integration={mockIntegration}
                    isUpdate={true}
                    ref={component}
                />,
            )

            expect(screen.getByLabelText('Integration name')).toHaveValue(
                'Test Integration',
            )
            expect(screen.getByLabelText('URL')).toHaveValue('https://test.com')
            expect(
                screen
                    .getByText('Ticket created')
                    .closest('label')
                    ?.querySelector('input'),
            ).toBeChecked()
            expect(
                screen
                    .getByText('Ticket updated')
                    .closest('label')
                    ?.querySelector('input'),
            ).toBeChecked()
        })

        it('should initialize state from integration in componentWillUpdate', () => {
            const mockIntegration = {
                ...httpIntegration,
                id: 1,
                type: IntegrationType.Http as IntegrationType.Http,
                name: 'Test Integration',
                meta: {},
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                deleted_datetime: null,
                deactivated_datetime: null,
                decoration: null,
                application_id: null,
                account_id: 1,
                created_by_id: 1,
                locked_datetime: null,
                uri: '/api/integrations/1',
                user: {
                    id: 1,
                    email: 'test@example.com',
                },
                managed: false,
                http: {
                    ...httpIntegration.http,
                    id: 1,
                    url: 'https://test.com',
                    execution_order: 0,
                    method: HttpMethod.Get,
                    request_content_type: ContentType.Json,
                    response_content_type: ContentType.Json,
                    headers: {},
                    triggers: {
                        'ticket-created': true,
                        'ticket-updated': true,
                    },
                    form: '' as HTTPForm,
                },
            }

            const { rerender } = render(<Integration {...minProps} />)

            // First render without integration
            expect(screen.getByLabelText('Integration name')).toHaveValue('')
            expect(screen.getByLabelText('URL')).toHaveValue('')

            // Rerender with integration
            rerender(
                <Integration
                    {...minProps}
                    integration={mockIntegration}
                    isUpdate={true}
                />,
            )

            // Should now have the integration values
            expect(screen.getByLabelText('Integration name')).toHaveValue(
                'Test Integration',
            )
            expect(screen.getByLabelText('URL')).toHaveValue('https://test.com')
            expect(
                screen
                    .getByText('Ticket created')
                    .closest('label')
                    ?.querySelector('input'),
            ).toBeChecked()
            expect(
                screen
                    .getByText('Ticket updated')
                    .closest('label')
                    ?.querySelector('input'),
            ).toBeChecked()
        })

        it('should not reinitialize state if already initialized', () => {
            const mockIntegration = {
                ...httpIntegration,
                id: 1,
                type: IntegrationType.Http as IntegrationType.Http,
                name: 'Test Integration',
                meta: {},
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                deleted_datetime: null,
                deactivated_datetime: null,
                decoration: null,
                application_id: null,
                account_id: 1,
                created_by_id: 1,
                locked_datetime: null,
                uri: '/api/integrations/1',
                user: {
                    id: 1,
                    email: 'test@example.com',
                },
                managed: false,
                http: {
                    ...httpIntegration.http,
                    id: 1,
                    url: 'https://test.com',
                    execution_order: 0,
                    method: HttpMethod.Get,
                    request_content_type: ContentType.Json,
                    response_content_type: ContentType.Json,
                    headers: {},
                    triggers: {
                        'ticket-created': true,
                        'ticket-updated': true,
                    },
                    form: '' as HTTPForm,
                },
            }

            const { rerender } = render(
                <Integration
                    {...minProps}
                    integration={mockIntegration}
                    isUpdate={true}
                />,
            )

            // Change the integration name
            const updatedIntegration = {
                ...mockIntegration,
                name: 'Updated Integration',
            }

            // Rerender with updated integration
            rerender(
                <Integration
                    {...minProps}
                    integration={updatedIntegration}
                    isUpdate={true}
                />,
            )

            // Should still have the original name since it's already initialized
            expect(screen.getByLabelText('Integration name')).toHaveValue(
                'Test Integration',
            )
        })

        it('should set state when initializing', () => {
            const component = React.createRef<Integration>()
            const setStateSpy = jest.spyOn(
                React.Component.prototype,
                'setState',
            )

            render(
                <Integration
                    {...minProps}
                    integration={httpIntegration}
                    isUpdate={true}
                    ref={component}
                />,
            )

            expect(setStateSpy).toHaveBeenCalled()
            expect(component.current?.isInitialized).toBe(true)
        })
    })

    describe('OAuth2 authentication', () => {
        const oauthMinProps = {
            ...minProps,
            isHttpIntegrationOAuthEnabled: true,
        }

        it('should render OAuth2 toggle in the creation form', () => {
            render(<Integration {...oauthMinProps} />)

            expect(
                screen.getByText('Enable authentication method: OAuth2'),
            ).toBeInTheDocument()
        })

        it('should not render OAuth2 fields when toggle is off by default', () => {
            render(<Integration {...oauthMinProps} />)

            expect(screen.queryByLabelText('Token URL')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Client ID')).not.toBeInTheDocument()
            expect(
                screen.queryByLabelText('Client Secret'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByLabelText('Token Location'),
            ).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Token Key')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Scopes')).not.toBeInTheDocument()
        })

        it('should show OAuth2 fields when toggle is enabled', () => {
            const component = React.createRef<Integration>()
            render(<Integration {...oauthMinProps} ref={component} />)

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')

            if (toggle) {
                fireEvent.click(toggle)
            }

            expect(
                screen.getByRole('textbox', { name: /token url/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('textbox', { name: /client id/i }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText(/client secret/i)).toBeInTheDocument()
            expect(screen.getByLabelText('Token Location')).toBeInTheDocument()
            expect(
                screen.getByRole('textbox', { name: /token key/i }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText('Scopes')).toBeInTheDocument()
        })

        it('should hide OAuth2 fields when toggle is disabled after being enabled', () => {
            render(<Integration {...oauthMinProps} />)

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')

            if (toggle) {
                fireEvent.click(toggle)
                expect(
                    screen.getByRole('textbox', { name: /token url/i }),
                ).toBeInTheDocument()

                fireEvent.click(toggle)
                expect(
                    screen.queryByRole('textbox', { name: /token url/i }),
                ).not.toBeInTheDocument()
            }
        })

        it('should update oauth2Config state when Token URL is changed', () => {
            const component = React.createRef<Integration>()
            render(<Integration {...oauthMinProps} ref={component} />)

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')

            if (toggle) {
                fireEvent.click(toggle)
            }

            fireEvent.change(
                screen.getByRole('textbox', { name: /token url/i }),
                {
                    target: { value: 'https://auth.example.com/token' },
                },
            )

            expect(component.current?.state.oauth2Config.token_url).toBe(
                'https://auth.example.com/token',
            )
        })

        it('should update oauth2Config state when Client ID is changed', () => {
            const component = React.createRef<Integration>()
            render(<Integration {...oauthMinProps} ref={component} />)

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')

            if (toggle) {
                fireEvent.click(toggle)
            }

            fireEvent.change(
                screen.getByRole('textbox', { name: /client id/i }),
                {
                    target: { value: 'my-client-id' },
                },
            )

            expect(component.current?.state.oauth2Config.client_id).toBe(
                'my-client-id',
            )
        })

        it('should update oauth2Config state when Client Secret is changed', () => {
            const component = React.createRef<Integration>()
            render(<Integration {...oauthMinProps} ref={component} />)

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')

            if (toggle) {
                fireEvent.click(toggle)
            }

            fireEvent.change(screen.getByLabelText(/client secret/i), {
                target: { value: 'super-secret' },
            })

            expect(component.current?.state.oauth2Config.client_secret).toBe(
                'super-secret',
            )
        })

        it('should update oauth2Config state when Token Location is changed', () => {
            const component = React.createRef<Integration>()
            render(<Integration {...oauthMinProps} ref={component} />)

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')

            if (toggle) {
                fireEvent.click(toggle)
            }

            fireEvent.click(screen.getByLabelText('Token Location'))
            const queryStringMatches = screen.getAllByText(
                OAuth2TokenLocation.QueryString,
            )
            fireEvent.click(
                queryStringMatches.find((el) => el.tagName === 'SPAN') ??
                    queryStringMatches[0],
            )

            expect(component.current?.state.oauth2Config.token_location).toBe(
                OAuth2TokenLocation.QueryString,
            )
        })

        it('should update oauth2Config state when Token Key is changed', () => {
            const component = React.createRef<Integration>()
            render(<Integration {...oauthMinProps} ref={component} />)

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')

            if (toggle) {
                fireEvent.click(toggle)
            }

            fireEvent.change(
                screen.getByRole('textbox', { name: /token key/i }),
                {
                    target: { value: 'access_token' },
                },
            )

            expect(component.current?.state.oauth2Config.token_key).toBe(
                'access_token',
            )
        })

        it('should update oauth2Config state when Scopes is changed', () => {
            const component = React.createRef<Integration>()
            render(<Integration {...oauthMinProps} ref={component} />)

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')

            if (toggle) {
                fireEvent.click(toggle)
            }

            fireEvent.change(screen.getByLabelText('Scopes'), {
                target: { value: 'read write' },
            })

            expect(component.current?.state.oauth2Config.scopes).toBe(
                'read write',
            )
        })

        it('should include oauth2 config in submission payload when enabled', () => {
            const mockUpdateOrCreate = jest.fn()
            render(
                <Integration
                    {...oauthMinProps}
                    updateOrCreateIntegration={mockUpdateOrCreate}
                />,
            )

            fireEvent.change(screen.getByLabelText('Integration name'), {
                target: { value: 'OAuth2 Integration' },
            })
            fireEvent.change(screen.getByLabelText('URL'), {
                target: { value: 'https://test.com/webhook' },
            })

            const checkbox = screen
                .getByText('Ticket created')
                .closest('label')
                ?.querySelector('input')
            if (checkbox) {
                fireEvent.click(checkbox)
            }

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')
            if (toggle) {
                fireEvent.click(toggle)
            }

            fireEvent.change(
                screen.getByRole('textbox', { name: /token url/i }),
                {
                    target: { value: 'https://auth.example.com/token' },
                },
            )
            fireEvent.change(
                screen.getByRole('textbox', { name: /client id/i }),
                {
                    target: { value: 'my-client-id' },
                },
            )
            fireEvent.change(screen.getByLabelText(/client secret/i), {
                target: { value: 'my-secret' },
            })
            fireEvent.change(
                screen.getByRole('textbox', { name: /token key/i }),
                {
                    target: { value: 'access_token' },
                },
            )

            fireEvent.click(screen.getByText('Add integration'))

            const call = mockUpdateOrCreate.mock.calls[0][0]
            const payload = call.toJS()

            expect(payload.http.oauth2).toEqual({
                token_url: 'https://auth.example.com/token',
                client_id: 'my-client-id',
                client_secret: 'my-secret',
                token_location: OAuth2TokenLocation.Header,
                token_key: 'access_token',
                scopes: '',
            })
        })

        it('should omit oauth2 from submission payload when toggle is disabled', () => {
            const mockUpdateOrCreate = jest.fn()
            render(
                <Integration
                    {...oauthMinProps}
                    updateOrCreateIntegration={mockUpdateOrCreate}
                />,
            )

            fireEvent.change(screen.getByLabelText('Integration name'), {
                target: { value: 'Test Integration' },
            })
            fireEvent.change(screen.getByLabelText('URL'), {
                target: { value: 'https://test.com/webhook' },
            })

            const checkbox = screen
                .getByText('Ticket message failed')
                .closest('label')
                ?.querySelector('input')
            if (checkbox) {
                fireEvent.click(checkbox)
            }

            fireEvent.click(screen.getByText('Add integration'))

            const call = mockUpdateOrCreate.mock.calls[0][0]
            const payload = call.toJS()

            expect(payload.http.oauth2).toBeUndefined()
        })

        it('should initialize OAuth2 state from existing integration with oauth2 config', () => {
            const integrationWithOAuth2 = {
                ...httpIntegration,
                http: {
                    ...baseHttp,
                    oauth2: {
                        token_url: 'https://auth.example.com/token',
                        client_id: 'existing-client-id',
                        client_secret: 'existing-secret',
                        token_location: OAuth2TokenLocation.QueryString,
                        token_key: 'access_token',
                        scopes: 'read write',
                    },
                },
            }

            render(
                <Integration
                    {...oauthMinProps}
                    integration={integrationWithOAuth2}
                    isUpdate={true}
                />,
            )

            expect(
                screen.getByRole('textbox', { name: /token url/i }),
            ).toHaveValue('https://auth.example.com/token')
            expect(
                screen.getByRole('textbox', { name: /client id/i }),
            ).toHaveValue('existing-client-id')
            expect(screen.getByLabelText('Token Location')).toHaveValue(
                OAuth2TokenLocation.QueryString,
            )
            expect(
                screen.getByRole('textbox', { name: /token key/i }),
            ).toHaveValue('access_token')
            expect(screen.getByLabelText('Scopes')).toHaveValue('read write')
        })

        it('should default Token Location to Header', () => {
            render(<Integration {...oauthMinProps} />)

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')

            if (toggle) {
                fireEvent.click(toggle)
            }

            expect(screen.getByLabelText('Token Location')).toHaveValue(
                OAuth2TokenLocation.Header,
            )
        })

        it('should render Header and QueryString Token Location options', () => {
            render(<Integration {...oauthMinProps} />)

            const toggle = screen
                .getByText('Enable authentication method: OAuth2')
                .closest('label')
                ?.querySelector('input')

            if (toggle) {
                fireEvent.click(toggle)
            }

            expect(
                screen.getByRole('option', {
                    name: OAuth2TokenLocation.Header,
                    hidden: true,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', {
                    name: OAuth2TokenLocation.QueryString,
                    hidden: true,
                }),
            ).toBeInTheDocument()
        })
    })
})
