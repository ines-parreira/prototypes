import { FeatureFlagKey, fetchFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'

export async function initGaia() {
    const { flag: isFlagEnabled } = await fetchFlag(
        FeatureFlagKey.GaiaEmbed,
        false,
    )
    const isEnabled = isFlagEnabled || !!window.USER_IMPERSONATED

    if (!isEnabled) return

    const script = document.createElement('script')
    script.src = 'https://gaia.gorgias-decision-engine.com/embed.js'
    script.async = true
    document.head.appendChild(script)

    logEvent(SegmentEvent.GaiaEmbedLoaded)
}
