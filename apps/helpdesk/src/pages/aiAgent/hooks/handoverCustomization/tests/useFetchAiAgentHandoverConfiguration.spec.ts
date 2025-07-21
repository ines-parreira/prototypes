import { useGetStoreHandoverConfigurations } from 'models/aiAgent/queries'
import {
    HandoverConfigurationData,
    HandoverConfigurationResponse,
} from 'models/aiAgent/types'
import { AiAgentChannel } from 'pages/aiAgent/constants'
import { renderHook } from 'utils/testing/renderHook'

import { getHandoverConfigurationsFixture } from '../../../fixtures/handoverConfiguration.fixture'
import {
    useFetchAiAgentStoreHandoverConfiguration,
    useFetchAiAgentStoreHandoverConfigurations,
} from '../useFetchAiAgentHandoverConfiguration'

jest.mock('models/aiAgent/queries')

const mockUseGetStoreHandoverConfigurations = (
    data: HandoverConfigurationData[] | undefined,
    isLoading: boolean = false,
) => {
    const returnData: HandoverConfigurationResponse | undefined =
        isLoading || data === undefined
            ? undefined
            : { handoverConfigurations: data }

    const mock = useGetStoreHandoverConfigurations as jest.Mock
    mock.mockReturnValue({
        isLoading: isLoading,
        data: returnData,
    })

    return mock
}

describe('useFetchAiAgentHandoverConfiguration', () => {
    const accountDomain = 'test-domain'
    const storeName = 'test-shop'

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return empty array if no handover configurations are found', () => {
        const mock = mockUseGetStoreHandoverConfigurations([], false)

        const { result } = renderHook(() =>
            useFetchAiAgentStoreHandoverConfigurations({
                accountDomain,
                storeName,
                enabled: true,
            }),
        )

        expect(mock).toHaveBeenCalledWith(
            {
                accountDomain,
                storeName,
                channel: undefined,
            },
            { enabled: true },
        )

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toEqual(false)
    })

    it('should return handover configurations if they are found', () => {
        const mockedData = getHandoverConfigurationsFixture()
        const mock = mockUseGetStoreHandoverConfigurations(
            mockedData.handoverConfigurations,
            false,
        )

        const { result } = renderHook(() =>
            useFetchAiAgentStoreHandoverConfigurations({
                accountDomain,
                storeName,
                enabled: true,
            }),
        )

        expect(mock).toHaveBeenCalledWith(
            {
                accountDomain,
                storeName,
                channel: undefined,
            },
            { enabled: true },
        )

        expect(result.current.data).toEqual(mockedData.handoverConfigurations)
        expect(result.current.isLoading).toEqual(false)
    })

    it('should return loading true and no data when handover configurations are loading', () => {
        const mockedData = getHandoverConfigurationsFixture()
        const mock = mockUseGetStoreHandoverConfigurations(
            mockedData.handoverConfigurations,
            true,
        )

        const { result } = renderHook(() =>
            useFetchAiAgentStoreHandoverConfigurations({
                accountDomain,
                storeName,
                enabled: true,
            }),
        )

        expect(mock).toHaveBeenCalledWith(
            {
                accountDomain,
                storeName,
                channel: undefined,
            },
            { enabled: true },
        )

        expect(result.current.data).toEqual(undefined)
        expect(result.current.isLoading).toEqual(true)
    })

    it('should return loading false and no data when handover configurations returns no data', () => {
        const mock = mockUseGetStoreHandoverConfigurations(undefined, false)

        const { result } = renderHook(() =>
            useFetchAiAgentStoreHandoverConfigurations({
                accountDomain,
                storeName,
                enabled: true,
            }),
        )

        expect(mock).toHaveBeenCalledWith(
            {
                accountDomain,
                storeName,
                channel: undefined,
            },
            { enabled: true },
        )

        expect(result.current.data).toEqual(undefined)
        expect(result.current.isLoading).toEqual(false)
    })

    test.each([[AiAgentChannel.Chat], [AiAgentChannel.Email]])(
        'should send the channel parameter %s to the fetch hook',
        (channel) => {
            const mockedData = getHandoverConfigurationsFixture()
            const mock = mockUseGetStoreHandoverConfigurations(
                mockedData.handoverConfigurations,
                false,
            )

            renderHook(() =>
                useFetchAiAgentStoreHandoverConfigurations({
                    accountDomain,
                    storeName,
                    channel,
                    enabled: true,
                }),
            )

            expect(mock).toHaveBeenCalledWith(
                {
                    accountDomain,
                    storeName,
                    channel,
                },
                { enabled: true },
            )
        },
    )

    describe('useFetchAiAgentStoreHandoverConfiguration', () => {
        it('should return the handover configuration for the given integrationId', () => {
            const mockedData = getHandoverConfigurationsFixture()
            const mock = mockUseGetStoreHandoverConfigurations(
                mockedData.handoverConfigurations,
                false,
            )

            const integrationId =
                mockedData.handoverConfigurations[0].integrationId

            const { result } = renderHook(() =>
                useFetchAiAgentStoreHandoverConfiguration({
                    accountDomain,
                    storeName,
                    integrationId,
                    enabled: true,
                }),
            )

            expect(mock).toHaveBeenCalledWith(
                {
                    accountDomain,
                    storeName,
                    channel: undefined,
                },
                { enabled: true },
            )

            expect(result.current.data).toEqual(
                mockedData.handoverConfigurations[0],
            )
            expect(result.current.isLoading).toEqual(false)
        })

        it('should return undefined if the handover configurations are empty list', () => {
            const mock = mockUseGetStoreHandoverConfigurations([], false)
            const integrationId = 123

            const { result } = renderHook(() =>
                useFetchAiAgentStoreHandoverConfiguration({
                    accountDomain,
                    storeName,
                    integrationId,
                    enabled: true,
                }),
            )

            expect(mock).toHaveBeenCalledWith(
                {
                    accountDomain,
                    storeName,
                    channel: undefined,
                },
                { enabled: true },
            )

            expect(result.current.data).toEqual(undefined)
            expect(result.current.isLoading).toEqual(false)
        })

        it('should return undefined if the handover configurations are not defined', () => {
            const mock = mockUseGetStoreHandoverConfigurations(undefined, false)
            const integrationId = 123

            const { result } = renderHook(() =>
                useFetchAiAgentStoreHandoverConfiguration({
                    accountDomain,
                    storeName,
                    integrationId,
                    enabled: true,
                }),
            )

            expect(mock).toHaveBeenCalledWith(
                {
                    accountDomain,
                    storeName,
                    channel: undefined,
                },
                { enabled: true },
            )

            expect(result.current.data).toEqual(undefined)
            expect(result.current.isLoading).toEqual(false)
        })
    })
})
