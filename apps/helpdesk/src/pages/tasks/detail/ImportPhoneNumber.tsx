import type { FormEvent } from 'react'
import React, { useState } from 'react'

import client from '@repo/api-resources'
import type { AxiosError } from 'axios'
import classnames from 'classnames'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Button, Container, Form, FormGroup, Input, Label } from 'reactstrap'

import { toast } from '@gorgias/axiom'

import PageHeader from 'pages/common/components/PageHeader'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import type { Option } from 'pages/common/forms/SelectField/types'
import rawTypeOptions from 'pages/integrations/integration/components/phone/options/types.json'
import { getCountryFromPhoneNumber } from 'pages/phoneNumbers/utils'
import settingsCss from 'pages/settings/settings.less'

const typeOptions: Option[] = rawTypeOptions

type Errors = {
    phone_number?: string
    area_code?: string
    type?: string
}

const ImportPhoneNumber = () => {
    const [formData, setFormData] = useState<Map<any, any>>(fromJS({}))
    const [isLoading, setIsLoading] = useState(false)

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

            toast.success('Number ported successfully.')
        } catch (error) {
            const { response } = error as AxiosError<{
                error: { data?: Errors }
            }>

            if (response) {
                toast.error(JSON.stringify(response.data.error.data))
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
                                    formData.set('area_code', e.target.value),
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
                                    formData.set('state', e.target.value),
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
                            style={{ display: 'inline-block' }}
                            value={formData.get('phone_number_type') || ''}
                            onChange={(value) =>
                                setFormData(
                                    formData.set('phone_number_type', value),
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

export default ImportPhoneNumber
