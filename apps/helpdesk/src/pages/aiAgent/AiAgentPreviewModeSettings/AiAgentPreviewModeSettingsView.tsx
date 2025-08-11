import React, { useCallback, useEffect, useState } from 'react'

import classnames from 'classnames'

import { ToggleField } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { StoreConfiguration } from 'models/aiAgent/types'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {
    DEFAULT_PREVIEW_MODE_DURATION_IN_DAYS,
    PREVIEW,
} from 'pages/aiAgent/constants'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import InputField from 'pages/common/forms/input/InputField'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useAiAgentOnboardingNotification } from '../hooks/useAiAgentOnboardingNotification'

import css from './AiAgentPreviewModeSettingsView.less'

interface AiAgentPreviewModeSettingsViewProps {
    shopName: string
    storeConfiguration: StoreConfiguration
    updateStoreConfiguration: (
        configurationToSubmit: StoreConfiguration,
    ) => Promise<void>
    hasNoEmailConnected: boolean
    hasNoKnowledgeBase: boolean
    isPreviewModeEnabled: boolean
}

const NUMBER_OF_MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24

const AiAgentPreviewModeSettingsView: React.FC<
    AiAgentPreviewModeSettingsViewProps
> = ({
    shopName,
    storeConfiguration,
    updateStoreConfiguration,
    hasNoEmailConnected,
    hasNoKnowledgeBase,
    isPreviewModeEnabled,
}) => {
    const getStoredDuration = useCallback(() => {
        if (
            storeConfiguration?.previewModeActivatedDatetime &&
            storeConfiguration?.previewModeValidUntilDatetime &&
            storeConfiguration?.isPreviewModeActive
        ) {
            const storedActivatedDatetime = new Date(
                storeConfiguration.previewModeActivatedDatetime,
            )

            const storedExpirationDatetime = new Date(
                storeConfiguration.previewModeValidUntilDatetime,
            )

            return Math.round(
                (storedExpirationDatetime.getTime() -
                    storedActivatedDatetime.getTime()) /
                    NUMBER_OF_MILLISECONDS_IN_A_DAY,
            )
        }

        return DEFAULT_PREVIEW_MODE_DURATION_IN_DAYS
    }, [storeConfiguration])

    const dispatch = useAppDispatch()
    const [duration, setDuration] = useState<number>(
        DEFAULT_PREVIEW_MODE_DURATION_IN_DAYS,
    )
    const [durationError, setDurationError] = useState<string | null>(null)
    const [isPristine, setIsPristine] = useState<boolean>(true)
    const [isToggled, setIsToggled] = useState<boolean>(isPreviewModeEnabled)

    useEffect(() => {
        if (storeConfiguration) {
            setDuration(getStoredDuration())
        }
    }, [getStoredDuration, storeConfiguration])

    const onCancel = () => {
        const storedDuration = getStoredDuration()
        setDuration(storedDuration)
        setDurationError(null)
        setIsPristine(true)
        setIsToggled(isPreviewModeEnabled)
    }

    const {
        isLoading: isLoadingOnboardingNotificationState,
        handleOnCancelActivateAiAgentNotification,
    } = useAiAgentOnboardingNotification({ shopName })

    const onSubmit = async () => {
        if (!storeConfiguration || hasNoEmailConnected || hasNoKnowledgeBase) {
            return
        }

        if (
            (isToggled && isPreviewModeEnabled && isPristine) ||
            (!isToggled && !isPreviewModeEnabled)
        ) {
            return
        }

        if (durationError) {
            void dispatch(
                notify({
                    message: durationError,
                    status: NotificationStatus.Error,
                }),
            )
            return
        }

        const currentDate = new Date().toISOString()
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + duration)
        const additionalPayload = isToggled
            ? {
                  previewModeActivatedDatetime: currentDate,
                  trialModeActivatedDatetime: currentDate,
                  deactivatedDatetime: currentDate,
                  chatChannelDeactivatedDatetime: currentDate,
                  emailChannelDeactivatedDatetime: currentDate,
                  previewModeValidUntilDatetime: expirationDate.toISOString(),
              }
            : {
                  previewModeActivatedDatetime: null,
                  trialModeActivatedDatetime: null,
                  previewModeValidUntilDatetime: null,
              }

        try {
            await updateStoreConfiguration({
                ...storeConfiguration,
                ...additionalPayload,
            })

            void dispatch(
                notify({
                    message: `Preview mode ${
                        isToggled ? 'enabled' : 'disabled'
                    } successfully`,
                    status: NotificationStatus.Success,
                }),
            )

            if (isToggled) {
                handleOnCancelActivateAiAgentNotification()
            }

            setIsPristine(true)
        } catch {
            void dispatch(
                notify({
                    message: `Failed to ${
                        isToggled ? 'enabled' : 'disabled'
                    } Preview mode`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }

    const getExpiryDate = () => {
        if (durationError) {
            return 'date unavailable'
        }
        const currentDate = new Date()
        const expiryDate = new Date(
            currentDate.setDate(currentDate.getDate() + Number(duration)),
        )
        const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        }

        return expiryDate.toLocaleDateString('en-US', dateOptions)
    }

    const onDurationChange = (value: string) => {
        setIsPristine(false)
        const newDuration = value ? Number(value) : NaN
        setDuration(newDuration)
        if (Number.isNaN(newDuration)) {
            setDurationError('Duration is required')
        } else if (newDuration < 1) {
            setDurationError('Duration must be greater than 0d')
        } else if (newDuration > 30) {
            setDurationError('Duration must be less than 30d')
        } else {
            setDurationError(null)
        }
    }

    const durationInputValue = Number.isNaN(duration) ? '' : duration

    return (
        <>
            <UnsavedChangesPrompt
                onSave={onSubmit}
                when={!isPristine}
                onDiscard={onCancel}
                shouldRedirectAfterSave={true}
            />
            <AiAgentLayout shopName={shopName} title={PREVIEW}>
                <form className={css.form}>
                    <section>
                        <div className={css.title}>Preview</div>
                    </section>
                    {(hasNoEmailConnected || hasNoKnowledgeBase) && (
                        <section>
                            <Alert
                                type={AlertType.Warning}
                                icon
                                role="alert"
                                className={css.alertBanner}
                            >
                                Merchant needs at least
                                <strong>{' 1 email connected '}</strong> and
                                <strong>{' 1 knowledge added '}</strong>
                                to enable Preview.
                            </Alert>
                        </section>
                    )}
                    <section>
                        <ToggleField
                            value={isToggled}
                            onChange={(value) => {
                                setIsToggled(value)
                                setIsPristine(false)
                            }}
                            isDisabled={
                                hasNoEmailConnected ||
                                hasNoKnowledgeBase ||
                                isLoadingOnboardingNotificationState
                            }
                            label="Enable Preview"
                        />
                    </section>
                    <div
                        className={classnames(css.animatedDiv, {
                            [css.show]: isToggled,
                        })}
                        style={{ height: isToggled ? '166px' : 0 }}
                        aria-label="preview duration form section"
                    >
                        <section className={css.durationSection}>
                            <InputField
                                id="duration"
                                className={css.durationInputWrapper}
                                label="Set duration"
                                caption="Limit: 30 days"
                                maxLength={253}
                                type="number"
                                inputWrapperClassName={css.durationInput}
                                value={durationInputValue}
                                onChange={onDurationChange}
                                hasError={!!durationError}
                                error={durationError}
                            />
                            <div className={css.durationButton}>Days</div>
                        </section>
                        <Alert type={AlertType.Info}>
                            <div>
                                Preview will automatically disable on{' '}
                                <b>{getExpiryDate()}</b>
                            </div>
                        </Alert>
                    </div>
                    <section className={css.footer}>
                        <Button onClick={onSubmit}>Save Changes</Button>
                        <Button
                            intent={'secondary'}
                            onClick={onCancel}
                            isDisabled={isPristine}
                        >
                            Cancel
                        </Button>
                    </section>
                </form>
            </AiAgentLayout>
        </>
    )
}

export default AiAgentPreviewModeSettingsView
