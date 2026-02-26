import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'
import { get } from 'lodash'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'

import {
    LegacyButton as Button,
    LegacyCheckBoxField as CheckBoxField,
    LegacyLabel as Label,
} from '@gorgias/axiom'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { Drawer } from 'pages/common/components/Drawer'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'
import TextArea from 'pages/common/forms/TextArea'
import translationsAvailableKeys from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/translations-available-keys'
import type { Translations } from 'rest_api/gorgias_chat_protected_api/types'
import { STATS_ROUTES } from 'routes/constants'
import { getGorgiasChatIntegrationsByStoreName } from 'state/integrations/selectors'
import { assetsUrl } from 'utils'

import {
    EngagementSettingsCard,
    EngagementSettingsCardContent,
    EngagementSettingsCardContentWrapper,
    EngagementSettingsCardDescription,
    EngagementSettingsCardImage,
    EngagementSettingsCardTitle,
} from './card/EngagementSettingsCard'
import { EngagementSettingsCardImpact } from './card/EngagementSettingsCardImpact'
import { EngagementSettingsCardLinkButton } from './card/EngagementSettingsCardLinkButton'
import { EngagementSettingsCardToggle } from './card/EngagementSettingsCardToggle'
import { usePotentialImpact } from './hooks/usePotentialImpact'

import css from './ConversationLauncherSettings.less'

export const ConversationLauncherAdvancedSettings = ({
    isOpen,
    onClose,
    onSave,
    storeConfiguration,
    primaryLanguage,
    translations,
}: {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    storeConfiguration?: StoreConfiguration
    primaryLanguage: string
    translations?: Translations
}) => {
    const { watch, setValue } = useFormContext()
    const isFloatingInputDesktopOnly = watch('isFloatingInputDesktopOnly')
    const isAskAnythingInputEnabled = watch('isAskAnythingInputEnabled')
    const needHelpText = watch('needHelpText')
    const needHelpKey = 'sspTexts.needHelp'
    const storeHasOnlyOneChatIntegration =
        storeConfiguration?.monitoredChatIntegrations.length === 1

    const [localValue, setLocalValue] = useState({
        isAskAnythingInputEnabled: false,
        isFloatingInputDesktopOnly: false,
        needHelpText: '',
    })

    const { shopName } = useParams<{ shopName: string }>()

    const gorgiasChatIntegrations = useAppSelector(
        getGorgiasChatIntegrationsByStoreName(shopName),
    )

    useEffect(() => {
        if (isOpen) {
            setLocalValue(() => ({
                isAskAnythingInputEnabled,
                needHelpText,
                isFloatingInputDesktopOnly,
            }))
        }
    }, [
        isOpen,
        isFloatingInputDesktopOnly,
        needHelpText,
        isAskAnythingInputEnabled,
    ])

    const handleUpdate = () => {
        setValue(
            'isFloatingInputDesktopOnly',
            localValue.isFloatingInputDesktopOnly,
            {
                shouldDirty: true,
            },
        )

        setValue(
            'isAskAnythingInputEnabled',
            localValue.isAskAnythingInputEnabled,
            {
                shouldDirty: true,
            },
        )

        setValue('needHelpText', localValue.needHelpText?.trim(), {
            shouldDirty: true,
        })

        onSave()
    }

    return (
        <Drawer
            fullscreen={false}
            isLoading={false}
            aria-label="Ask anything input"
            open={isOpen}
            portalRootId="app-root"
            onBackdropClick={onClose}
        >
            <Drawer.Header>
                Ask Anything Input
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId="close-drawer"
                />
            </Drawer.Header>

            <Drawer.Content>
                <Label
                    className={classNames(
                        css.drawerToggleRow,
                        css.desktopToggleRow,
                    )}
                >
                    <div className={css.toggleContainer}>
                        <div className={css.allDevicesSwitch}>
                            Enable Ask anything input
                        </div>
                        <NewToggleButton
                            checked={localValue.isAskAnythingInputEnabled}
                            onChange={() =>
                                setLocalValue((prev) => ({
                                    ...prev,
                                    isAskAnythingInputEnabled:
                                        !prev.isAskAnythingInputEnabled,
                                    isFloatingInputDesktopOnly:
                                        prev.isAskAnythingInputEnabled
                                            ? false
                                            : prev.isFloatingInputDesktopOnly,
                                }))
                            }
                            stopPropagation
                        />
                    </div>
                    <span className={css.switchDescription}>
                        Drive more sales by showing an always-on input field
                        that encourages shoppers to start a conversation.
                    </span>
                    <CheckBoxField
                        label="Hide on mobile"
                        value={localValue.isFloatingInputDesktopOnly}
                        onChange={() =>
                            setLocalValue((prev) => ({
                                ...prev,
                                isFloatingInputDesktopOnly:
                                    !prev.isFloatingInputDesktopOnly,
                                isAskAnythingInputEnabled:
                                    !prev.isFloatingInputDesktopOnly
                                        ? true
                                        : prev.isAskAnythingInputEnabled,
                            }))
                        }
                    />
                </Label>
                {storeHasOnlyOneChatIntegration && (
                    <>
                        <Label
                            className={classNames(
                                css.drawerToggleRow,
                                css.desktopToggleRow,
                            )}
                        >
                            <div className={css.allDevicesSwitch}>
                                Placeholder text
                            </div>
                            <p className={css.placeholderTextDescription}>
                                Choose what text customers see in the Ask
                                anything input. You can update the language in{' '}
                                <Link
                                    to={`/app/settings/channels/gorgias_chat/${gorgiasChatIntegrations?.id}/languages/${primaryLanguage}`}
                                >
                                    chat settings
                                </Link>
                                .
                            </p>
                            <div className={css.translateInputFields}>
                                <Label>Placeholder text</Label>
                                <TextArea
                                    aria-label={get(translations, needHelpKey)}
                                    defaultValue={get(
                                        translations,
                                        needHelpKey,
                                    )}
                                    maxLength={
                                        translationsAvailableKeys.general[
                                            needHelpKey
                                        ].maxLength
                                    }
                                    onChange={(event) => {
                                        setLocalValue((prev) => ({
                                            ...prev,
                                            needHelpText: event,
                                        }))
                                    }}
                                    placeholder={'Need help?'}
                                    key={needHelpKey}
                                    autoFocus={false}
                                    rows={1}
                                    autoRowHeight
                                    isRequired={false}
                                    value={localValue.needHelpText}
                                />
                            </div>
                        </Label>
                    </>
                )}
            </Drawer.Content>

            <Drawer.Footer className={css.drawerFooter}>
                <Button
                    isDisabled={
                        isFloatingInputDesktopOnly ===
                            localValue.isFloatingInputDesktopOnly &&
                        needHelpText === localValue.needHelpText &&
                        isAskAnythingInputEnabled ===
                            localValue.isAskAnythingInputEnabled
                    }
                    onClick={handleUpdate}
                    intent="primary"
                    type="submit"
                >
                    Update
                </Button>

                <Button
                    isDisabled={false}
                    onClick={onClose}
                    intent="secondary"
                    size="medium"
                >
                    Cancel
                </Button>
            </Drawer.Footer>
        </Drawer>
    )
}

export const CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV = 0.05

type Props = {
    description?: string
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
    primaryLanguage: string
    translations?: any
    onAdvancedSettingsSave?: () => void
}

export const ConversationLauncherSettings = ({
    description = 'Drive more sales by adding an always-on input field that encourages shoppers to start a conversation.',
    gmv,
    isGmvLoading,
    primaryLanguage,
    translations,
    onAdvancedSettingsSave,
}: Props) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    const { watch, setValue } = useFormContext()
    const isAskAnythingInputEnabled = watch('isAskAnythingInputEnabled')
    const isFloatingInputDesktopOnly = watch('isFloatingInputDesktopOnly')
    const { shopName } = useParams<{ shopName: string }>()

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const potentialImpact = usePotentialImpact(
        CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV,
        gmv,
    )

    const handleAdvancedSettingsSave = useCallback(() => {
        onAdvancedSettingsSave?.()
        setSidebarOpen(false)
    }, [onAdvancedSettingsSave])

    const handleToggle = () => {
        setValue('isAskAnythingInputEnabled', false, {
            shouldDirty: true,
        })
        setValue('isFloatingInputDesktopOnly', false, {
            shouldDirty: true,
        })
    }

    return (
        <>
            <ConversationLauncherAdvancedSettings
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onSave={handleAdvancedSettingsSave}
                storeConfiguration={storeConfiguration}
                primaryLanguage={primaryLanguage}
                translations={translations}
            />

            <EngagementSettingsCard>
                <EngagementSettingsCardContentWrapper>
                    <EngagementSettingsCardImage
                        alt="image showing an example of the Ask anything input"
                        src={assetsUrl(
                            '/img/ai-agent/ai_agent_floating_input_small.png',
                        )}
                    />

                    <EngagementSettingsCardContent className={css.cardContent}>
                        <div className={css.cardHeader}>
                            <EngagementSettingsCardTitle>
                                Ask anything input
                            </EngagementSettingsCardTitle>
                            {!storeConfiguration?.floatingChatInputConfiguration
                                ?.isEnabled && (
                                <EngagementSettingsCardImpact
                                    icon="lock"
                                    impact={potentialImpact}
                                    isLoading={isGmvLoading}
                                    isChecked
                                />
                            )}

                            {Object.keys(
                                storeConfiguration?.floatingChatInputConfiguration ||
                                    {},
                            ).length ? (
                                <EngagementSettingsCardToggle
                                    isChecked={isAskAnythingInputEnabled}
                                    onChange={() =>
                                        isAskAnythingInputEnabled
                                            ? handleToggle()
                                            : setSidebarOpen(true)
                                    }
                                    onSettingsClick={() => setSidebarOpen(true)}
                                    isDesktopOnly={isFloatingInputDesktopOnly}
                                    withBadges
                                />
                            ) : (
                                <div className={css.setUpButton}>
                                    <Button
                                        intent="primary"
                                        onClick={() => setSidebarOpen(true)}
                                    >
                                        Set up
                                    </Button>
                                </div>
                            )}
                        </div>

                        <EngagementSettingsCardDescription>
                            {description}
                        </EngagementSettingsCardDescription>

                        {storeConfiguration?.floatingChatInputConfiguration
                            ?.isEnabled && (
                            <EngagementSettingsCardLinkButton
                                href={`/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}/${shopName}`}
                                text="Track Performance"
                            />
                        )}
                    </EngagementSettingsCardContent>
                </EngagementSettingsCardContentWrapper>
            </EngagementSettingsCard>
        </>
    )
}
