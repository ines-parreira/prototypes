import type { ReactNode } from 'react'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Text,
    TextVariant,
} from '@gorgias/axiom'

import type {
    ChatDisplayVersion,
    ChatPreviewPage,
} from '../../ChatPreviewPanel.types'

import css from '../../ChatPreviewPanel.less'

type Props = {
    appId: string | null
    selectedPage: ChatPreviewPage
    onPageChange: (page: string) => void
    headerActions?: ReactNode
    shouldShowChatVersionSwitcher: boolean
    chatDisplayVersion: ChatDisplayVersion | undefined
    onChatDisplayVersionChange: (key: string) => void
    withBusinessHoursToggle: boolean
}

export const ChatPreviewPanelHeader = ({
    appId,
    selectedPage,
    onPageChange,
    headerActions,
    shouldShowChatVersionSwitcher,
    chatDisplayVersion,
    onChatDisplayVersionChange,
    withBusinessHoursToggle,
}: Props) => (
    <Box
        alignItems="center"
        flexDirection="column"
        justifyContent="space-between"
        className={`${css.header} ${
            withBusinessHoursToggle ? css.headerWithBusinessHoursToggle : ''
        }`}
    >
        <Box justifyContent="space-between" alignItems="center" width={'100%'}>
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
        {shouldShowChatVersionSwitcher && (
            <Box width={'100%'}>
                <ButtonGroup
                    selectedKey={chatDisplayVersion}
                    defaultSelectedKey="current"
                    onSelectionChange={onChatDisplayVersionChange}
                >
                    <ButtonGroupItem id="current">Current</ButtonGroupItem>
                    <ButtonGroupItem id="new">
                        New &#40;2.0&#41;
                    </ButtonGroupItem>
                </ButtonGroup>
            </Box>
        )}
    </Box>
)
