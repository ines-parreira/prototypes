import { AxiosHeaders } from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { toast } from '@gorgias/axiom'

import {
    default as client,
    createClient,
    handleNewRelease,
    initializeNewReleaseHandler,
    timeoutTime,
} from '../client'

const { isCallActiveMock } = vi.hoisted(() => ({
    isCallActiveMock: vi.fn(() => false),
}))

vi.mock('@repo/utils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@repo/utils')>()

    return {
        ...actual,
        isCallActive: isCallActiveMock,
    }
})

vi.mock('@gorgias/axiom', () => ({
    toast: {
        warning: vi.fn(),
        dismiss: vi.fn(),
    },
}))

describe('client resources', () => {
    const mockedServer = new MockAdapter(client)

    beforeEach(() => {
        mockedServer.reset()
        isCallActiveMock.mockReturnValue(false)
        vi.restoreAllMocks()
        vi.clearAllMocks()
        window.GORGIAS_RELEASE = '1'
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('creates a client with the expected default headers', () => {
        expect(createClient().defaults.headers).toMatchObject({
            'X-CSRF-Token': 'abcd',
            'X-Gorgias-User-Client': 'web',
        })
    })

    it('resolves requests with data', async () => {
        mockedServer.onGet('/api').reply(
            200,
            {
                data: {
                    foo_bar: 1,
                },
            },
            { 'x-gorgias-release': '1' },
        )

        await expect(client.get('/api')).resolves.toMatchObject({
            data: {
                data: {
                    foo_bar: 1,
                },
            },
        })
    })

    it('registers the release interceptor on the shared client', () => {
        const useSpy = vi.spyOn(client.interceptors.response, 'use')

        initializeNewReleaseHandler()

        expect(useSpy).toHaveBeenCalledTimes(1)
    })

    it('shows a warning toast and reloads on a new release', () => {
        vi.useFakeTimers()

        const response = {
            headers: new AxiosHeaders({
                'x-gorgias-release': '2',
            }),
        } as any

        handleNewRelease()(response)
        vi.advanceTimersByTime(timeoutTime)

        expect(toast.warning).toHaveBeenCalledWith(
            'An update is available for Gorgias. The app will reload automatically.',
            expect.objectContaining({
                duration: 60000,
                id: 'new-release-notification',
            }),
        )

        vi.advanceTimersByTime(60000)

        expect(toast.dismiss).toHaveBeenCalledWith('new-release-notification')
        expect(window.location.reload).toHaveBeenCalledTimes(1)
    })

    it('does not schedule a reload while a call is active', () => {
        vi.useFakeTimers()

        isCallActiveMock.mockReturnValue(true)

        handleNewRelease()({
            headers: new AxiosHeaders({
                'x-gorgias-release': '2',
            }),
        } as any)

        vi.runAllTimers()

        expect(toast.warning).not.toHaveBeenCalled()
    })
})
