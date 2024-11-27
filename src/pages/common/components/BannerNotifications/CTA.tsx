import React from 'react'

import {Link} from 'react-router-dom'

import BaseButton from 'pages/common/components/button/BaseButton'
import Button from 'pages/common/components/button/Button'
import LinkButton from 'pages/common/components/button/LinkButton'

import {AlertBannerCTATypes} from './types'

function getOpenInNewTabProps(opensInNewTab?: boolean) {
    if (!opensInNewTab) {
        return {}
    }
    return {
        target: '_blank',
        rel: 'noopener noreferrer',
    }
}

export function CTA(props: AlertBannerCTATypes) {
    return (
        <div>
            {props?.type === 'external' && (
                <LinkButton
                    fillStyle="ghost"
                    href={props.href}
                    onClick={props.onClick}
                    {...getOpenInNewTabProps(props.opensInNewTab)}
                >
                    {props.text}
                </LinkButton>
            )}
            {props?.type === 'internal' && (
                <BaseButton fillStyle="ghost">
                    {(elementAttributes) => (
                        <Link
                            {...elementAttributes}
                            to={props.to}
                            onClick={props.onClick}
                            {...getOpenInNewTabProps(props.opensInNewTab)}
                        >
                            {props.text}
                        </Link>
                    )}
                </BaseButton>
            )}
            {props?.type === 'action' && (
                <Button fillStyle="ghost" onClick={props.onClick}>
                    {props.text}
                </Button>
            )}
        </div>
    )
}
