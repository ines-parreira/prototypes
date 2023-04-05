import React from 'react'

import {shallow} from 'enzyme'
import {GorgiasChatLauncherType} from 'models/integration/types'

import ChatLauncher from '../ChatLauncher'

describe('<ChatLauncher/>', () => {
    it('should render with the correct setup (icon, closed)', () => {
        const component = shallow(
            <ChatLauncher
                type={GorgiasChatLauncherType.ICON}
                backgroundColor="#0d87dd"
                fontFamily="Impact"
                windowState="closed"
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render with the correct setup (icon, open)', () => {
        const component = shallow(
            <ChatLauncher
                type={GorgiasChatLauncherType.ICON}
                backgroundColor="#0d87dd"
                fontFamily="Impact"
                windowState="opened"
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render with the correct setup (icon+label, closed)', () => {
        const component = shallow(
            <ChatLauncher
                type={GorgiasChatLauncherType.ICON_AND_LABEL}
                label="Chat with us"
                backgroundColor="#0d87dd"
                fontFamily="Impact"
                windowState="closed"
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render with the correct setup (icon+label, open)', () => {
        const component = shallow(
            <ChatLauncher
                type={GorgiasChatLauncherType.ICON_AND_LABEL}
                label="Chat with us"
                backgroundColor="#0d87dd"
                fontFamily="Impact"
                windowState="opened"
            />
        )

        expect(component).toMatchSnapshot()
    })
})
