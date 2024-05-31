import React from 'react'
import classNames from 'classnames'

import PageHeader from 'pages/settings/SLAs/features/PageHeader/PageHeader'
import Label from 'pages/common/forms/Label/Label'
import NumberInput from 'pages/common/forms/input/NumberInput'
import Button from 'pages/common/components/button/Button'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import settingsCss from 'pages/settings/settings.less'
import FormSubmitButton from 'pages/settings/SLAs/features/SLAForm/views/FormSubmitButton'
import {DeleteModal} from 'pages/settings/SLAs/features/SLAForm/views/DeleteModal'
import history from 'pages/history'

import {MappedFormSLAPolicy} from '../controllers/makeMappedFormSLAPolicy'

import TimeUnitSelectBox from './TimeUnitSelectBox'
import FormField from './FormField'
import Form from './Form'
import ChannelSelectBox from './ChannelSelectBox'
import ToggleInputFormField from './ToggleInputFormField'
import css from './SLAFormView.less'

type SLAFormViewProps = {
    policy: MappedFormSLAPolicy | undefined
    defaultValues: Record<string, unknown>
    onSubmit: (data: MappedFormSLAPolicy) => void
    isLoading?: boolean
}

export default function SLAFormView({
    policy,
    defaultValues,
    onSubmit,
    isLoading,
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
                    <Form defaultValues={defaultValues} onSubmit={onSubmit}>
                        <div className={settingsCss.mb48}>
                            <FormField
                                fieldName="name"
                                label="SLA name"
                                isRequired
                                className={settingsCss.mb48}
                            />
                            <h2
                                className={classNames(
                                    settingsCss.headingSection,
                                    settingsCss.mb4
                                )}
                            >
                                Conditions
                            </h2>
                            <div
                                className={classNames(
                                    css.infoText,
                                    settingsCss.mb24
                                )}
                            >
                                All conditions should be met in order for this
                                SLA to trigger.
                            </div>
                            <FormField
                                fieldName="target_channels"
                                field={ChannelSelectBox}
                                className={settingsCss.mb8}
                            />
                        </div>
                        <div>
                            <h2
                                className={classNames(
                                    settingsCss.headingSection,
                                    settingsCss.mb4
                                )}
                            >
                                Policy
                            </h2>
                            <div
                                className={classNames(
                                    css.infoText,
                                    settingsCss.mb24
                                )}
                            >
                                Define first response and resolution times to be
                                used as goals by your team(s).
                            </div>
                            <div
                                className={classNames(
                                    css.policiesRow,
                                    settingsCss.mb48
                                )}
                            >
                                <div className={css.policyRow}>
                                    <Label className={settingsCss.mb8}>
                                        <span>First response time</span>
                                        <IconTooltip className={css.labelIcon}>
                                            The time between the first message
                                            from a customer and the first
                                            response from an agent.
                                        </IconTooltip>
                                    </Label>
                                    <div className={css.inputGroup}>
                                        <FormField
                                            fieldName="metrics.FRT.threshold"
                                            field={NumberInput}
                                            isRequired
                                            hasControls={false}
                                            placeholder={'0'}
                                            min={1}
                                        />
                                        <FormField
                                            fieldName="metrics.FRT.unit"
                                            field={TimeUnitSelectBox}
                                        />
                                    </div>
                                </div>
                                <div className={css.policyRow}>
                                    <Label className={settingsCss.mb8}>
                                        <span>Resolution time</span>
                                        <IconTooltip className={css.labelIcon}>
                                            The time from the first message
                                            received from the customer until the
                                            ticket is closed.
                                        </IconTooltip>
                                    </Label>
                                    <div className={css.inputGroup}>
                                        <FormField
                                            fieldName="metrics.RT.threshold"
                                            field={NumberInput}
                                            isRequired
                                            hasControls={false}
                                            placeholder={'0'}
                                            min={1}
                                        />
                                        <FormField
                                            fieldName="metrics.RT.unit"
                                            field={TimeUnitSelectBox}
                                        />
                                    </div>
                                </div>
                            </div>
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
