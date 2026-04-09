import { Box } from '@gorgias/axiom'

import css from './VoiceCallHeader.less'

type VoiceCallHeaderProps = {
    children: React.ReactNode
}

export function VoiceCallHeader({ children }: VoiceCallHeaderProps) {
    return (
        <Box
            flexDirection="row"
            alignItems="center"
            gap="xxs"
            className={css.flexWrap}
        >
            {children}
        </Box>
    )
}
