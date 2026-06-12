import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { LegacyLabel as Label } from '@gorgias/axiom'
import { debounce, Duration } from '@gorgias/toolkit'

import { DefaultExportInputField as InputField } from 'pages/common/forms/input/InputField'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import { catchAsync } from 'pages/settings/contactForm/utils/errorHandling'
import { getNameValidationError } from 'pages/settings/helpCenter/utils/validations'

type ContactFormNameInputSectionProps = {
    onChange: (name: string) => void
    contactFormName: string
    isRequiredShown?: boolean
    checkContactFormName: (name: string) => Promise<boolean>
    isApiReady: boolean
    isNameCheckEnabled?: boolean
    setIsNameInvalid?: (isValid: boolean) => void
}

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
        debounce(async (name: string) => {
            if (!isApiReady || !isNameCheckEnabled) return

            const [error, result] = await catchAsync(() =>
                checkContactFormName(name),
            )

            setIsFormNameAvailable(!error && !!result)
        }, Duration.millis(500)),
        [isApiReady, checkContactFormName, isNameCheckEnabled],
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

export { ContactFormNameInputSection }
