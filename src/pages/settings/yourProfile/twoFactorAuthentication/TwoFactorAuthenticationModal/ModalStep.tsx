import React from 'react'

type OwnProps = {
    currentStep: number
}

export default function ModalStep({currentStep}: OwnProps) {
    switch (currentStep) {
        case 1:
            return <>QR Code step</>
        case 2:
            return <>Validate authenticator code step</>
        case 3:
            return <>Recovery codes step</>
        default:
            return <></>
    }
}
