import React, {ReactNode, RefObject} from 'react'
import {Popover, PopoverBody} from 'reactstrap'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

type Props = {
    featureName: string
    iconRef: RefObject<HTMLElement>
    onButtonClick: () => void
    isOpened: boolean
    setIsOpened: (isOpened: boolean) => void
    buttonContent?: ReactNode
    buttonClassName?: string
}

const PaywallPopover = ({
    featureName,
    iconRef,
    onButtonClick,
    isOpened,
    setIsOpened,
    buttonContent,
    buttonClassName,
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
                        className={buttonClassName ? buttonClassName : 'mt-3'}
                        onClick={onButtonClick}
                    >
                        {buttonContent ? (
                            buttonContent
                        ) : (
                            <ButtonIconLabel icon="auto_awesome">
                                Get This Feature
                            </ButtonIconLabel>
                        )}
                    </Button>
                </PopoverBody>
            </Popover>
        )
    )
}

export default PaywallPopover
