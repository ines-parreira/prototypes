import { act, waitFor } from '@testing-library/react'

import * as segment from 'common/segment'
import { useUpdateChannelConnection } from 'models/convert/channelConnection/queries'
import { ChannelConnection } from 'models/convert/channelConnection/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useUtm } from '../useUtm'

jest.mock('models/convert/channelConnection/queries')

const useUpdateChannelConnectionMock = assumeMock(useUpdateChannelConnection)

describe('useUtm', () => {
    const baseChannelConnection = {
        id: '123',
        utm_query_string: '?foo=bar',
        utm_enabled: true,
    }
    const initialProps = {
        channelConnection: null,
        campaignName: 'Untitled Campaign',
    }

    it('should return the values based on the input at startup', () => {
        const hook = renderHook(() =>
            useUtm({
                ...(baseChannelConnection as ChannelConnection),
                utm_enabled: false,
            }),
        )
        const { utmQueryString, utmEnabled } = hook.result.current
        expect(utmQueryString).toBe(baseChannelConnection.utm_query_string)
        expect(utmEnabled).toBe(false)
    })

    it('should return the updated values when the callbacks are called', () => {
        const hook = renderHook(() =>
            useUtm(baseChannelConnection as ChannelConnection),
        )
        const { onUtmQueryStringChange, onUtmEnabledChange } =
            hook.result.current
        act(() => onUtmQueryStringChange('?hello=world'))
        act(() => onUtmEnabledChange(false))
        const { utmQueryString, utmEnabled } = hook.result.current
        expect(utmQueryString).toBe('?hello=world')
        expect(utmEnabled).toBe(false)
    })

    it('should make the call with the updated values on reset', async () => {
        const mockOutboundCall = jest.fn()
        const campaignName = 'awesome-campaign'
        useUpdateChannelConnectionMock.mockReturnValue({
            mutateAsync: mockOutboundCall,
            isLoading: false,
        } as any)
        const hook = renderHook(() =>
            useUtm(
                {
                    ...(baseChannelConnection as ChannelConnection),
                },
                campaignName,
            ),
        )
        const { onUtmQueryStringChange } = hook.result.current
        act(() => onUtmQueryStringChange('?hello=world'))
        await hook.result.current.onUtmReset()
        await waitFor(() => {
            expect(hook.result.current.utmQueryString).toBe(
                `?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=${campaignName}`,
            )
        })
    })

    it('should make the call with the updated values at the moment of the submission', async () => {
        const mockOutboundCall = jest.fn()
        useUpdateChannelConnectionMock.mockReturnValue({
            mutateAsync: mockOutboundCall,
            isLoading: false,
        } as any)
        const hook = renderHook(() =>
            useUtm({
                ...(baseChannelConnection as ChannelConnection),
            }),
        )
        const { onUtmQueryStringChange, onUtmEnabledChange } =
            hook.result.current
        act(() => onUtmQueryStringChange('?hello=world'))
        act(() => onUtmEnabledChange(false))
        await hook.result.current.onUtmApply(true)
        expect(mockOutboundCall).toBeCalledWith([
            undefined,
            { channel_connection_id: baseChannelConnection.id },
            {
                utm_enabled: false,
                utm_query_string: '?hello=world',
            },
        ])
    })

    it('should use the default values if the connection is null', () => {
        const mockOutboundCall = jest.fn()
        useUpdateChannelConnectionMock.mockReturnValue({
            mutateAsync: mockOutboundCall,
            isLoading: false,
        } as any)
        const hook = renderHook(() => useUtm(null, 'awesome-campaign'))
        expect(hook.result.current.utmEnabled).toBe(true)
        expect(hook.result.current.utmQueryString).toBe(
            '?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=awesome-campaign',
        )
    })

    it('should render the correct default once campaignName is reloaded', () => {
        const mockOutboundCall = jest.fn()
        const mockCampaignName = 'Awesome Campaign Reloaded'
        useUpdateChannelConnectionMock.mockReturnValue({
            mutateAsync: mockOutboundCall,
            isLoading: false,
        } as any)
        const hook = renderHook(
            ({ channelConnection, campaignName }) =>
                useUtm(channelConnection, campaignName),
            { initialProps },
        )
        hook.rerender({
            channelConnection: null,
            campaignName: mockCampaignName,
        })
        expect(hook.result.current.utmQueryString).toBe(
            `?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=${mockCampaignName}`,
        )
    })

    it('calls server with empty query string when default query string is provided', async () => {
        const campaignName = 'Awesome Campaign'
        const mockOutboundCall = jest.fn()
        useUpdateChannelConnectionMock.mockReturnValue({
            mutateAsync: mockOutboundCall,
            isLoading: false,
        } as any)
        const hook = renderHook(() =>
            useUtm(
                {
                    ...(baseChannelConnection as ChannelConnection),
                    utm_query_string: '',
                },
                campaignName,
            ),
        )
        const { utmQueryString } = hook.result.current
        expect(utmQueryString).toBe(
            `?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=${campaignName}`,
        )
        await hook.result.current.onUtmApply(true)
        expect(mockOutboundCall).toBeCalledWith([
            undefined,
            { channel_connection_id: baseChannelConnection.id },
            {
                utm_enabled: true,
                utm_query_string: '',
            },
        ])
    })

    it('campaign name is initialized as empty if the campaign name is untitled', () => {
        const campaignName = 'untitled campaign'
        const mockOutboundCall = jest.fn()
        useUpdateChannelConnectionMock.mockReturnValue({
            mutateAsync: mockOutboundCall,
            isLoading: false,
        } as any)
        const hook = renderHook(() =>
            useUtm(
                {
                    ...(baseChannelConnection as ChannelConnection),
                    utm_query_string: '',
                },
                campaignName,
            ),
        )
        const { utmQueryString } = hook.result.current
        expect(utmQueryString).toBe('')
    })

    it('should not call the api if save is set as false on submit', async () => {
        const mockOutboundCall = jest.fn()
        useUpdateChannelConnectionMock.mockReturnValue({
            mutateAsync: mockOutboundCall,
            isLoading: false,
        } as any)
        const hook = renderHook(() =>
            useUtm({
                ...(baseChannelConnection as ChannelConnection),
            }),
        )
        const { onUtmQueryStringChange, onUtmEnabledChange } =
            hook.result.current
        act(() => onUtmQueryStringChange('?hello=world'))
        act(() => onUtmEnabledChange(false))
        await hook.result.current.onUtmApply(false)
        expect(mockOutboundCall).not.toBeCalled()
    })

    it('should call event when utm is applied', async () => {
        const saved = false
        const enabled = true
        const value = '?foo=bar'
        const mockLogEvent = jest.spyOn(segment, 'logEvent')
        useUpdateChannelConnectionMock.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as any)
        const hook = renderHook(() =>
            useUtm({
                ...(baseChannelConnection as ChannelConnection),
            }),
        )
        const { onUtmEnabledChange, onUtmQueryStringChange } =
            hook.result.current
        act(() => onUtmEnabledChange(enabled))
        act(() => onUtmQueryStringChange(value))
        await hook.result.current.onUtmApply(saved)
        expect(mockLogEvent).toBeCalledWith(
            segment.SegmentEvent.ConvertUtmApplied,
            {
                saved,
                enabled,
                value,
            },
        )
    })
})
