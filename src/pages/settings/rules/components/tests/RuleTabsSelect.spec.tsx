import React, {ComponentProps} from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'

import RuleTabSelect from '../RuleTabSelect'

describe('<RuleTabsSelect/>', () => {
    const minProps: ComponentProps<typeof RuleTabSelect> = {
        handleTabChange: jest.fn(),
        activeTab: 'foo',
        hasUnseenRules: false,
    }

    it('should render', () => {
        const {container} = render(<RuleTabSelect {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render warning when a new rule was installed', () => {
        const {container} = render(
            <RuleTabSelect {...minProps} hasUnseenRules={true} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should change tab on click', async () => {
        const {getByText} = render(<RuleTabSelect {...minProps} />)
        fireEvent.click(getByText(/my rules/i))
        await waitFor(() => {
            expect(minProps.handleTabChange).toHaveBeenCalled()
        })
    })
})
