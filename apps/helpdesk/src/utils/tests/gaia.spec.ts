import { FeatureFlagKey, fetchFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'

import { initGaia } from '../gaia'

jest.mock('@repo/feature-flags')
jest.mock('@repo/logging')

const fetchFlagMock = assumeMock(fetchFlag)
const logEventMock = assumeMock(logEvent)

const GAIA_SCRIPT_SELECTOR =
    'script[src="https://gaia.gorgias-decision-engine.com/embed.js"]'

describe('initGaia()', () => {
    afterEach(() => {
        jest.clearAllMocks()
        document.head
            .querySelectorAll(GAIA_SCRIPT_SELECTOR)
            .forEach((el) => el.remove())
    })

    it('appends the embed script and logs the segment event when the flag is true', async () => {
        fetchFlagMock.mockResolvedValueOnce({ flag: true, error: null })

        await initGaia()

        expect(fetchFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.GaiaEmbed,
            false,
        )

        const script =
            document.head.querySelector<HTMLScriptElement>(GAIA_SCRIPT_SELECTOR)
        expect(script).not.toBeNull()
        expect(script?.async).toBe(true)

        expect(logEventMock).toHaveBeenCalledTimes(1)
        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.GaiaEmbedLoaded)
    })

    it('does nothing when the flag is false', async () => {
        fetchFlagMock.mockResolvedValueOnce({ flag: false, error: null })

        await initGaia()

        expect(document.head.querySelector(GAIA_SCRIPT_SELECTOR)).toBeNull()
        expect(logEventMock).not.toHaveBeenCalled()
    })

    it('does nothing when fetchFlag fails (fail-closed)', async () => {
        fetchFlagMock.mockResolvedValueOnce({
            flag: false,
            error: new Error('SDK init failed'),
        })

        await initGaia()

        expect(document.head.querySelector(GAIA_SCRIPT_SELECTOR)).toBeNull()
        expect(logEventMock).not.toHaveBeenCalled()
    })
})
