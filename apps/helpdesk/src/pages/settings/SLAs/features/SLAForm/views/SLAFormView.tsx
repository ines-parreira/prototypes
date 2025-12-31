import { useState } from 'react'

import { Form, FormField, FormSubmitButton } from '@repo/forms'
import type { FormValidator } from '@repo/forms'
import { history } from '@repo/routing'

import { Box, LegacyButton as Button, TextField } from '@gorgias/axiom'

import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import PageHeader from 'pages/settings/SLAs/features/PageHeader/PageHeader'
import { DeleteModal } from 'pages/settings/SLAs/features/SLAForm/views/DeleteModal'
import { PolicySection } from 'pages/settings/SLAs/features/SLAForm/views/PolicySection'

import type { MappedFormSLAPolicy } from '../controllers/makeMappedFormSLAPolicy'
import type { SLAFormValues } from '../controllers/useFormValues'
import { ChannelSelectBox } from './ChannelSelectBox'

import css from './SLAFormView.less'

type SLAFormViewProps = {
    policy: MappedFormSLAPolicy | undefined
    values: SLAFormValues
    defaultValues: SLAFormValues
    onSubmit: (data: SLAFormValues) => void
    isLoading?: boolean
    validator: FormValidator<SLAFormValues>
}

export function SLAFormView({
    policy,
    defaultValues,
    values,
    onSubmit,
    isLoading,
    validator,
}: SLAFormViewProps) {
    const [isArchiveModalOpen, setArchiveModalOpen] = useState(false)

    return (
        <div className={css.page}>
            <PageHeader
                secondaryBreadcrumb={policy ? policy.name : 'New SLA'}
                showCreateButtons={false}
            />
            <SettingsPageContainer>
                <SettingsContent>
                    <Form
                        defaultValues={defaultValues}
                        values={values}
                        onValidSubmit={onSubmit}
                        validator={validator}
                    >
                        <Box flexDirection="column" gap="lg">
                            <FormField
                                field={TextField}
                                name="name"
                                label="SLA name"
                                placeholder="e.g. Chat SLA"
                                isRequired
                            />

                            <ChannelSelectBox />

                            <PolicySection />

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
                        </Box>
                    </Form>
                    <DeleteModal
                        policyId={policy?.uuid || ''}
                        isOpen={isArchiveModalOpen}
                        onClose={() => {
                            setArchiveModalOpen(false)
                        }}
                    />
                </SettingsContent>
            </SettingsPageContainer>
        </div>
    )
}
