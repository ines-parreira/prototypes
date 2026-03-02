import type { ReactNode } from 'react'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Text,
    TextVariant,
} from '@gorgias/axiom'

import css from './ChatPreviewPanel.less'

type Props = {
    children?: ReactNode
}

export const ChatPreviewPanel = ({ children }: Props) => {
    return (
        <Box flexDirection="column" className={css.panel}>
            <Box
                alignItems="center"
                justifyContent="space-between"
                className={css.header}
            >
                <Text variant={TextVariant.Medium}>Chat preview</Text>
                <ButtonGroup defaultSelectedKey="home">
                    <ButtonGroupItem
                        id="home"
                        icon={<Icon name="nav-home" />}
                    />
                    <ButtonGroupItem
                        id="chat"
                        icon={<Icon name="comm-chat-conversation-circle" />}
                    />
                </ButtonGroup>
            </Box>
            <Box flexGrow={1} className={css.content}>
                {children}
            </Box>
        </Box>
    )
}
