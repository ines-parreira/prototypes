import classNames from 'classnames'
import { useFormContext } from 'react-hook-form'

import { Box, Label } from '@gorgias/merchant-ui-kit'

import Launcher from 'gorgias-design-system/Launcher/Launcher'
import { useGetChatIntegrationColor } from 'pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import Filter from 'pages/stats/common/components/Filter'
import { FilterOptionGroup } from 'pages/stats/types'

import css from './ConversationPreview.less'

const messages = [
    'Does this contain fragrances?',
    'Can this product be used daily?',
    'Is this suitable for sensitive skin?',
]

const filterPreviewOptions: FilterOptionGroup[] = [
    {
        options: [
            {
                label: 'Chat Widget',
                value: 'chat-widget',
            },
        ],
    },
]

export const FloatingChatInputPreview = () => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const { conversationColor } = useGetChatIntegrationColor({
        shopName: storeConfiguration?.storeName ?? '',
        chatIntegrationIds: storeConfiguration?.monitoredChatIntegrations ?? [],
    })

    return (
        <div className={css.inputWrapper}>
            <div
                className={css.inputContainer}
                style={{ borderColor: conversationColor }}
            >
                <i
                    className={classNames(
                        'material-icons-round',
                        css.floatingIcon,
                    )}
                    style={{ color: conversationColor }}
                >
                    search
                </i>
                <p className={css.floatingText}>Hi! How can I help?</p>
                <i
                    className={classNames(
                        'material-icons-round',
                        css.floatingIcon,
                    )}
                    style={{ color: conversationColor }}
                >
                    send
                </i>
            </div>
        </div>
    )
}

export const ConversationPreview = () => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const { conversationColor } = useGetChatIntegrationColor({
        shopName: storeConfiguration?.storeName ?? '',
        chatIntegrationIds: storeConfiguration?.monitoredChatIntegrations ?? [],
    })

    const { watch } = useFormContext()

    const isConversationStartersEnabled = watch('isConversationStartersEnabled')
    const isFloatingInputEnabled = watch('isFloatingInputEnabled')

    return (
        <Box className={css.right} flexDirection="column">
            <Filter
                filterName="Preview"
                filterOptionGroups={filterPreviewOptions}
                onChangeOption={() => {}}
                onRemoveAll={() => {}}
                onSelectAll={() => {}}
                onChangeLogicalOperator={() => {}}
                selectedOptions={[filterPreviewOptions[0].options[0]]}
                isPersistent
                isMultiple={false}
                showQuickSelect={false}
                showSearch={false}
                logicalOperators={[]}
            />
            <Box
                flexDirection="column"
                flexGrow={1}
                className={css.previewContainer}
            >
                {isConversationStartersEnabled && (
                    <Box
                        className={css.preview}
                        alignSelf="flex-end"
                        flexDirection="column"
                    >
                        {messages.map((message) => (
                            <Box
                                alignSelf="flex-end"
                                flexDirection="column"
                                key={`message-${message}`}
                            >
                                <button
                                    className={css.starter}
                                    style={{
                                        borderColor: conversationColor,
                                    }}
                                >
                                    {message}
                                </button>
                            </Box>
                        ))}
                    </Box>
                )}
                <Box
                    alignSelf="flex-end"
                    className={css.launcherContainer}
                    gap={8}
                >
                    {isFloatingInputEnabled && <FloatingChatInputPreview />}
                    <Launcher
                        shouldHideLabel
                        hasLaunched={
                            isConversationStartersEnabled ||
                            isFloatingInputEnabled
                        }
                        color={conversationColor}
                    />
                </Box>
            </Box>
            <Label className={css.description}>
                How your shoppers will see your Chat Widget
            </Label>
        </Box>
    )
}
