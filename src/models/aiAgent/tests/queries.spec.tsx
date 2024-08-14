import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {HelpCenterClient} from 'rest_api/help_center_api/client'
import {getAIGuidanceFixture} from 'pages/automate/aiAgent/fixtures/aiGuidance.fixture'
import {useGetAIGeneratedGuidances} from '../queries'
import * as guidanceResources from '../resources/guidances'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

const mockUseHelpCenterApi = jest.mocked(useHelpCenterApi)

const getAIGeneratedGuidances = jest.spyOn(
    guidanceResources,
    'getAIGeneratedGuidances'
)

const queryClient = mockQueryClient()
const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const helpCenterId = 1
const storeIntegrationId = 1

const mockedAIGuidances = [getAIGuidanceFixture('1'), getAIGuidanceFixture('2')]

describe('queries', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('useGetAIGeneratedGuidances', () => {
        it('should return correct params from API', async () => {
            getAIGeneratedGuidances.mockReturnValue(
                Promise.resolve(mockedAIGuidances)
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const {result, waitFor} = renderHook(
                () =>
                    useGetAIGeneratedGuidances(
                        helpCenterId,
                        storeIntegrationId
                    ),
                {
                    wrapper,
                }
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(mockedAIGuidances)
        })

        it('should not call the api function when enabled false', () => {
            getAIGeneratedGuidances.mockReturnValue(Promise.resolve([]))
            renderHook(
                () =>
                    useGetAIGeneratedGuidances(
                        helpCenterId,
                        storeIntegrationId,
                        {enabled: false}
                    ),
                {
                    wrapper,
                }
            )

            expect(getAIGeneratedGuidances).toHaveBeenCalledTimes(0)
        })

        it('should not call the api function when client is not set', () => {
            getAIGeneratedGuidances.mockReturnValue(Promise.resolve([]))
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            renderHook(
                () =>
                    useGetAIGeneratedGuidances(
                        helpCenterId,
                        storeIntegrationId
                    ),
                {
                    wrapper,
                }
            )

            expect(getAIGeneratedGuidances).toHaveBeenCalledTimes(0)
        })
    })
})
