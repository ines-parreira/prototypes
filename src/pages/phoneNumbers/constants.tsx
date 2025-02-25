import React from 'react'

import { PhoneCountry } from 'business/twilio'

export enum CustomNotifications {
    UPGRADE_MESSAGE = 'UPGRADE_MESSAGE',
}

const PHONE_NUMBER_REQUEST_FORM_BASE_URL = 'https://link.gorgias.com'

export const validationAlertMessages: Record<string, React.JSX.Element> = {
    [PhoneCountry.DE]: (
        <>
            Submit a German local and mobile phone numbers through the{' '}
            <a
                href={`${PHONE_NUMBER_REQUEST_FORM_BASE_URL}/ger`}
                target="_blank"
                rel="noopener noreferrer"
            >
                German phone number request form
            </a>
            .
            <br />
            We do not currently offer toll-free German phone numbers.
        </>
    ),
    [PhoneCountry.NZ]: (
        <>
            Submit a request for New Zealand local phone numbers through the{' '}
            <a
                href={`${PHONE_NUMBER_REQUEST_FORM_BASE_URL}/nzl`}
                target="_blank"
                rel="noopener noreferrer"
            >
                New Zealand phone number request form
            </a>
            .
            <br />
            We do not currently offer mobile or toll-free New Zealand phone
            numbers.
        </>
    ),
    [PhoneCountry.AU]: (
        <>
            Submit a request for Australian mobile numbers through the{' '}
            <a
                href={`${PHONE_NUMBER_REQUEST_FORM_BASE_URL}/aus`}
                target="_blank"
                rel="noopener noreferrer"
            >
                Australian phone number request form
            </a>
            .
        </>
    ),
    [PhoneCountry.FR]: (
        <>
            Submit a request for a French local and national phone numbers
            request through the{' '}
            <a
                href={`${PHONE_NUMBER_REQUEST_FORM_BASE_URL}/frn`}
                target="_blank"
                rel="noopener noreferrer"
            >
                French phone number request form
            </a>
            .
        </>
    ),
    [PhoneCountry.GB]: (
        <>
            Submit a request for UK Local, National, and mobile phone numbers
            through the{' '}
            <a
                href={`${PHONE_NUMBER_REQUEST_FORM_BASE_URL}/ukb`}
                target="_blank"
                rel="noopener noreferrer"
            >
                UK phone number request form
            </a>
            .
        </>
    ),
}
