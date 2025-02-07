import {ColorType} from '@gorgias/merchant-ui-kit'
import {ReactNode} from 'react'

import {AlertBannerProps} from 'AlertBanners'

export type Infocard = {
    isHidden?: boolean
    banner?: ReactNode
    CTA?: ReactNode
    pricing?: {
        detail?: string
        link?: string
    }
    resources?: {
        documentationLink?: string
        privacyPolicyLink?: string
        others?: {
            title: string
            icon: string
            url: string
        }[]
    }
    support?: {
        email?: string
        phone?: string
    }
}

export type ProductDetail = {
    title: string
    image?: string
    icon?: string
    description: string
    benefits?: string[]
    categories?: Array<string | {label: string; type: ColorType}>
    company?: {
        name: string
        url: string
    }
    longDescription: string
    screenshots?: string[]
    alertBanner?: AlertBannerProps
    infocard: Infocard
}
