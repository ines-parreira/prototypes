import React, { ReactNode, RefObject } from 'react'

import { Popover, PopoverBody } from 'reactstrap'

import { useAppNode } from 'appNode'
import Button from 'pages/common/components/button/Button'

type Props = {
    featureName: string
    iconRef: RefObject<HTMLElement>
    onButtonClick: () => void
    isOpened: boolean
    setIsOpened: (isOpened: boolean) => void
    tagline?: ReactNode
    buttonContent?: ReactNode
    buttonClassName?: string
}

const PaywallPopover = ({
    featureName,
    iconRef,
    onButtonClick,
    isOpened,
    setIsOpened,
    tagline,
    buttonContent,
    buttonClassName,
}: Props) => {
    const appNode = useAppNode()

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
                container={appNode ?? undefined}
            >
                <PopoverBody className="d-flex p-3 flex-column align-items-center">
                    {tagline ? (
                        tagline
                    ) : (
                        <>
                            Subscribe to {featureName} <br /> to unlock this
                            feature
                        </>
                    )}
                    <Button
                        size="small"
                        className={buttonClassName ? buttonClassName : 'mt-3'}
                        onClick={onButtonClick}
                    >
                        {buttonContent ? buttonContent : <>Get {featureName}</>}
                    </Button>
                </PopoverBody>
            </Popover>
        )
    )
}

export default PaywallPopover
