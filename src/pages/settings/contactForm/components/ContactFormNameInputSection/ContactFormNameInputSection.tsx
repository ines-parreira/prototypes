import React, {useMemo, useCallback, useEffect, useState} from 'react'
import _debounce from 'lodash/debounce'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import Label from 'pages/common/forms/Label/Label'
import {getNameValidationError} from 'pages/settings/helpCenter/utils/validations'
import {catchAsync} from 'pages/settings/contactForm/utils/errorHandling'
import InputField from 'pages/common/forms/input/InputField'

type ContactFormNameInputSectionProps = {
    onChange: (name: string) => void
    contactFormName: string
    isRequiredShown?: boolean
    checkContactFormName: (name: string) => Promise<boolean>
    isApiReady: boolean
    isNameCheckEnabled?: boolean
    setIsNameInvalid?: (isValid: boolean) => void
}

const NAME_CHECK_DEBOUNCE_TIMEOUT = 500

const ContactFormNameInputSection = ({
    onChange,
    contactFormName,
    checkContactFormName,
    isApiReady,
    isRequiredShown = false,
    isNameCheckEnabled = true,
    setIsNameInvalid,
}: ContactFormNameInputSectionProps): JSX.Element => {
    const [isFormNameAvailable, setIsFormNameAvailable] = useState(true)
    const nameError = useMemo(() => {
        const validationError = getNameValidationError(contactFormName)
        const nameInUseError =
            !isFormNameAvailable &&
            'This contact form name is already in use. Try a different name.'

        const error = validationError || nameInUseError || undefined

        setIsNameInvalid && setIsNameInvalid(Boolean(error))

        return isNameCheckEnabled ? error : undefined
    }, [
        setIsNameInvalid,
        contactFormName,
        isFormNameAvailable,
        isNameCheckEnabled,
    ])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const checkNameAvailability = useCallback(
        _debounce(async (name: string) => {
            if (!isApiReady || !isNameCheckEnabled) return

            const [error, result] = await catchAsync(() =>
                checkContactFormName(name)
            )

            setIsFormNameAvailable(!error && !!result)
        }, NAME_CHECK_DEBOUNCE_TIMEOUT),
        [isApiReady, checkContactFormName, isNameCheckEnabled]
    )

    const onNameChange = (name: string) => {
        onChange(name)
    }

    useEffect(() => {
        // It's needed to set setIsFormNameAvailable(true) to reset the availability error after
        // user changed the name that was already used to a new one (until it was checked again)
        setIsFormNameAvailable(true)
        if (contactFormName) void checkNameAvailability(contactFormName)
        return () => checkNameAvailability.cancel()
    }, [checkNameAvailability, contactFormName])

    return (
        <>
            <Label
                className={contactFormCss.mbXs}
                isRequired={isRequiredShown}
                htmlFor="name"
            >
                Contact form name
            </Label>
            <InputField
                isRequired={isRequiredShown}
                data-testid="name"
                id="name"
                type="text"
                name="name"
                placeholder={`Contact Form Name`}
                value={contactFormName}
                onChange={onNameChange}
                error={nameError}
            />
        </>
    )
}

export default ContactFormNameInputSection
