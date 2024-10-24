import React, {FormEvent, useEffect, useState} from 'react'
import {Form, FormGroup, Container, Label, Input} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import useAsyncFn from 'hooks/useAsyncFn'
import client from 'models/api/resources'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {errorToChildren} from 'utils'

export enum TwilioSubaccountStatus {
    Active = 'active',
    Suspended = 'suspended',
    Closed = 'closed',
}
type StatusData = {
    status: TwilioSubaccountStatus
    sub_account_sid: string
    is_sms_enabled: boolean | null
}

const TwilioSubaccountStatusForm = (): JSX.Element => {
    const [formData, setFormData] = useState<Maybe<StatusData>>()
    const [isLoading, setIsLoading] = useState(false)
    const [formChanged, setFormChanged] = useState(false)
    const dispatch = useAppDispatch()

    const [, handleFetchSubaccountData] = useAsyncFn(async () => {
        try {
            const res = await client.get<{
                data: StatusData
            }>(`/api/integrations/phone/tasks`)
            if (!res) {
                return
            }
            setFormData({...formData, ...res.data.data})
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to fetch Twilio Subaccount data',
                    status: NotificationStatus.Error,
                })
            )
        }
    })

    useEffect(() => {
        void handleFetchSubaccountData()
    }, [handleFetchSubaccountData])

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setIsLoading(true)

        if (!formData) {
            return
        }

        if (formData.status === TwilioSubaccountStatus.Closed) {
            void dispatch(
                notify({
                    message: 'Cannot use this feature to Close a Subaccount',
                    status: NotificationStatus.Error,
                })
            )
            setIsLoading(false)
            return
        }

        const data = {
            name: 'set_subaccount_status',
            params: formData,
        }

        try {
            await client.post(`/api/integrations/phone/tasks`, data)

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Twilio Subaccount updated successfully.',
                })
            )
        } catch (error) {
            void dispatch(
                notify({
                    title: 'Failed to update subaccount status',
                    message: errorToChildren(error)!,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
        } finally {
            setFormChanged(false)
            setIsLoading(false)
        }
    }

    const handleSmsToggle = (isToggled: boolean) => {
        setFormData((prevData) => {
            if (!prevData) return prevData
            return {
                ...prevData,
                is_sms_enabled: isToggled,
            }
        })
        setFormChanged(true)
    }

    return (
        <div className="full-width">
            <PageHeader title="Twilio Subaccount Status" />
            <Container fluid className="page-container mt-4">
                {formData && (
                    <Form className="mb-4 col-sm-4" onSubmit={onSubmit}>
                        <FormGroup>
                            <div>
                                <Label
                                    htmlFor="sub_account_sid"
                                    className="control-label"
                                >
                                    Twilio Subaccount SID
                                </Label>
                            </div>
                            <Input
                                id="sub_account_sid"
                                value={formData.sub_account_sid || ''}
                                disabled={true}
                            />
                        </FormGroup>
                        <FormGroup>
                            <div>
                                <Label
                                    htmlFor="status"
                                    className="control-label"
                                >
                                    Status
                                </Label>
                            </div>
                            <SelectField
                                id="status"
                                options={Object.keys(
                                    TwilioSubaccountStatus
                                ).map((status) => ({
                                    label: status,
                                    value: status.toLowerCase(),
                                }))}
                                value={formData.status || ''}
                                onChange={(status) => {
                                    setFormData({
                                        ...formData,
                                        status: status as TwilioSubaccountStatus,
                                    })
                                    setFormChanged(true)
                                }}
                                fullWidth
                            />
                        </FormGroup>
                        <FormGroup>
                            <div>
                                <ToggleInput
                                    isToggled={
                                        formData.is_sms_enabled === true ||
                                        formData.is_sms_enabled === null
                                    }
                                    onClick={handleSmsToggle}
                                    caption="Enable/Disable SMS for this account"
                                >
                                    <span
                                        style={{
                                            color:
                                                formData.is_sms_enabled ===
                                                false
                                                    ? 'red'
                                                    : 'green',
                                        }}
                                    >
                                        {formData.is_sms_enabled === false
                                            ? 'SMS Disabled'
                                            : 'SMS Enabled'}
                                    </span>
                                </ToggleInput>
                            </div>
                        </FormGroup>
                        <FormGroup className="mt-4">
                            <Button
                                type="submit"
                                intent="primary"
                                isDisabled={!formChanged}
                                isLoading={isLoading}
                            >
                                Save changes
                            </Button>
                        </FormGroup>
                    </Form>
                )}
            </Container>
        </div>
    )
}

export default TwilioSubaccountStatusForm
