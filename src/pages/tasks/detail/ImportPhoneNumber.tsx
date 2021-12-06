import React, {FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Form, FormGroup, Container, Label, Input} from 'reactstrap'
import classnames from 'classnames'
import {AxiosError} from 'axios'
import {fromJS, Map} from 'immutable'

import SelectField from '../../common/forms/SelectField/SelectField'
import PhoneNumberInput from '../../common/forms/PhoneNumberInput/PhoneNumberInput'
import PageHeader from '../../common/components/PageHeader'
import {Option} from '../../common/forms/SelectField/types'
import rawTypeOptions from '../../integrations/detail/components/phone/options/types.json'
import client from '../../../models/api/resources'
import {
    Notification,
    NotificationStatus,
} from '../../../state/notifications/types'
import {notify as notifyAction} from '../../../state/notifications/actions'
import {getCountryFromPhoneNumber} from '../../common/forms/PhoneNumberInput/utils'

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
            <Container fluid className="page-container">
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
