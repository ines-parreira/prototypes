import React from 'react'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

const FlowVariablePicker = () => {
    return (
        <>
            <Button size="small" intent="secondary">
                {`{ }`} variables
                <ButtonIconLabel icon="arrow_drop_down" position="right" />
            </Button>
        </>
    )
}

export default FlowVariablePicker
