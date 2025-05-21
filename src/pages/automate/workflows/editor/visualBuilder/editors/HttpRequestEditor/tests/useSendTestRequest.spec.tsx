import { act } from '@testing-library/react'

import { HttpRequestNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { renderHook } from 'utils/testing/renderHook'

import useSendTestRequest from '../useSendTestRequest'

describe('useSendTestRequest', () => {
    const mockConfig: Pick<
        HttpRequestNodeType['data'],
        | 'url'
        | 'method'
        | 'headers'
        | 'json'
        | 'formUrlencoded'
        | 'bodyContentType'
    > = {
        url: 'https://api.example.com/test',
        method: 'POST',
        headers: [
            { name: 'Authorization', value: 'Bearer {{access_token}}' },
            { name: 'Custom-Header', value: 'custom-value' },
        ],
        json: '{"key": "{{value}}"}',
        formUrlencoded: [{ key: 'formKey', value: '{{formValue}}' }],
        bodyContentType: 'application/json',
    }

    const mockOnResponse = jest.fn()
    let fetchMock: jest.Mock
    beforeEach(() => {
        // Reset the fetch mock before each test
        fetchMock = jest.fn()
        global.fetch = fetchMock as typeof fetch
    })
    it('should handle a successful request without OAuth2 token', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => ({ success: true }),
            text: () => JSON.stringify({ success: true }),
        })

        const { result } = renderHook(() =>
            useSendTestRequest(mockConfig, mockOnResponse),
        )

        const variables = {
            access_token: 'mockAccessToken',
            value: 'mockValue',
        }

        await act(async () => {
            await result.current.sendTestRequest(variables)
        })

        expect(global.fetch).toHaveBeenCalledWith(
            'https://cors-proxy.gorgias.workers.dev/https://api.example.com/test',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: 'Bearer mockAccessToken',
                    'custom-header': 'custom-value',
                    'x-gorgias-cors-proxy-key':
                        '8e6f1be6-hvcl-6975-iuhu-f45d4c8e8b86',
                },
                body: '{"key": "mockValue"}',
            }),
        )

        expect(mockOnResponse).toHaveBeenCalledWith({
            status: 200,
        })
    })

    it('should handle a failed request', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Request failed'))

        const { result } = renderHook(() =>
            useSendTestRequest(mockConfig, mockOnResponse),
        )

        await act(async () => {
            await result.current.sendTestRequest()
        })

        expect(mockOnResponse).toHaveBeenCalledWith({
            status: 500,
        })
    })

    it('should handle request with OAuth2 token (refresh token provided)', async () => {
        const refreshTokenUrl = 'https://api.example.com/refresh'
        const refreshToken = 'mockRefreshToken'

        // Mocking the access token request
        fetchMock
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => ({ access_token: 'mockAccessToken' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => ({ success: true }),
                text: () => JSON.stringify({ success: true }),
            })

        const { result } = renderHook(() =>
            useSendTestRequest(mockConfig, mockOnResponse),
        )

        const variables = {
            value: 'mockValue',
        }

        await act(async () => {
            await result.current.sendTestRequest(
                variables,
                refreshToken,
                refreshTokenUrl,
            )
        })

        // Verify that refresh token URL was called to obtain access token
        expect(global.fetch).toHaveBeenNthCalledWith(
            1,
            `https://cors-proxy.gorgias.workers.dev/${refreshTokenUrl}`,
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-gorgias-cors-proxy-key':
                        '8e6f1be6-hvcl-6975-iuhu-f45d4c8e8b86',
                },
                body: JSON.stringify({
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
                }),
            }),
        )

        // Verify that the main request was called with the correct Authorization header
        expect(global.fetch).toHaveBeenNthCalledWith(
            2,
            'https://cors-proxy.gorgias.workers.dev/https://api.example.com/test',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: 'Bearer mockAccessToken',
                    'custom-header': 'custom-value',
                    'x-gorgias-cors-proxy-key':
                        '8e6f1be6-hvcl-6975-iuhu-f45d4c8e8b86',
                },
                body: '{"key": "mockValue"}',
            }),
        )

        expect(mockOnResponse).toHaveBeenCalledWith({
            status: 200,
        })
    })

    it('should handle error when failing to obtain access token', async () => {
        const refreshTokenUrl = 'https://api.example.com/refresh'
        const refreshToken = 'invalidRefreshToken'

        // Mocking the failed access token request
        fetchMock.mockRejectedValueOnce(
            new Error('Failed to fetch access token'),
        )

        const { result } = renderHook(() =>
            useSendTestRequest(mockConfig, mockOnResponse),
        )

        await act(async () => {
            await result.current.sendTestRequest(
                {},
                refreshToken,
                refreshTokenUrl,
            )
        })

        // Verify that onResponse is called with a 500 status due to token fetch failure
        expect(mockOnResponse).toHaveBeenCalledWith({
            status: 500,
        })
    })
})
