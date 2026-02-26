import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import type routerDom from 'react-router-dom'
import { MemoryRouter, useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { convertBundle } from 'fixtures/convertBundle'
import client from 'models/api/resources'
import { useListBundles } from 'models/convert/bundle/queries'
import { BundleInstallationMethodResponse } from 'models/convert/bundle/types'
import * as useIsManualInstallationMethodRequired from 'pages/convert/common/hooks/useIsManualInstallationMethodRequired'
import * as useThemeAppExtensionInstallation from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import ConvertBundleView from '../ConvertBundleView'

const mockedServer = new MockAdapter(client)

const queryClient = mockQueryClient()

const mockStore = configureMockStore()

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 123,
                type: 'gorgias_chat',
                meta: { shop_integration_id: 234 },
            },
            {
                id: 234,
                type: 'shopify',
                meta: {
                    oauth: { scope: ['write_script_tags', 'read_script_tags'] },
                },
            },
        ],
    }),
}

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

jest.mock('models/convert/bundle/queries')
const useListBundlesMock = assumeMock(useListBundles)

const useThemeAppExtensionInstallationSpy = jest.spyOn(
    useThemeAppExtensionInstallation,
    'default',
)

const useIsManualInstallationMethodRequiredSpy = jest.spyOn(
    useIsManualInstallationMethodRequired,
    'default',
)

describe('ConvertBundleView Component', () => {
    beforeEach(() => {
        queryClient.clear()
        mockedServer.reset()
        useIsManualInstallationMethodRequiredSpy.mockReturnValue(false)
    })

    describe('when the script tag is available', () => {
        beforeEach(() => {
            useThemeAppExtensionInstallationSpy.mockReturnValue({
                shouldUseThemeAppExtensionInstallation: false,
                themeAppExtensionInstallationUrl: null,
                themeAppExtensionEnabled: false,
            })
        })

        it('renders installation method selection when is installed', async () => {
            ;(useParams as jest.Mock).mockReturnValue({ id: '123' })
            useListBundlesMock.mockReturnValue({
                data: [convertBundle],
            } as any)

            mockedServer
                .onGet(`/api/revenue-addon-bundle/${convertBundle.id}/`)
                .reply(200, { code: 'some code' })

            render(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(defaultState)}>
                            <ConvertBundleView />
                        </Provider>
                    </QueryClientProvider>
                </MemoryRouter>,
            )

            await waitFor(() => {
                expect(screen.getByText('forum')).toBeInTheDocument()
                expect(
                    screen.getByText('1-click installation for Shopify'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Manual installation'),
                ).toBeInTheDocument()
                expect(screen.getByText('some code')).toBeInTheDocument()
            })
        })

        it.each([
            ['1-click install', 'Install', 'install'],
            ['Manual install', 'Install manually', 'manual-install'],
        ])(
            'renders installation method selection when not installed',
            async (option, button, action) => {
                ;(useParams as jest.Mock).mockReturnValue({ id: '123' })
                useListBundlesMock.mockReturnValue({
                    data: [],
                } as any)

                mockedServer
                    .onPost(`/api/revenue-addon-bundle/${action}/`)
                    .reply(200, {})

                render(
                    <MemoryRouter>
                        <QueryClientProvider client={queryClient}>
                            <Provider store={mockStore(defaultState)}>
                                <ConvertBundleView />
                            </Provider>
                        </QueryClientProvider>
                    </MemoryRouter>,
                )

                await waitFor(() => {
                    expect(
                        screen.getByText(
                            'Select installation method for the Campaign bundle',
                        ),
                    ).toBeInTheDocument()
                    expect(
                        screen.getByText('1-click install'),
                    ).toBeInTheDocument()
                    expect(
                        screen.getByText('Manual install'),
                    ).toBeInTheDocument()
                })

                fireEvent.click(screen.getByText(option))
                fireEvent.click(screen.getByText(button))

                await waitFor(() => {
                    expect(mockedServer.history.post.length).toBe(1)
                })
            },
        )
    })

    describe('when theme app extension is available', () => {
        beforeEach(() => {
            useThemeAppExtensionInstallationSpy.mockReturnValue({
                shouldUseThemeAppExtensionInstallation: true,
                themeAppExtensionInstallationUrl: 'test.com',
                themeAppExtensionEnabled: true,
            })
        })

        it('renders installation method selection when is installed', async () => {
            ;(useParams as jest.Mock).mockReturnValue({ id: '123' })
            useListBundlesMock.mockReturnValue({
                data: [
                    {
                        ...convertBundle,
                        method: BundleInstallationMethodResponse.ThemeApp,
                    },
                ],
            } as any)

            mockedServer
                .onGet(`/api/revenue-addon-bundle/${convertBundle.id}/`)
                .reply(200, { code: 'some code' })

            render(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(defaultState)}>
                            <ConvertBundleView />
                        </Provider>
                    </QueryClientProvider>
                </MemoryRouter>,
            )

            await waitFor(() => {
                expect(screen.getByText('forum')).toBeInTheDocument()
                expect(
                    screen.queryByText('1-click installation for Shopify'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Quick installation for Shopify'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Manual installation'),
                ).toBeInTheDocument()
                expect(screen.getByText('some code')).toBeInTheDocument()
            })
        })

        it('renders manual installation only when is not installed', async () => {
            useIsManualInstallationMethodRequiredSpy.mockReturnValue(true)
            ;(useParams as jest.Mock).mockReturnValue({ id: '123' })
            useListBundlesMock.mockReturnValue({
                data: [],
            } as any)

            mockedServer
                .onPost('/api/revenue-addon-bundle/manual-install/')
                .reply(200, {})

            render(
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore(defaultState)}>
                            <ConvertBundleView />
                        </Provider>
                    </QueryClientProvider>
                </MemoryRouter>,
            )

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Select installation method for the Campaign bundle',
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText('1-click install'),
                ).not.toBeInTheDocument()
                expect(screen.getByText('Manual install')).toBeInTheDocument()
            })

            fireEvent.click(screen.getByText('Manual install'))
            fireEvent.click(screen.getByText('Install manually'))

            await waitFor(() => {
                expect(mockedServer.history.post.length).toBe(1)
            })
        })
    })
})
