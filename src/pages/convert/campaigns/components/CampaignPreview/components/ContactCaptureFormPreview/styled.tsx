import styled from '@emotion/styled'
import Button from 'gorgias-design-system/Buttons/Button'
import {gorgiasColors} from 'gorgias-design-system/styles'

export const Wrapper = styled.div`
    box-sizing: border-box;
    width: 100%;
`

export const SubmitButton = styled(Button)`
    margin-top: 16px;
    cursor: pointer;
`

export const Disclaimer = styled.label`
    margin-top: 16px;
    display: flex;
    align-items: flex-start;
    gap: 8px;

    a {
        color: ${gorgiasColors.primary};
    }

    input {
        margin-top: 5px;
    }
`
export const ErrorMessage = styled.span`
    color: ${gorgiasColors.supportingRed5};
    font-size: 12px;
    font-weight: 400;
`

export const MailInput = styled.input`
    box-sizing: border-box;
    width: 100%;
    border: 1px solid rgba(221, 221, 221, 1);
    border-radius: 4px;
    padding: 12px;
    font-size: 14px;
    margin-top: 12px;

    &:focus {
        outline: none;
    }

    ::placeholder {
        color: rgba(106, 106, 106, 1);
    }
`
