import { useEffect, useRef } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useSidebar } from '@repo/navigation'

import { Box, ShortcutKey } from '@gorgias/axiom'
import { useCopilot, useCopilotPanel, useRunLifecycle } from '@gorgias/copilot'

import { useCopilotEnabled } from 'hooks/useCopilotEnabled'

import css from './AskGaiaButton.less'

// Orbiting light on the AskGaia button's border.
export const AskGaiaButton = () => {
    const isCopilotEnabled = useCopilotEnabled()
    const { isCollapsed } = useSidebar()
    const { isOpen: isCopilotOpen, setIsOpen: setCopilotOpen } =
        useCopilotPanel()
    const { threadId } = useCopilot()
    const { isRunning } = useRunLifecycle({}, threadId)

    const glowShapeClass = isCollapsed ? css.glowShapeCircle : css.glowShapePill

    // Drive the spinner via Web Animations API. CSS @keyframes inside
    // :local {} blocks of CSS Modules can silently fail to scope
    // animation-name references in lockstep with the keyframe
    // definition, which results in a non-running animation with no
    // visible error. WAAPI takes raw keyframe values and animates the
    // element directly — no identifier matching, no scoping, no
    // pipeline surprises.
    const spinnerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // The glow only orbits while the agent is actively working.
        if (!isRunning) return

        const el = spinnerRef.current
        if (!el) return

        // Respect prefers-reduced-motion. Doesn't need to react to
        // runtime changes — this is purely decorative.
        if (
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return
        }

        const animation = el.animate(
            [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
            {
                duration: Duration.seconds(3),
                iterations: Infinity,
                easing: 'linear',
            },
        )

        return () => animation.cancel()
    }, [isRunning])

    if (!isCopilotEnabled) return null

    const handleClick = () => setCopilotOpen(!isCopilotOpen)

    return (
        <div
            className={`${css.wrapper} ${
                isCollapsed ? css.wrapperCollapsed : css.wrapperExpanded
            }`}
        >
            <div className={css.entry}>
                {isRunning && (
                    <div
                        aria-hidden
                        className={`${css.glowRoot} ${glowShapeClass}`}
                    >
                        <div ref={spinnerRef} className={css.glowSpinner} />
                    </div>
                )}
                {isCollapsed ? (
                    <button
                        type="button"
                        className={css.collapsedTrigger}
                        aria-label="Ask Gaia"
                        onClick={handleClick}
                    >
                        <GaiaAvatar size={18} />
                    </button>
                ) : (
                    <button
                        type="button"
                        className={css.expandedTrigger}
                        onClick={handleClick}
                    >
                        <GaiaAvatar size={20} />
                        <span className={css.expandedLabel}>Ask Gaia</span>
                        <Box alignItems="center" gap="xxxxs">
                            <ShortcutKey>⌘</ShortcutKey>
                            <ShortcutKey>G</ShortcutKey>
                        </Box>
                    </button>
                )}
            </div>
        </div>
    )
}

const GaiaAvatar = ({ size = 24 }: { size?: number }) => (
    <span
        className={css.gaiaAvatar}
        style={{ width: size, height: size }}
        aria-hidden
    />
)
