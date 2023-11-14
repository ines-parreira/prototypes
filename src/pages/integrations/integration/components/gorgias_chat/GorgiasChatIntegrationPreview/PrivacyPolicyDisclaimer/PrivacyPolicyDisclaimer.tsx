import React from 'react'
import styled from '@emotion/styled'
import CloseIcon from 'gorgias-design-system/Launcher/icons/CloseIcon'
import {gorgiasColors} from 'gorgias-design-system/styles'

type Variant = 'collapsed' | 'expanded'

const PrivacyPolicyDisclaimerDiv = styled.div<{
    variant?: Variant
}>`
    display: flex;
    gap: 8px;
    padding: 12px 16px 12px 16px;
    margin: 20px 20px 12px 20px;
    align-items: center;
    align-self: stretch;
    justify-content: space-between;
    border-radius: 8px;

    background-color: #ffffff33;
    color: var(--neutral-grey-0, #fff);

    font-size: 12px;
    line-height: 16px;

    svg {
        width: 20px;
        height: 20px;
    }

    a {
        color: inherit;
        text-decoration: underline !important;
        :hover {
            font-weight: 500;
        }
    }

    ${({variant}) =>
        variant === 'expanded' &&
        `color: var(--neutral-grey-5, #6a6a6a);
        padding: 20px 28px 12px;
        text-align: center;
        margin-bottom: 0;
        
        > * {
            width: 100%;
        }
        `}
`

interface Props {
    privacyPolicyDisclaimerText: string
    variant?: Variant
}

const PrivacyPolicyDisclaimer: React.FC<Props> = ({
    privacyPolicyDisclaimerText,
    variant,
}: Props) => (
    <PrivacyPolicyDisclaimerDiv variant={variant}>
        <div
            dangerouslySetInnerHTML={{__html: privacyPolicyDisclaimerText}}
        ></div>
        {variant === 'collapsed' && (
            <CloseIcon color={gorgiasColors.neutralGrey0} />
        )}
    </PrivacyPolicyDisclaimerDiv>
)

export default PrivacyPolicyDisclaimer
