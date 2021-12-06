import React from 'react'
import {render} from '@testing-library/react'
import {Button} from 'reactstrap'

import {AccountFeature} from '../../../../../state/currentAccount/types'
import CirclePaywall from '../CirclePaywall'

describe('<CirclePaywall />', () => {
    it('should match the snapshot for the provided feature configuration', () => {
        const {container} = render(
            <CirclePaywall
                feature={AccountFeature.AutomationSelfServiceStatistics}
                ctaButton={<Button>Click here!</Button>}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
