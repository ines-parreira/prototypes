import type React from 'react'

import { render } from '@testing-library/react'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'

import ChatAvatar from '../ChatAvatar'

const agentName = 'Agent Name'
const agentAvatarUrl = 'agent-avatar-url.jpg'
const companyLogoUrl = 'company-logo-url.jpg'
const chatTitle = 'Chat Title'

const minProps: React.ComponentProps<typeof ChatAvatar> = {
    agentName,
    agentAvatarUrl,
    chatTitle,
}

describe('<ChatAvatar />', () => {
    it.each([
        [
            'agent first name initial',
            GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
            'A',
        ],
        [
            'agent name initials',
            GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL,
            'AN',
        ],
        [
            'agent full name initials',
            GorgiasChatAvatarNameType.AGENT_FULLNAME,
            'AN',
        ],
        ['chat title initials', GorgiasChatAvatarNameType.CHAT_TITLE, 'CT'],
    ])('should display %s', (_, nameType, initials) => {
        const { container } = render(
            <ChatAvatar
                {...minProps}
                avatar={{
                    imageType: GorgiasChatAvatarImageType.AGENT_INITIALS,
                    nameType,
                }}
            />,
        )

        expect(container.textContent).toBe(initials)
    })

    it.each([
        [
            'agent avatar',
            GorgiasChatAvatarImageType.AGENT_PICTURE,
            agentAvatarUrl,
        ],
        [
            'company logo',
            GorgiasChatAvatarImageType.COMPANY_LOGO,
            companyLogoUrl,
        ],
    ])('should display %s', (_, imageType, avatarUrl) => {
        const {
            container: { firstChild },
        } = render(
            <ChatAvatar
                {...minProps}
                avatar={{
                    imageType,
                    nameType:
                        GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL,
                    companyLogoUrl,
                }}
            />,
        )

        expect(firstChild?.firstChild).toHaveStyle(
            `background-image: url(${avatarUrl})`,
        )
    })

    it('should display no image', () => {
        const {
            container: { firstChild },
        } = render(
            <ChatAvatar
                {...minProps}
                avatar={{
                    imageType: GorgiasChatAvatarImageType.AGENT_INITIALS,
                    nameType:
                        GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL,
                }}
            />,
        )

        expect(firstChild).toMatchSnapshot()
    })

    it('should display placeholder image', () => {
        const {
            container: { firstChild },
        } = render(
            <ChatAvatar
                {...minProps}
                avatar={{
                    imageType: GorgiasChatAvatarImageType.COMPANY_LOGO,
                    nameType:
                        GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL,
                    companyLogoUrl,
                }}
                showPlaceholderAvatar
            />,
        )

        expect(firstChild).toMatchSnapshot()
    })
})
