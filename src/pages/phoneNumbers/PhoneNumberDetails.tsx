import React from 'react'
import {
    Col,
    Row,
    InputGroupAddon,
    InputGroup,
    Button,
    Input,
    Label,
    FormGroup,
} from 'reactstrap'
import {Link} from 'react-router-dom'

import {PhoneNumber, PhoneCountry} from 'models/phoneNumber/types'
import {SelectableOption} from 'pages/common/forms/SelectField/types'

import css from './PhoneNumberDetails.less'

import rawCountries from './options/countries.json'
import rawStates from './options/states.json'

type Props = {
    phoneNumber: PhoneNumber
}

type States = {
    [key: string]: SelectableOption[]
}

const countries: SelectableOption[] = rawCountries
const states: States = rawStates

export function PhoneNumberDetails({phoneNumber}: Props) {
    const state =
        phoneNumber.meta?.country === PhoneCountry.US
            ? states[phoneNumber.meta.country].find(
                  (c) => c.value === phoneNumber.meta.state
              )?.label || ''
            : ''

    const countryName = phoneNumber.meta.country
        ? countries.find((c) => c.value === phoneNumber.meta.country)?.label ??
          phoneNumber.meta.country
        : ''

    return (
        <>
            <Row>
                <Col lg={6} className="pr-lg-0 pr-md-3">
                    <FormGroup>
                        <Label htmlFor="phone-number" className="control-label">
                            Phone number
                        </Label>
                        <InputGroup>
                            <Input
                                id="phone-number"
                                type="text"
                                value={phoneNumber.meta?.friendly_name}
                                readOnly
                            />
                            <InputGroupAddon addonType="append">
                                <Button
                                    className="copy-phone-number-button"
                                    data-clipboard-target="#phone-number"
                                    type="button"
                                >
                                    <i className="material-icons mr-2">
                                        file_copy
                                    </i>
                                    Copy
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col lg={3} className="pr-lg-0 pr-md-3">
                    <FormGroup>
                        <Label className="control-label">Country</Label>
                        <Input value={countryName as string} readOnly />
                    </FormGroup>
                </Col>
                <Col lg={3} className="pr-lg-0 pr-md-3">
                    <FormGroup>
                        <Label className="control-label">Type</Label>
                        <Input value={phoneNumber.meta?.type} readOnly />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                {state && (
                    <Col lg={3} className="pr-lg-0 pr-md-3">
                        <FormGroup>
                            <Label className="control-label">State</Label>
                            <Input value={state as string} readOnly />
                        </FormGroup>
                    </Col>
                )}
                <Col lg={3} className="pr-lg-0 pr-md-3">
                    <FormGroup>
                        <Label className="control-label">Area Code</Label>
                        <Input value={phoneNumber.meta?.area_code} readOnly />
                    </FormGroup>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col lg={6} className="pr-lg-0 pr-md-3">
                    <h4>Connected apps</h4>
                    <Row className="border-bottom py-3  ml-1 mr-1">
                        <Col lg={8}>
                            <i className="material-icons md-2 align-middle mr-2">
                                phone
                            </i>
                            <strong>Voice</strong>
                        </Col>
                        <Col lg={4} className={css.appLink}>
                            <Link
                                to={`/app/settings/integrations/phone/new?phoneNumberId=${phoneNumber.id}`}
                            >
                                <i className="material-icons md-2 align-middle mr-2">
                                    add
                                </i>
                                Add Integration
                            </Link>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

export default PhoneNumberDetails
