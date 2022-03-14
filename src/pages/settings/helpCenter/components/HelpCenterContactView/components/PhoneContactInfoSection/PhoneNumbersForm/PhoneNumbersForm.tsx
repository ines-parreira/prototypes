import React from 'react'
import classNames from 'classnames'
import {FormGroup, Label} from 'reactstrap'
import {produce} from 'immer'

import Button from 'pages/common/components/button/Button'

import {ContactPhoneNumber} from '../../../../../../../../models/helpCenter/types'
import InputField from '../../../../../../../common/forms/InputField'
import PhoneNumberInput from '../../../../../../../common/forms/PhoneNumberInput/PhoneNumberInput'

import css from './PhoneNumbersForm.less'

type Props = {
    phoneNumbers: ContactPhoneNumber[]
    onChange: (phoneNumbers: ContactPhoneNumber[]) => void
    disabled: boolean
}

const PhoneNumbersForm: React.FC<Props> = ({
    phoneNumbers,
    onChange,
    disabled,
}: Props) => {
    const addPhoneNumber = () => {
        const phoneNumber: ContactPhoneNumber = {
            reference: '',
            phone_number: '',
        }

        onChange([...phoneNumbers, phoneNumber])
    }

    const changePhoneNumber =
        (key: keyof ContactPhoneNumber, index: number) => (value: string) => {
            const numbers = produce(phoneNumbers, (draftPhoneNumbers) => {
                draftPhoneNumbers[index][key] = value
            })

            onChange(numbers)
        }

    const removePhoneNumber = (index: number) => {
        const numbers = [...phoneNumbers]

        numbers.splice(index, 1)

        onChange(numbers)
    }

    return (
        <>
            {phoneNumbers.length > 0 && (
                <div className={css.phoneNumbers}>
                    <FormGroup>
                        <Label className="control-label">Reference</Label>
                        {phoneNumbers.map((phoneNumber, index) => (
                            <InputField
                                key={`${phoneNumber.phone_number}-${index}`}
                                value={phoneNumber.reference}
                                onChange={changePhoneNumber('reference', index)}
                                disabled={disabled}
                            />
                        ))}
                    </FormGroup>
                    <FormGroup>
                        <Label className="control-label">Phone number</Label>
                        {phoneNumbers.map((phoneNumber, index) => (
                            <div
                                key={`${phoneNumber.reference}-${index}`}
                                className="d-flex"
                            >
                                <PhoneNumberInput
                                    value={phoneNumber.phone_number}
                                    onChange={changePhoneNumber(
                                        'phone_number',
                                        index
                                    )}
                                    className={css.phoneNumberInput}
                                    disabled={disabled}
                                />
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.deleteIcon,
                                        {
                                            [css.disabled]: disabled,
                                        }
                                    )}
                                    onClick={() => removePhoneNumber(index)}
                                >
                                    delete
                                </i>
                            </div>
                        ))}
                    </FormGroup>
                </div>
            )}
            <Button
                isDisabled={disabled}
                intent="secondary"
                onClick={addPhoneNumber}
            >
                <i className="material-icons">add</i>&nbsp;Add Number
            </Button>
        </>
    )
}

export default PhoneNumbersForm
