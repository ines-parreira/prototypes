import React, {FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Form, FormGroup, Container, Label, Input} from 'reactstrap'
import classnames from 'classnames'
import {AxiosError} from 'axios'
import {fromJS, Map} from 'immutable'

import client from 'models/api/resources'
import PageHeader from 'pages/common/components/PageHeader'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Option} from 'pages/common/forms/SelectField/types'
import {getCountryFromPhoneNumber} from 'pages/common/forms/PhoneNumberInput/utils'
import rawTypeOptions from 'pages/integrations/integration/components/phone/options/types.json'
import {notify as notifyAction} from 'state/notifications/actions'
import {Notification, NotificationStatus} from 'state/notifications/types'

import settingsCss from 'pages/settings/settings.less'

const typeOptions: Option[] = rawTypeOptions

type Props = ConnectedProps<typeof connector>
type Errors = {
    phone_number?: string
    area_code?: string
    type?: string
}

const ImportPhoneNumber = ({notify}: Props) => {
    const [formData, setFormData] = React.useState<Map<any, any>>(fromJS({}))
    const [isLoading, setIsLoading] = React.useState(false)

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setIsLoading(true)

        const data = {
            name: 'import_phone_number',
            params: {
                ...formData.toJS(),
                country: formData.get('phone_number')
                    ? getCountryFromPhoneNumber(formData.get('phone_number'))
                    : null,
            },
        }

        try {
            await client.post(`/api/integrations/phone/tasks`, data)

            const notification: Notification = {
                status: NotificationStatus.Success,
                message: 'Number ported successfully.',
            }

            void (await notify(notification))
        } catch (error) {
            const {response} = error as AxiosError<{error: {data?: Errors}}>

            if (response) {
                const notification: Notification = {
                    status: NotificationStatus.Error,
                    message: JSON.stringify(response.data.error.data),
                }

                void (await notify(notification))
            } else {
                throw error
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="full-width">
            <PageHeader title="Import phone number" />
            <Container fluid className={settingsCss.pageContainer}>
                <Form className="mb-4 col-sm-4" onSubmit={onSubmit}>
                    <FormGroup>
                        <PhoneNumberInput
                            label="Phone number to be ported"
                            value={formData.get('phone_number') || ''}
                            onChange={(value) =>
                                setFormData(formData.set('phone_number', value))
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <div>
                            <Label
                                htmlFor="area_code"
                                className="control-label"
                            >
                                Area Code
                            </Label>
                        </div>
                        <Input
                            id="area_code"
                            value={formData.get('area_code') || ''}
                            onChange={(e) =>
                                setFormData(
                                    formData.set('area_code', e.target.value)
                                )
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <div>
                            <Label htmlFor="state" className="control-label">
                                State
                            </Label>
                        </div>
                        <Input
                            id="state"
                            value={formData.get('state') || ''}
                            onChange={(e) =>
                                setFormData(
                                    formData.set('state', e.target.value)
                                )
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <div>
                            <Label htmlFor="type" className="control-label">
                                Type
                            </Label>
                        </div>
                        <SelectField
                            id="type"
                            options={typeOptions}
                            style={{display: 'inline-block'}}
                            value={formData.get('phone_number_type') || ''}
                            onChange={(value) =>
                                setFormData(
                                    formData.set('phone_number_type', value)
                                )
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <Button
                            type="submit"
                            color="success"
                            className={classnames('mt-5', {
                                'btn-loading': isLoading,
                            })}
                            disabled={isLoading}
                        >
                            Start porting
                        </Button>
                    </FormGroup>
                </Form>
            </Container>
        </div>
    )
}

const mapDispatchToProps = {
    notify: notifyAction,
}

const connector = connect(null, mapDispatchToProps)

export default connector(ImportPhoneNumber)
