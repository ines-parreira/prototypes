import cn from 'classnames'

import { Box } from '@gorgias/axiom'

import { PlaygroundPanel } from 'pages/aiAgent/components/PlaygroundPanel/PlaygroundPanel'

import type { PlaygroundState } from '../types/playground-state'

import css from './EditorWithPlayground.less'

type EditorWithPlaygroundProps = {
    playground: PlaygroundState
    draftKnowledge?: { sourceId: number; sourceSetId: number }
    playgroundBanner?: React.ReactNode
    children: React.ReactNode
}

export const EditorWithPlayground = ({
    playground,
    draftKnowledge,
    playgroundBanner,
    children,
}: EditorWithPlaygroundProps) => {
    return (
        <Box
            flexDirection="row"
            width="100%"
            height="100%"
            className={css.splitView}
        >
            {children}
            <div
                className={cn(
                    css.playground,
                    playground.isOpen
                        ? css['playground-open']
                        : css['playground-closed'],
                )}
            >
                <PlaygroundPanel
                    onClose={playground.onClose}
                    draftKnowledge={draftKnowledge}
                    banner={playgroundBanner}
                />
            </div>
        </Box>
    )
}
