import { useCallback, useEffect, useState } from 'react'

import { get } from 'lodash'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'

import { Button, Label } from '@gorgias/merchant-ui-kit'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import { StoreConfiguration } from 'models/aiAgent/types'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { Drawer } from 'pages/common/components/Drawer'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'
import GorgiasTranslateInputField from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateInputField'
import translationsAvailableKeys from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationAppearance/GorgiasTranslateText/translations-available-keys'
import { Translations } from 'rest_api/gorgias_chat_protected_api/types'
import { getGorgiasChatIntegrationsByStoreName } from 'state/integrations/selectors'
import { assetsUrl } from 'utils'
import { getLDClient } from 'utils/launchDarkly'

import {
    EngagementSettingsCard,
    EngagementSettingsCardContent,
    EngagementSettingsCardContentWrapper,
    EngagementSettingsCardDescription,
    EngagementSettingsCardFooter,
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
    storeConfiguration,
    primaryLanguage,
    translations,
}: {
    isOpen: boolean
    onClose: () => void
    storeConfiguration?: StoreConfiguration
    primaryLanguage: string
    translations: Translations
}) => {
    const { watch, setValue } = useFormContext()
    const isFloatingInputDesktopOnly = watch('isFloatingInputDesktopOnly')
    const needHelpText = watch('needHelpText')
    const needHelpKey = 'sspTexts.needHelp'
    const storeHasOnlyOneChatIntegration =
        storeConfiguration?.monitoredChatIntegrations.length === 1

    const [localValue, setLocalValue] = useState({
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
                needHelpText: needHelpText,
                isFloatingInputDesktopOnly: isFloatingInputDesktopOnly,
            }))
        }
    }, [isOpen, isFloatingInputDesktopOnly, needHelpText])

    const handleUpdate = () => {
        setValue(
            'isFloatingInputDesktopOnly',
            localValue.isFloatingInputDesktopOnly,
            {
                shouldDirty: true,
            },
        )
        setValue('needHelpText', localValue.needHelpText, {
            shouldDirty: true,
        })
        onClose()
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
                    <div className={css.desktopSwitch}>
                        Enable on Desktop only
                        <p className={css.desktopSwitchDescription}>
                            When enabled, the Ask anything input will only be
                            displayed on desktop.
                        </p>
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
                        stopPropagation
                    />
                </Label>
            </Drawer.Content>

            <Drawer.Footer className={css.drawerFooter}>
                <Button
                    isDisabled={
                        isFloatingInputDesktopOnly ===
                            localValue.isFloatingInputDesktopOnly &&
                        needHelpText === localValue.needHelpText
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

const ESTIMATED_INFLUENCED_GMV = 0.03

export const ConversationLauncherSettings = ({
    gmv,
    isGmvLoading,
    primaryLanguage,
    translations,
}: {
    gmv: TimeSeriesDataItem[][] | undefined
    isGmvLoading: boolean
    primaryLanguage: string
    translations: Translations
}) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    const { watch, setValue } = useFormContext()
    const isFloatingInputEnabled = watch('isFloatingInputEnabled')

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()

    const { shopName } = useParams<{ shopName: string }>()

    const flags = getLDClient().allFlags()
    const routes = getAiAgentNavigationRoutes(shopName, flags)

    const potentialImpact = usePotentialImpact(ESTIMATED_INFLUENCED_GMV, gmv)

    return (
        <>
            <ConversationLauncherAdvancedSettings
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
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
                        <EngagementSettingsCardTitle>
                            Ask anything input
                        </EngagementSettingsCardTitle>

                        <EngagementSettingsCardDescription>
                            Drive more sales by adding an always-on input field
                            that encourages shoppers to start a conversation.
                        </EngagementSettingsCardDescription>

                        {storeConfiguration?.floatingChatInputConfiguration
                            ?.isEnabled ? (
                            <EngagementSettingsCardLinkButton
                                href={routes.analytics}
                                text="Track Performance"
                            />
                        ) : (
                            <EngagementSettingsCardImpact
                                icon="lock"
                                impact={potentialImpact}
                                isLoading={isGmvLoading}
                            />
                        )}
                    </EngagementSettingsCardContent>

                    <EngagementSettingsCardToggle
                        isChecked={isFloatingInputEnabled}
                        onChange={() =>
                            setValue(
                                'isFloatingInputEnabled',
                                !isFloatingInputEnabled,
                                {
                                    shouldDirty: true,
                                },
                            )
                        }
                    />
                </EngagementSettingsCardContentWrapper>

                <EngagementSettingsCardFooter>
                    <SettingsFeatureRow
                        title="Advanced settings"
                        isDisabled={!isFloatingInputEnabled}
                        onClick={
                            isFloatingInputEnabled
                                ? () => setSidebarOpen(true)
                                : undefined
                        }
                    />
                </EngagementSettingsCardFooter>
            </EngagementSettingsCard>
        </>
    )
}
