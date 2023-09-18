import {QueryClient, QueryKey} from '@tanstack/react-query'
import {isEqual as mockIsEqual} from 'lodash'
import {channels as mockChannels} from 'fixtures/channels'
import {channelsQueryKeys as mockChannelsQueryKeys} from 'models/channel/queries'

jest.mock('api/queryClient', () => {
    const original: {appQueryClient: QueryClient} =
        jest.requireActual('api/queryClient')
    return {
        ...original,
        appQueryClient: {
            getQueryData: (queryKey: QueryKey) => {
                if (mockIsEqual(queryKey, mockChannelsQueryKeys.list())) {
                    return {
                        data: mockChannels,
                    }
                }

                return original.appQueryClient.getQueryData(queryKey)
            },
        },
    }
})
