import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'

import {
    duplicatedHiddenFacebookMessage,
    facebookMessageNoMeta,
} from '../../../../../../models/ticket/tests/mocks'
import SourceDetailsHeader from '../SourceDetailsHeader'

describe('<SourceDetailsHeader/>', () => {
    const minProps: ComponentProps<typeof SourceDetailsHeader> = {
        message: facebookMessageNoMeta,
        isLastRead: true,
        timezone: 'UTC',
        isMessageDeleted: false,
    }
    it(
        'should render a DatetimeLabel and the SourceActionsHeader because the message is not duplicated ' +
            'and is not deleted',
        () => {
            const component = shallow(<SourceDetailsHeader {...minProps} />)
            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should render a DatetimeLabel because the message is not duplicated and should not render the ' +
            'SourceActionsHeader because the message is deleted',
        () => {
            const component = shallow(
                <SourceDetailsHeader {...minProps} isMessageDeleted={true} />
            )
            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should render a `go to ticket` link instead of the date because the message is duplicated and should render the ' +
            'SourceActionsHeader because the message is not deleted',
        () => {
            const component = shallow(
                <SourceDetailsHeader
                    {...minProps}
                    message={duplicatedHiddenFacebookMessage}
                />
            )
            expect(component).toMatchSnapshot()
        }
    )

    it(
        'should render a `go to ticket` link instead of the date because the message is duplicated and should not ' +
            'render the SourceActionsHeader because the message is deleted',
        () => {
            const component = shallow(
                <SourceDetailsHeader
                    {...minProps}
                    message={duplicatedHiddenFacebookMessage}
                    isMessageDeleted={true}
                />
            )
            expect(component).toMatchSnapshot()
        }
    )
})
