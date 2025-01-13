import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import {baseHttp, httpIntegration} from 'fixtures/integrations'
import {ContentType, HttpMethod} from 'models/api/types'
import {HTTPForm, IntegrationType} from 'models/integration/types'

import {
    INTEGRATION_REMOVAL_CONFIGURATION_TEXT,
    INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT,
} from 'pages/integrations/integration/constants'

import {Integration} from '../Integration'

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
            />
        )

        expect(screen.getByLabelText('Integration name')).toHaveValue(
            'Test Integration'
        )
    })

    it('should handle form submission with correct data', () => {
        const mockUpdateOrCreate = jest.fn()
        render(
            <Integration
                {...minProps}
                updateOrCreateIntegration={mockUpdateOrCreate}
            />
        )

        fireEvent.change(screen.getByLabelText('Integration name'), {
            target: {value: 'Test Integration'},
        })
        fireEvent.change(screen.getByLabelText('URL'), {
            target: {value: 'https://test.com/webhook'},
        })

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
                    'ticket-created': true,
                    'ticket-updated': true,
                    'ticket-self-unsnoozed': true,
                    'ticket-message-created': true,
                    'ticket-message-failed': true,
                },
                form: '',
            },
        })

        expect(mockUpdateOrCreate).toHaveBeenCalledWith(expectedData)
    })

    it('should validate header names correctly', () => {
        render(<Integration {...minProps} />)

        const addHeaderButton = screen.getByText(/Add header/)
        fireEvent.click(addHeaderButton)

        const headerInput = screen.getByPlaceholderText('Key')
        fireEvent.change(headerInput, {target: {value: 'Invalid Header!'}})

        expect(
            screen.getByText('Header name contains invalid characters')
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
            expect(setStateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketMessageCreated: false,
                })
            )
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
            expect(setStateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketMessageFailed: false,
                })
            )
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
            expect(setStateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketSelfUnsnoozed: false,
                })
            )
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
            expect(setStateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketUpdated: false,
                })
            )
        }
    })

    it('should handle state change for ticketCreated', () => {
        const component = React.createRef<Integration>()
        render(<Integration {...minProps} ref={component} />)

        const setStateSpy = jest.spyOn(component.current!, 'setState')

        const checkbox = screen
            .getByText('Ticket created')
            .closest('label')
            ?.querySelector('input')

        if (checkbox) {
            fireEvent.click(checkbox)
            expect(setStateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketCreated: false,
                })
            )
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
            />
        )

        const contentTypeSelect = screen.getByLabelText('Request content type')
        fireEvent.change(contentTypeSelect, {target: {value: ContentType.Json}})

        expect(screen.getByLabelText('Request content type')).toHaveValue(
            ContentType.Json
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
                />
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
                />
            )

            fireEvent.click(screen.getByText('Delete HTTP integration'))
            expect(
                screen.getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
            ).toBeInTheDocument()
        })
    })

    describe('Method and Content Type interactions', () => {
        it('should set default form when switching from GET to another method', () => {
            render(<Integration {...minProps} />)

            const methodSelect = screen.getByLabelText('HTTP Method')
            fireEvent.change(methodSelect, {target: {value: HttpMethod.Post}})

            // Request content type should appear
            expect(
                screen.getByLabelText('Request content type')
            ).toBeInTheDocument()
        })

        it('should not show request content type for GET method', () => {
            render(<Integration {...minProps} />)

            const methodSelect = screen.getByLabelText('HTTP Method')
            fireEvent.change(methodSelect, {target: {value: HttpMethod.Get}})

            expect(
                screen.queryByLabelText('Request content type')
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
                />
            )

            const loaderIcon = document.querySelector(
                '.icon-circle-o-notch.md-spin'
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
                    loading={{updateIntegration: 1}}
                    integration={mockIntegration}
                />
            )

            const submitButton = screen.getByRole('button', {
                name: /Loading.*Add integration/i,
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'true')
            expect(submitButton).toHaveClass('isDisabled')
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
                />
            )

            const reactivateButton = screen.getByText(
                'Re-activate HTTP integration'
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
            fireEvent.change(urlInput, {target: {value: 'invalid-url'}})

            expect(urlInput).toBeInvalid()
        })
    })

    describe('Analytics saved filters', () => {
        it('should not show saved filters warning when feature flag is disabled', () => {
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
                    flags={{AnalyticsSavedFilters: false}}
                />
            )

            // Open confirmation dialog
            const deleteButton = screen.getByRole('button', {
                name: /Delete HTTP integration/i,
            })
            fireEvent.click(deleteButton)

            // Verify only base message appears in confirmation tooltip
            const confirmTooltip = screen.getByRole('tooltip')
            expect(confirmTooltip).toHaveTextContent(
                INTEGRATION_REMOVAL_CONFIGURATION_TEXT
            )
            expect(confirmTooltip).not.toHaveTextContent(
                INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT
            )
        })
    })
})
