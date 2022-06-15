import React, {useCallback} from 'react'
import {Col, Row, FormGroup} from 'reactstrap'

import {PhoneCountry} from 'business/twilio'
import {AddressType} from 'models/integration/types'
import {AddressInformation} from 'models/phoneNumber/types'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import InputField from 'pages/common/forms/input/InputField'
import {countryName} from 'pages/phoneNumbers/utils'

type Props = {
    value: Partial<AddressInformation>
    onChange: (value: Partial<AddressInformation>) => void
}

export default function PhoneAddressFields({
    value,
    onChange,
}: Props): JSX.Element {
    const isDisabled = value.country === PhoneCountry.FR

    const handleChange = useCallback(
        (key: keyof AddressInformation, changedValue: string) => {
            onChange({
                ...value,
                [key]: changedValue,
            })
        },
        [value, onChange]
    )

    return (
        <div>
            <Row className="mb-3">
                <Col className="pr-0">
                    <PreviewRadioButton
                        value={AddressType.Company}
                        isSelected={value.type === AddressType.Company}
                        isDisabled={isDisabled}
                        label="Business information"
                        onClick={() =>
                            handleChange('type', AddressType.Company)
                        }
                    />
                </Col>
                <Col>
                    <PreviewRadioButton
                        value={AddressType.Personal}
                        isSelected={value.type === AddressType.Personal}
                        isDisabled={isDisabled}
                        label="Personal information"
                        onClick={() =>
                            handleChange('type', AddressType.Personal)
                        }
                    />
                </Col>
            </Row>
            <FormGroup>
                <InputField
                    label={
                        value.type === AddressType.Personal
                            ? 'Name'
                            : 'Business name'
                    }
                    isRequired
                    value={value.business_name ?? ''}
                    isDisabled={isDisabled}
                    onChange={(value: string) =>
                        handleChange('business_name', value)
                    }
                />
            </FormGroup>
            <FormGroup>
                <InputField
                    label="Address"
                    isRequired
                    value={value.address}
                    onChange={(value: string) => handleChange('address', value)}
                    isDisabled={isDisabled}
                    placeholder="Street address, apartment, suite etc."
                    caption={
                        value.country === PhoneCountry.AU
                            ? 'Note: PO Boxes are not allowed for local Australian numbers.'
                            : undefined
                    }
                />
            </FormGroup>
            <Row>
                <Col className="pr-0">
                    <FormGroup>
                        <InputField
                            label="City"
                            isRequired
                            value={value.city}
                            onChange={(value: string) =>
                                handleChange('city', value)
                            }
                            isDisabled={isDisabled}
                        />
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <InputField
                            label="State/Province/Region"
                            isRequired
                            value={value.region}
                            onChange={(value: string) =>
                                handleChange('region', value)
                            }
                            isDisabled={isDisabled}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col className="pr-0">
                    <FormGroup>
                        <InputField
                            label="Postal Code"
                            isRequired
                            value={value.postal_code}
                            onChange={(value: string) =>
                                handleChange('postal_code', value)
                            }
                            isDisabled={isDisabled}
                        />
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <InputField
                            label="Country"
                            isRequired
                            value={
                                value.country
                                    ? countryName(value.country)
                                    : value.country
                            }
                            isDisabled
                        />
                    </FormGroup>
                </Col>
            </Row>
        </div>
    )
}
