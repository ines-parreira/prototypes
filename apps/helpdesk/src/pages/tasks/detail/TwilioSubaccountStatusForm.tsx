import type { FormEvent } from 'react'
import React, { useEffect, useState } from 'react'

import client from '@repo/api-resources'
import { useAsyncFn } from '@repo/hooks'
import { Container, Form, FormGroup, Input, Label } from 'reactstrap'

import { LegacyButton as Button, toast } from '@gorgias/axiom'

import PageHeader from 'pages/common/components/PageHeader'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { errorToChildren } from 'utils'

export enum TwilioSubaccountStatus {
    Active = 'active',
    Suspended = 'suspended',
    Closed = 'closed',
}
type StatusData = {
    status: TwilioSubaccountStatus
    sub_account_sid: string
}

const stripHtmlTags = (message: string) =>
    message.replace(/<[^>]*>/g, '').trim()

const TwilioSubaccountStatusForm = (): JSX.Element => {
    const [formData, setFormData] = useState<Maybe<StatusData>>()
    const [isLoading, setIsLoading] = useState(false)
    const [formChanged, setFormChanged] = useState(false)

    const [, handleFetchSubaccountData] = useAsyncFn(async () => {
        try {
            const res = await client.get<{
                data: StatusData
            }>(`/api/integrations/phone/tasks`)
            if (!res) {
                return
            }
            setFormData({ ...formData, ...res.data.data })
        } catch {
            toast.error('Failed to fetch Twilio Subaccount data')
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
            toast.error('Cannot use this feature to Close a Subaccount')
            setIsLoading(false)
            return
        }

        const data = {
            name: 'set_subaccount_status',
            params: formData,
        }

        try {
            await client.post(`/api/integrations/phone/tasks`, data)

            toast.success('Twilio Subaccount updated successfully.')
        } catch (error) {
            toast.error('Failed to update subaccount status', {
                caption: stripHtmlTags(String(errorToChildren(error) ?? '')),
            })
        } finally {
            setFormChanged(false)
            setIsLoading(false)
        }
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
                                    TwilioSubaccountStatus,
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
