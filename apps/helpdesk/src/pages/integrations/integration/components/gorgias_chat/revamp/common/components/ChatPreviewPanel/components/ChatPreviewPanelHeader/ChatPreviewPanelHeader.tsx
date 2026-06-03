import type { ReactNode } from 'react'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Text,
    TextVariant,
} from '@gorgias/axiom'

import type { ChatPreviewPage } from '../../ChatPreviewPanel.types'

import css from '../../ChatPreviewPanel.less'

type Props = {
    appId: string | null
    selectedPage: ChatPreviewPage
    onPageChange: (page: string) => void
    headerActions?: ReactNode
    withBusinessHoursToggle: boolean
}

export const ChatPreviewPanelHeader = ({
    appId,
    selectedPage,
    onPageChange,
    headerActions,
    withBusinessHoursToggle,
}: Props) => (
    <Box
        alignItems="center"
        justifyContent="space-between"
        className={`${css.header} ${
            withBusinessHoursToggle ? css.headerWithBusinessHoursToggle : ''
        }`}
    >
        <Text variant={TextVariant.Medium}>Chat preview</Text>
        {headerActions ??
            (appId && (
                <ButtonGroup
                    selectedKey={selectedPage}
                    defaultSelectedKey="homepage"
                    onSelectionChange={onPageChange}
                >
                    <ButtonGroupItem
                        id="homepage"
                        icon={<Icon name="nav-home" />}
                    />
                    <ButtonGroupItem
                        id="conversation"
                        icon={<Icon name="chat-conversation-circle" />}
                    />
                </ButtonGroup>
            ))}
    </Box>
)
