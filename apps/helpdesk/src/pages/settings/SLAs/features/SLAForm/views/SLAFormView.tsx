import { useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { FormValidator } from 'core/forms'
import { Form, FormField, FormSubmitButton } from 'core/forms'
import ToggleInputField from 'pages/common/forms/ToggleInputField'
import settingsCss from 'pages/settings/settings.less'
import PageHeader from 'pages/settings/SLAs/features/PageHeader/PageHeader'
import { DeleteModal } from 'pages/settings/SLAs/features/SLAForm/views/DeleteModal'

import type { MappedFormSLAPolicy } from '../controllers/makeMappedFormSLAPolicy'
import type { SLAFormValues } from '../controllers/useFormValues'
import ChannelSelectBox from './ChannelSelectBox'
import FormSection from './FormSection'
import MetricsFieldArray from './MetricsFieldArray'

import css from './SLAFormView.less'

type SLAFormViewProps = {
    policy: MappedFormSLAPolicy | undefined
    values: SLAFormValues
    defaultValues: SLAFormValues
    onSubmit: (data: SLAFormValues) => void
    isLoading?: boolean
    validator: FormValidator<SLAFormValues>
}

export default function SLAFormView({
    policy,
    defaultValues,
    values,
    onSubmit,
    isLoading,
    validator,
}: SLAFormViewProps) {
    const [isArchiveModalOpen, setArchiveModalOpen] = useState(false)

    const isPauseSLAEnabled = useFlag(FeatureFlagKey.PauseSLA)

    return (
        <div className={css.page}>
            <PageHeader
                secondaryBreadcrumb={policy ? policy.name : 'New SLA'}
                showCreateButtons={false}
            />
            <div className={settingsCss.pageContainer}>
                <div className={settingsCss.contentWrapper}>
                    <Form
                        defaultValues={defaultValues}
                        values={values}
                        onValidSubmit={onSubmit}
                        validator={validator}
                    >
                        <FormSection>
                            <FormField
                                name="name"
                                label="SLA name"
                                isRequired
                                className={settingsCss.mb48}
                            />
                        </FormSection>
                        <FormSection
                            title="Conditions"
                            description="All conditions should be met in order for this
                                SLA to trigger."
                        >
                            <FormField
                                name="target_channels"
                                field={ChannelSelectBox}
                            />
                        </FormSection>
                        <FormSection
                            title="Policy"
                            description="Define the first response time and / or
                                resolution times to be set as goals by your
                                team(s)."
                        >
                            <MetricsFieldArray />
                            {isPauseSLAEnabled && (
                                <FormField
                                    name="business_hours_only"
                                    field={ToggleInputField}
                                    className={settingsCss.mb48}
                                >
                                    Pause SLA timer outside of business hours
                                </FormField>
                            )}
                            <FormField
                                name="active"
                                field={ToggleInputField}
                                caption={
                                    <span>
                                        When enabled new tickets that fit this
                                        criteria will trigger this SLA.
                                    </span>
                                }
                                className={settingsCss.mb48}
                            >
                                Enable SLA
                            </FormField>
                        </FormSection>
                        <div className={css.buttonGroup}>
                            <div>
                                <FormSubmitButton isLoading={isLoading} />
                                <Button
                                    intent="secondary"
                                    onClick={() => {
                                        history.push('/app/settings/sla')
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                            {policy && (
                                <Button
                                    type="button"
                                    fillStyle="ghost"
                                    intent="destructive"
                                    onClick={() => {
                                        setArchiveModalOpen(true)
                                    }}
                                    leadingIcon="delete"
                                >
                                    Delete SLA
                                </Button>
                            )}
                        </div>
                    </Form>
                    <DeleteModal
                        policyId={policy?.uuid || ''}
                        isOpen={isArchiveModalOpen}
                        onClose={() => {
                            setArchiveModalOpen(false)
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
