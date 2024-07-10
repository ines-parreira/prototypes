import React from 'react'
import {Validator} from '@gorgias/api-validators'

import PageHeader from 'pages/settings/SLAs/features/PageHeader/PageHeader'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import settingsCss from 'pages/settings/settings.less'
import FormSubmitButton from 'pages/settings/SLAs/features/SLAForm/views/FormSubmitButton'
import {DeleteModal} from 'pages/settings/SLAs/features/SLAForm/views/DeleteModal'
import history from 'pages/history'

import {MappedFormSLAPolicy} from '../controllers/makeMappedFormSLAPolicy'
import {SLAFormValues} from '../controllers/useFormValues'

import Form from './Form'
import FormField from './FormField'
import FormSection from './FormSection'
import ChannelSelectBox from './ChannelSelectBox'
import ToggleInputFormField from './ToggleInputFormField'
import MetricsFieldArray from './MetricsFieldArray'
import css from './SLAFormView.less'

type SLAFormViewProps = {
    policy: MappedFormSLAPolicy | undefined
    values: SLAFormValues
    defaultValues: SLAFormValues
    onSubmit: (data: SLAFormValues) => void
    isLoading?: boolean
    validator: Validator<SLAFormValues>
}

export default function SLAFormView({
    policy,
    defaultValues,
    values,
    onSubmit,
    isLoading,
    validator,
}: SLAFormViewProps) {
    const [isArchiveModalOpen, setArchiveModalOpen] = React.useState(false)

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
                        onSubmit={onSubmit}
                        validator={validator}
                    >
                        <FormSection>
                            <FormField
                                fieldName="name"
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
                                fieldName="target_channels"
                                field={ChannelSelectBox}
                                className={settingsCss.mb8}
                            />
                        </FormSection>
                        <FormSection
                            title="Policy"
                            description="Define the first response time and / or
                                resolution times to be set as goals by your
                                team(s)."
                        >
                            <MetricsFieldArray />
                            <FormField
                                fieldName="active"
                                field={ToggleInputFormField}
                                isToggled={true}
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
                                >
                                    <ButtonIconLabel icon="delete">
                                        Delete SLA
                                    </ButtonIconLabel>
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
