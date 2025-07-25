import React from 'react'

import { screen } from '@testing-library/react'

import { Components } from 'rest_api/workflows_api/client.generated'
import { renderWithRouter } from 'utils/testing'

import HttpRequestLogsView from '../HttpRequestLogsView'

describe('<HttpRequestLogsView />', () => {
    const mockLogEntry: Components.Schemas.HttpRequestEventsResponseDto[0] = {
        id: '1',
        request_url: 'https://api.example.com/users',
        request_method: 'POST',
        request_body: '{"name": "John Doe", "email": "john@example.com"}',
        request_headers:
            '{"Content-Type": "application/json", "Authorization": "Bearer token123"}',
        request_datetime: '2024-01-15T10:30:00Z',
        response_status_code: 201,
        response_headers:
            '{"Content-Type": "application/json", "X-Rate-Limit": "100"}',
        response_body: '{"id": 123, "name": "John Doe", "created": true}',
        configuration_internal_id: 'config-1',
        step_id: 'step-1',
        execution_id: 'exec-1',
    }

    it('should render component with empty logs', () => {
        renderWithRouter(<HttpRequestLogsView logs={[]} />)

        // Should render without errors when no logs provided
        expect(document.body).toBeInTheDocument()
    })

    it('should render request information correctly', () => {
        renderWithRouter(<HttpRequestLogsView logs={[mockLogEntry]} />)

        expect(screen.getByText('Request')).toBeInTheDocument()
        expect(screen.getByText('Method:')).toBeInTheDocument()
        expect(screen.getByText('POST')).toBeInTheDocument()
        expect(screen.getByText('URL:')).toBeInTheDocument()
        expect(
            screen.getByText('https://api.example.com/users'),
        ).toBeInTheDocument()
    })

    it('should render response information correctly', () => {
        renderWithRouter(<HttpRequestLogsView logs={[mockLogEntry]} />)

        expect(screen.getByText('Response')).toBeInTheDocument()
        expect(screen.getByText('Status Code:')).toBeInTheDocument()
        expect(screen.getByText('201')).toBeInTheDocument()
    })

    it('should render response headers correctly', () => {
        renderWithRouter(<HttpRequestLogsView logs={[mockLogEntry]} />)

        expect(screen.getByText('X-Rate-Limit:')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render request and response body correctly', () => {
        renderWithRouter(<HttpRequestLogsView logs={[mockLogEntry]} />)

        expect(screen.getAllByText('Body')).toHaveLength(2) // Request and response body
        expect(
            screen.getByText(
                '{"name": "John Doe", "email": "john@example.com"}',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                '{"id": 123, "name": "John Doe", "created": true}',
            ),
        ).toBeInTheDocument()
    })

    it('should handle null/undefined values gracefully', () => {
        const logWithNulls: Components.Schemas.HttpRequestEventsResponseDto[0] =
            {
                id: '2',
                request_url: 'https://api.example.com/test',
                request_method: 'GET',
                request_body: null,
                request_headers: null,
                request_datetime: '2024-01-15T10:30:00Z',
                response_status_code: 200,
                response_headers: null,
                response_body: null,
                configuration_internal_id: null,
                step_id: null,
                execution_id: null,
            }

        renderWithRouter(<HttpRequestLogsView logs={[logWithNulls]} />)

        expect(screen.getByText('GET')).toBeInTheDocument()
        expect(
            screen.getByText('https://api.example.com/test'),
        ).toBeInTheDocument()
        expect(screen.getByText('200')).toBeInTheDocument()
        // Should not crash and should render empty bodies/headers
        expect(screen.getAllByText('Body')).toHaveLength(2)
        expect(screen.getAllByText('Headers')).toHaveLength(2)
    })

    it('should render multiple log entries', () => {
        const secondLogEntry: Components.Schemas.HttpRequestEventsResponseDto[0] =
            {
                id: '2',
                request_url: 'https://api.example.com/products',
                request_method: 'GET',
                request_body: null,
                request_headers: '{"Accept": "application/json"}',
                request_datetime: '2024-01-15T11:00:00Z',
                response_status_code: 200,
                response_headers: '{"Content-Type": "application/json"}',
                response_body: '{"products": []}',
                configuration_internal_id: 'config-2',
                step_id: 'step-2',
                execution_id: 'exec-2',
            }

        renderWithRouter(
            <HttpRequestLogsView logs={[mockLogEntry, secondLogEntry]} />,
        )

        expect(screen.getAllByText('Request')).toHaveLength(2)
        expect(screen.getAllByText('Response')).toHaveLength(2)
        expect(screen.getByText('POST')).toBeInTheDocument()
        expect(screen.getByText('GET')).toBeInTheDocument()
        expect(
            screen.getByText('https://api.example.com/users'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('https://api.example.com/products'),
        ).toBeInTheDocument()
    })

    it('should handle object values in headers', () => {
        const logWithObjectHeaders: Components.Schemas.HttpRequestEventsResponseDto[0] =
            {
                ...mockLogEntry,
                request_headers:
                    '{"Custom-Header": {"nested": "value", "count": 42}}',
            }

        renderWithRouter(<HttpRequestLogsView logs={[logWithObjectHeaders]} />)

        expect(screen.getByText('Custom-Header:')).toBeInTheDocument()
        expect(
            screen.getByText('{"nested":"value","count":42}'),
        ).toBeInTheDocument()
    })

    it('should render empty bodies as empty content', () => {
        const logWithEmptyBodies: Components.Schemas.HttpRequestEventsResponseDto[0] =
            {
                ...mockLogEntry,
                request_body: '',
                response_body: '',
            }

        renderWithRouter(<HttpRequestLogsView logs={[logWithEmptyBodies]} />)

        expect(screen.getAllByText('Body')).toHaveLength(2)
        // Should render empty pre elements for body content
        const preElements = document.querySelectorAll('pre')
        expect(preElements).toHaveLength(2)
        preElements.forEach((pre) => {
            expect(pre.textContent).toBe('')
        })
    })
})
