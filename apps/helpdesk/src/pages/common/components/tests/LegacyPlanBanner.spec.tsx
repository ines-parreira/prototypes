import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { LegacyPlanBanner } from '../LegacyPlanBanner'

describe('<LegacyPlanBanner />', () => {
    it.each([false, true])(
        'should render the legacy plan banner',
        (isCustomPrice) => {
            const { container } = render(
                <MemoryRouter>
                    <LegacyPlanBanner isCustomPrice={isCustomPrice} />
                </MemoryRouter>,
            )
            expect(container).toMatchSnapshot()
        },
    )
})
