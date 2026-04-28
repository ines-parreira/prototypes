import React from 'react'

import { appQueryClient } from '@repo/api-resources'
import { render } from '@repo/testing'

import { TicketMessageSourceType } from 'business/types/ticket'
import { channels as mockChannels } from 'fixtures/channels'
import { IntegrationType } from 'models/integration/types'
import { getChannelBySlug } from 'services/channels'
import { SYSTEM_SOURCE_TYPES, USABLE_SOURCE_TYPES } from 'tickets/common/config'

import SourceIcon from '../SourceIcon'

beforeEach(() => {
    jest.spyOn(appQueryClient, 'getQueryData').mockReturnValue({
        data: mockChannels,
    })
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('SourceIcon component', () => {
    it('should show default icon', () => {
        const { container } = render(<SourceIcon />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show USABLE_SOURCE_TYPES icons', () => {
        USABLE_SOURCE_TYPES.forEach((type) => {
            const { container } = render(<SourceIcon type={type} />)
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    it('should show SYSTEM_SOURCE_TYPES icons', () => {
        SYSTEM_SOURCE_TYPES.forEach((type) => {
            const { container } = render(<SourceIcon type={type} />)
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    it('should show HELP_CENTER_CONTACT_FORM icons', () => {
        const { container } = render(
            <SourceIcon type={TicketMessageSourceType.HelpCenterContactForm} />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show the icon exposed on channel.icon_url for new channels', () => {
        const { container } = render(<SourceIcon type="tiktok-shop" />)
        const image = container.getElementsByTagName('img')[0]
        expect(image).toBeInTheDocument()
        expect(image.getAttribute('src')).toEqual(
            getChannelBySlug('tiktok-shop')?.logo_url,
        )
    })

    it('should show apps icon for App integration type', () => {
        const { container } = render(<SourceIcon type={IntegrationType.App} />)
        const icon = container.querySelector('i')
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveClass('material-icons')
        expect(icon?.textContent).toBe('apps')
    })
})
