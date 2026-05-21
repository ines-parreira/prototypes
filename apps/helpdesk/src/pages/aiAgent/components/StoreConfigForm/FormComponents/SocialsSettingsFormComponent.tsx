import React, { useCallback, useMemo } from 'react'

import classnames from 'classnames'

import { Banner } from '@gorgias/axiom'

import { SettingsBannerType } from 'pages/aiAgent/components/StoreConfigForm/constants'
import { ChannelToggleInput } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/ChannelToggleInput'
import { INITIAL_FORM_VALUES } from 'pages/aiAgent/constants'
import type { FormValues, UpdateValue } from 'pages/aiAgent/types'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'

import { SocialsIntegrationListSelection } from '../../SocialsIntegrationListSelection/SocialsIntegrationListSelection'
import { useSocialsIntegrations } from '../hooks/useSocialsIntegrations'
import { SocialsFooterFormComponent } from './SocialsFooterFormComponent'

import css from './SocialsSettingsFormComponent.less'

const META_POLICIES_NOTICE_TITLE = "Follow Meta's platform policies"

const META_POLICIES_NOTICE_DESCRIPTION = (
    <>
        AI Agent can&apos;t be used by merchants in Meta&apos;s{' '}
        <a
            href="https://www.facebook.com/policies_center/commerce"
            target="_blank"
            rel="noreferrer"
        >
            restricted goods and services
        </a>{' '}
        like medical devices, medications, alcohol, and tobacco. Please ensure
        you comply with Meta&apos;s rules.
    </>
)

type SocialsSettingsFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    monitoredSocialsIntegrations: number[] | null
    socialsDisclaimer: string | null
    isRequired?: boolean
    isDisabled?: boolean
    setIsPristine?: (isPristine: boolean) => void
    showToggle?: boolean
    isSocialsChannelEnabled?: boolean
    socialsChannelDeactivatedDatetime?: string | null
    onUpdateSocialsChannelDeactivatedDatetime?: (
        datetime: string | null,
    ) => void
    hasAccess?: boolean
}

export const SocialsSettingsFormComponent = ({
    monitoredSocialsIntegrations,
    socialsDisclaimer,
    updateValue,
    isRequired,
    setIsPristine,
    isDisabled,
    showToggle,
    isSocialsChannelEnabled,
    socialsChannelDeactivatedDatetime,
    onUpdateSocialsChannelDeactivatedDatetime,
    hasAccess,
}: SocialsSettingsFormComponentProps) => {
    const socialsIntegrations = useSocialsIntegrations()

    const selectedSocials = useMemo(() => {
        const selectedSet = new Set(monitoredSocialsIntegrations ?? [])
        return socialsIntegrations.filter((integration) =>
            selectedSet.has(integration.id),
        )
    }, [monitoredSocialsIntegrations, socialsIntegrations])

    const socialsIntegrationsValidationError = useMemo(() => {
        if (!selectedSocials?.length && isRequired) {
            return 'One or more socials integrations required.'
        }
        return null
    }, [selectedSocials, isRequired])

    const hasError = useMemo(() => {
        return !!socialsIntegrationsValidationError && isRequired
    }, [socialsIntegrationsValidationError, isRequired])

    const handleSelectSocialsIntegration = useCallback(
        (values: number[]) => {
            if (setIsPristine) setIsPristine(false)
            updateValue('monitoredSocialsIntegrations', values)
        },
        [updateValue, setIsPristine],
    )

    const hasNoSocialsIntegrations = socialsIntegrations.length === 0

    return (
        <div className={css.socialsSettingsFormComponent}>
            <section className={css.metaPoliciesNotice}>
                <Banner
                    variant="inline"
                    intent="info"
                    isClosable={false}
                    size="md"
                    title={META_POLICIES_NOTICE_TITLE}
                    description={META_POLICIES_NOTICE_DESCRIPTION}
                />
            </section>
            {showToggle && onUpdateSocialsChannelDeactivatedDatetime && (
                <section>
                    <ChannelToggleInput
                        isToggled={!!isSocialsChannelEnabled}
                        onUpdate={(isToggled) => {
                            onUpdateSocialsChannelDeactivatedDatetime(
                                isToggled ? null : new Date().toISOString(),
                            )
                        }}
                        channel="socials"
                        isDisabled={!hasAccess}
                        deactivatedDatetime={socialsChannelDeactivatedDatetime}
                        type={SettingsBannerType.Socials}
                    />
                </section>
            )}
            <section>
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle
                            id="monitored-socials-channels"
                            isRequired={isRequired}
                        >
                            Select socials integrations
                        </SettingsCardTitle>
                    </SettingsCardHeader>
                    <SettingsCardContent>
                        <div>
                            <SocialsIntegrationListSelection
                                labelId="monitored-socials-channels"
                                selectedIds={
                                    monitoredSocialsIntegrations !== null
                                        ? monitoredSocialsIntegrations
                                        : INITIAL_FORM_VALUES.monitoredSocialsIntegrations
                                }
                                onSelectionChange={
                                    handleSelectSocialsIntegration
                                }
                                socialsItems={socialsIntegrations}
                                hasError={hasError}
                                isDisabled={hasNoSocialsIntegrations}
                            />
                            {hasNoSocialsIntegrations && (
                                <div className={css.emptyStateMessage}>
                                    You don&apos;t have any socials integrations
                                    connected yet.
                                </div>
                            )}
                            {!hasNoSocialsIntegrations && (
                                <div
                                    className={classnames(
                                        css.formInputFooterInfo,
                                        {
                                            [css.error]: hasError,
                                        },
                                    )}
                                >
                                    {socialsIntegrationsValidationError}
                                </div>
                            )}
                        </div>
                    </SettingsCardContent>
                </SettingsCard>
            </section>
            <section>
                <SocialsFooterFormComponent
                    socialsDisclaimer={socialsDisclaimer}
                    updateValue={updateValue}
                    setIsPristine={setIsPristine}
                    isRequired={false}
                    isDisabled={isDisabled}
                />
            </section>
        </div>
    )
}
