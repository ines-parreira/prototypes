import React from 'react'
import {Link} from 'react-router-dom'

export enum AlertBannerTypes {
    Critical = 'critical',
    Warning = 'warning',
    Info = 'info',
}

// AlertBanner CTA types

type baseCTAType = {
    text: string
    onClick?: () => void
}

type ExternalCTAType = baseCTAType & {
    type: 'external'
    opensInNewTab?: boolean
} & Required<Pick<React.HTMLProps<HTMLAnchorElement>, 'href'>>

type InternalCTAType = baseCTAType & {
    type: 'internal'
    opensInNewTab?: boolean
} & Pick<React.ComponentProps<typeof Link>, 'to'>

type ButtonCTAType = baseCTAType & {
    type: 'action'
    onClick: () => void
}

export type AlertBannerCTATypes =
    | ExternalCTAType
    | InternalCTAType
    | ButtonCTAType
