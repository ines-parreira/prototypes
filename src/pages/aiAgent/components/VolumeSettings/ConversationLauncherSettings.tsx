import { useEffect, useState } from 'react'

import classNames from 'classnames'
import { useFormContext } from 'react-hook-form'

import { Box, Button, Label, Separator } from '@gorgias/merchant-ui-kit'

import { NewToggleButton } from 'pages/common/forms/NewToggleButton'

import css from './ConversationLauncherSettings.less'

export const ConversationLauncherAdvancedSettings = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) => {
    const { watch, setValue } = useFormContext()
    const isFloatingInputDesktopOnly = watch('isFloatingInputDesktopOnly')
    const [localValue, setLocalValue] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setLocalValue(isFloatingInputDesktopOnly)
        }
    }, [isOpen, isFloatingInputDesktopOnly])

    const handleUpdate = () => {
        setValue('isFloatingInputDesktopOnly', localValue, {
            shouldDirty: true,
        })
        onClose()
    }

    return (
        <div
            className={classNames(css.sidebar, {
                [css.sidebarHidden]: !isOpen,
            })}
        >
            <Box className={css.sidebarHeader}>
                <p className={css.sidebarTitle}>
                    Floating Input: Advanced Settings
                </p>
                <i
                    className={classNames('material-icons', css.exitIcon)}
                    onClick={onClose}
                >
                    keyboard_tab
                </i>
            </Box>

            <Box className={css.sidebarBody}>
                <Label className={css.sidebarToggleRow}>
                    <div className={css.desktopSwitch}>
                        Enable on Desktop only
                        <p className={css.desktopSwitchDescription}>
                            When enabled, the Conversation Launcher will only be
                            displayed on desktop.
                        </p>
                    </div>
                    <NewToggleButton
                        checked={localValue}
                        onChange={() => setLocalValue(!localValue)}
                        stopPropagation
                    />
                </Label>
            </Box>

            <div className={css.sidebarFooter}>
                <Button
                    isDisabled={isFloatingInputDesktopOnly === localValue}
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
            </div>
        </div>
    )
}

export const ConversationLauncherSettings = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    const { watch, setValue } = useFormContext()
    const isFloatingInputEnabled = watch('isFloatingInputEnabled')

    return (
        <>
            <ConversationLauncherAdvancedSettings
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className={css.wrapper}>
                <Box className={css.containerTitle} flexDirection="column">
                    <Box>
                        <strong className={css.title}>
                            Conversation Launcher
                        </strong>
                    </Box>
                    <Box>
                        <p className={css.body}>
                            Launch interactions that drive sales by XY%. Lorem
                            ipsum placeholder text for Floating Input, and other
                            helpful content will go here.
                        </p>
                    </Box>
                </Box>
                <Box className={css.settingsGroup}>
                    <Label className={css.label}>
                        Enable Floating Input
                        <NewToggleButton
                            checked={isFloatingInputEnabled}
                            onChange={() =>
                                setValue(
                                    'isFloatingInputEnabled',
                                    !isFloatingInputEnabled,
                                    {
                                        shouldDirty: true,
                                    },
                                )
                            }
                            stopPropagation
                        />
                    </Label>
                </Box>

                <Separator className={css.separator} />

                <Box
                    className={classNames(css.advancedSettingsGroup, {
                        [css.disabled]: !isFloatingInputEnabled,
                    })}
                >
                    <Label
                        className={classNames(css.advancedSettings, {
                            [css.disabled]: !isFloatingInputEnabled,
                        })}
                        onClick={
                            isFloatingInputEnabled
                                ? () => setSidebarOpen(true)
                                : undefined
                        }
                    >
                        Advanced settings
                        <i
                            className={classNames(
                                'material-icons',
                                css.forwardIcon,
                            )}
                        >
                            keyboard_arrow_right
                        </i>
                    </Label>
                </Box>
            </div>
        </>
    )
}
