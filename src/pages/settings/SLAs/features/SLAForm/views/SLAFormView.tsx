import React from 'react'

import {Form} from 'components/Form/Form'
import {FormValidator} from 'components/Form/validation'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import history from 'pages/history'
import settingsCss from 'pages/settings/settings.less'
import PageHeader from 'pages/settings/SLAs/features/PageHeader/PageHeader'
import {DeleteModal} from 'pages/settings/SLAs/features/SLAForm/views/DeleteModal'
import FormSubmitButton from 'pages/settings/SLAs/features/SLAForm/views/FormSubmitButton'

import {MappedFormSLAPolicy} from '../controllers/makeMappedFormSLAPolicy'
import {SLAFormValues} from '../controllers/useFormValues'

import ChannelSelectBox from './ChannelSelectBox'
import FormField from './FormField'
import FormSection from './FormSection'
import MetricsFieldArray from './MetricsFieldArray'
import css from './SLAFormView.less'
import ToggleInputFormField from './ToggleInputFormField'

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
                                name="active"
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
