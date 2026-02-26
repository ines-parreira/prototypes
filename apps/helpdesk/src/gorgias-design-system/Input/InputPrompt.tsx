/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'

import IconButton from 'gorgias-design-system/Buttons/IconButton'
import { getContrastColor } from 'gorgias-design-system/utils'
import type { ChatTheme } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview'

import ArrowIcon from './icons/ArrowIcon'
import type { TextFieldProps } from './TextField'
import TextField from './TextField'

const IconButtonContainer = styled.div`
    height: 44px;
    min-width: 44px;

    margin-top: 24px;
`

const InputPromptContainer = styled.div`
    display: flex;
    gap: 4px;
`

type InputPromptProps = TextFieldProps

const InputPrompt: React.FC<InputPromptProps> = ({
    isFilled,
    disabled,
    ...props
}) => {
    const { mainColor } = useTheme() as ChatTheme

    return (
        <InputPromptContainer>
            <TextField
                {...props}
                disabled={disabled}
                isFilled={isFilled}
                isAlternative
            />
            {!isFilled && (
                <IconButtonContainer>
                    <IconButton
                        disabled={disabled}
                        fill="filled"
                        variant="primary"
                        icon={
                            <ArrowIcon
                                fillColor={getContrastColor(mainColor)}
                            />
                        }
                    />
                </IconButtonContainer>
            )}
        </InputPromptContainer>
    )
}

export default InputPrompt
