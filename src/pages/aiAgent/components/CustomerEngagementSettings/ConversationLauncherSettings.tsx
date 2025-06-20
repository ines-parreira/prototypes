import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'
import { get } from 'lodash'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'

import { Button, Label } from '@gorgias/merchant-ui-kit'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import { StoreConfiguration } from 'models/aiAgent/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { Drawer } from 'pages/common/components/Drawer'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'
import GorgiasTranslateInputField from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateInputField'
import translationsAvailableKeys from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationAppearance/GorgiasTranslateText/translations-available-keys'
import { Translations } from 'rest_api/gorgias_chat_protected_api/types'
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
                isAskAnythingInputEnabled: isAskAnythingInputEnabled,
                needHelpText: needHelpText,
                isFloatingInputDesktopOnly: isFloatingInputDesktopOnly,
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
            localValue.isFloatingInputDesktopOnly ||
                localValue.isAskAnythingInputEnabled,
            {
                shouldDirty: true,
            },
        )

        setValue('needHelpText', localValue.needHelpText, {
            shouldDirty: true,
        })

        onSave()
    }

    const saveKeyValue = useCallback((key: string, value: string) => {
        setLocalValue((prev) => ({
            ...prev,
            needHelpText: value,
        }))
    }, [])

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
                Ask anything input
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId="close-drawer"
                />
            </Drawer.Header>

            <Drawer.Content>
                {storeHasOnlyOneChatIntegration && (
                    <>
                        <Label className={css.sidebarToggleRow}>
                            <div className={css.desktopSwitch}>
                                Customize placeholder
                                <p className={css.desktopSwitchDescription}>
                                    You can also customize the placeholder of
                                    the Ask anything input for your other chat
                                    language in the{' '}
                                    <Link
                                        to={`/app/settings/channels/gorgias_chat/${gorgiasChatIntegrations?.id}/languages/${primaryLanguage}`}
                                    >
                                        chat settings
                                    </Link>
                                    .
                                </p>
                            </div>
                        </Label>
                        <div className={css.translateInputFields}>
                            <GorgiasTranslateInputField
                                maxLength={
                                    translationsAvailableKeys.general[
                                        needHelpKey
                                    ].maxLength
                                }
                                keyName={needHelpKey}
                                value={localValue.needHelpText}
                                defaultValue={get(translations, needHelpKey)}
                                saveValue={saveKeyValue}
                                isRequired={false}
                            />
                        </div>
                    </>
                )}
                <Label className={css.drawerToggleRow}>
                    <div className={css.allDevicesSwitch}>
                        Enable Ask anything input on all devices
                        <p className={css.allDevicesSwitchDescription}>
                            Drives more sales by showing an always-on input
                            field that encourages
                            <br />
                            shoppers to start a conversation.
                        </p>
                    </div>
                    <NewToggleButton
                        checked={localValue.isAskAnythingInputEnabled}
                        onChange={() =>
                            setLocalValue((prev) => ({
                                ...prev,
                                isAskAnythingInputEnabled:
                                    !prev.isAskAnythingInputEnabled,
                            }))
                        }
                        stopPropagation
                        isDisabled={localValue.isFloatingInputDesktopOnly}
                    />
                </Label>

                <Label
                    className={classNames(
                        css.drawerToggleRow,
                        css.desktopToggleRow,
                    )}
                >
                    <div className={css.allDevicesSwitch}>
                        Enable on Desktop only
                    </div>
                    <NewToggleButton
                        checked={localValue.isFloatingInputDesktopOnly}
                        onChange={() =>
                            setLocalValue((prev) => ({
                                ...prev,
                                isFloatingInputDesktopOnly:
                                    !prev.isFloatingInputDesktopOnly,
                            }))
                        }
                        isDisabled={localValue.isAskAnythingInputEnabled}
                        stopPropagation
                    />
                </Label>
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

    const { routes } = useAiAgentNavigation({ shopName })

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
                            '/img/ai-agent/ai_agent_floating_input.png',
                        )}
                    />

                    <EngagementSettingsCardContent>
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
                        </div>

                        <EngagementSettingsCardDescription>
                            {description}
                        </EngagementSettingsCardDescription>

                        {storeConfiguration?.floatingChatInputConfiguration
                            ?.isEnabled && (
                            <EngagementSettingsCardLinkButton
                                href={routes.analytics}
                                text="Track Performance"
                            />
                        )}
                    </EngagementSettingsCardContent>

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
                            isDesktopOnly={isFloatingInputDesktopOnly}
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
                </EngagementSettingsCardContentWrapper>
            </EngagementSettingsCard>
        </>
    )
}
