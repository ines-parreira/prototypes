import { renderHook } from '@repo/testing'

import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { usePreselectedChat } from '../usePreselectedChat'

describe('usePreselectedChat', () => {
    const renderUsePreselectedChat = ({
        onboardingChatIntegrationIds,
        chatChannels,
    }: {
        onboardingChatIntegrationIds: number[] | undefined
        chatChannels: SelfServiceChatChannel[]
    }) =>
        renderHook(() =>
            usePreselectedChat({
                onboardingChatIntegrationIds,
                chatChannels,
            }),
        )

    it('should return onboarding integration that are available chat channels', () => {
        const { result } = renderUsePreselectedChat({
            onboardingChatIntegrationIds: [1, 2],
            chatChannels: [
                {
                    ...mockChatChannels[0],
                    value: {
                        ...mockChatChannels[0].value,
                        id: 1,
                    },
                },
            ],
        })

        expect(result.current).toEqual([1])
    })

    it('should return onboarding integration when there are existing data (some chats selected)', () => {
        const { result } = renderUsePreselectedChat({
            onboardingChatIntegrationIds: [1, 2],
            chatChannels: [
                {
                    ...mockChatChannels[0],
                    value: {
                        ...mockChatChannels[0].value,
                        id: 1,
                    },
                },
                {
                    ...mockChatChannels[1],
                    value: {
                        ...mockChatChannels[1].value,
                        id: 2,
                    },
                },
            ],
        })

        expect(result.current).toEqual([1, 2])
    })

    it('should return onboarding integration when there are existing data (no chat selected)', () => {
        const { result } = renderUsePreselectedChat({
            onboardingChatIntegrationIds: [],
            chatChannels: [...mockChatChannels],
        })

        expect(result.current).toEqual([])
    })

    it('should return an empty list when no onboarding integration data and multiple available chat channels', () => {
        const { result } = renderUsePreselectedChat({
            onboardingChatIntegrationIds: undefined,
            chatChannels: [...mockChatChannels],
        })

        expect(result.current).toEqual([])
    })

    it('should return an empty list when no onboarding integration data and a disabled single available chat channels', () => {
        const { result } = renderUsePreselectedChat({
            onboardingChatIntegrationIds: undefined,
            chatChannels: [
                {
                    ...mockChatChannels[0],
                    value: {
                        ...mockChatChannels[0].value,
                        isDisabled: true,
                    },
                },
            ],
        })

        expect(result.current).toEqual([])
    })

    it('should return a list with the chat integration id when no onboarding integration data and an enabled single available chat channel', () => {
        const { result } = renderUsePreselectedChat({
            onboardingChatIntegrationIds: undefined,
            chatChannels: [
                {
                    ...mockChatChannels[0],
                    value: {
                        ...mockChatChannels[0].value,
                        isDisabled: false,
                    },
                },
            ],
        })

        expect(result.current).toEqual([15])
    })
})
