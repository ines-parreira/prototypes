import React, {RefObject} from 'react'
import {Popover, PopoverBody} from 'reactstrap'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

type Props = {
    featureName: string
    iconRef: RefObject<HTMLElement>
    onButtonClick: () => void
    isOpened: boolean
    setIsOpened: (isOpened: boolean) => void
}

const PaywallPopover = ({
    featureName,
    iconRef,
    onButtonClick,
    isOpened,
    setIsOpened,
}: Props) => {
    return (
        iconRef.current && (
            <Popover
                placement="top"
                isOpen={isOpened}
                toggle={() => {
                    setIsOpened(!isOpened)
                }}
                target={iconRef.current}
                trigger="focus hover"
                boundariesElement="window"
            >
                <PopoverBody className="d-flex p-3 flex-column align-items-center">
                    Subscribe to the {featureName} <br /> to unlock this feature
                    <Button
                        size="small"
                        className="mt-3"
                        onClick={onButtonClick}
                    >
                        <ButtonIconLabel icon="auto_awesome">
                            Get This Feature
                        </ButtonIconLabel>
                    </Button>
                </PopoverBody>
            </Popover>
        )
    )
}

export default PaywallPopover
