import React, {useCallback, useState, useEffect} from 'react'
import {Col, Row} from 'reactstrap'
import {isEmpty} from 'lodash'

import {PhoneCountry} from 'business/twilio'
import {AddressType, AddressInformation} from 'models/integration/types'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import InputField from 'pages/common/forms/InputField'
import {SelectableOption} from 'pages/common/forms/SelectField/types'

import rawCountries from './options/countries.json'
import css from './PhoneAddressInformation.less'

const countries: SelectableOption[] = rawCountries

type Props = {
    value: Partial<AddressInformation>
    onChange: (value: Partial<AddressInformation>) => void
}

export default function PhoneAddressInformation({
    value,
    onChange,
}: Props): JSX.Element {
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')
    const isDisabled = value.country === PhoneCountry.FR

    const countryName = value.country
        ? countries.find((c) => c.value === value.country)?.label ??
          value.country
        : ''

    const handleChange = useCallback(
        (key: keyof AddressInformation, changedValue: string) => {
            onChange({
                ...value,
                [key]: changedValue,
            })
        },
        [value, onChange]
    )

    useEffect(() => {
        const address = isEmpty(address2)
            ? address1
            : [address1, address2].join(', ')
        if (address !== value.address) {
            handleChange('address', address)
        }
    }, [value.address, address1, address2, handleChange])

    return (
        <div className={css.container}>
            <h4 className="mb-3">Address verification</h4>
            <Row className="mb-3">
                <Col className="pr-0">
                    <PreviewRadioButton
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
                        isSelected={value.type === AddressType.Personal}
                        isDisabled={isDisabled}
                        label="Personal information"
                        onClick={() =>
                            handleChange('type', AddressType.Personal)
                        }
                    />
                </Col>
            </Row>
            <InputField
                label={
                    value.type === AddressType.Personal
                        ? 'Name'
                        : 'Business name'
                }
                required
                value={value.business_name ?? ''}
                disabled={isDisabled}
                onChange={(value: string) =>
                    handleChange('business_name', value)
                }
            />
            <InputField
                label="Address 1"
                required
                value={address1}
                onChange={setAddress1}
                disabled={isDisabled}
            />
            <Row>
                <Col className="pr-0">
                    <InputField
                        label="Address 2"
                        value={address2}
                        onChange={setAddress2}
                        disabled={isDisabled}
                    />
                </Col>
                <Col>
                    <InputField
                        label="City"
                        required
                        value={value.city}
                        onChange={(value: string) =>
                            handleChange('city', value)
                        }
                        disabled={isDisabled}
                    />
                </Col>
            </Row>
            <Row>
                <Col className="pr-0">
                    <InputField
                        label="State/Province/Region"
                        required
                        value={value.region}
                        onChange={(value: string) =>
                            handleChange('region', value)
                        }
                        disabled={isDisabled}
                    />
                </Col>
                <Col className="pr-0">
                    <InputField
                        label="Postal Code"
                        required
                        value={value.postal_code}
                        onChange={(value: string) =>
                            handleChange('postal_code', value)
                        }
                        disabled={isDisabled}
                    />
                </Col>
                <Col>
                    <InputField
                        label="Country"
                        required
                        value={countryName}
                        disabled
                    />
                </Col>
            </Row>
        </div>
    )
}
