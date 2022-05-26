import React, {useContext} from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {within} from '@testing-library/dom'

import FeatureFlagsContext, {FlagKey} from '../context'

import Provider from '../Provider'

const mockedFlags = {
    [FlagKey.SelfServiceArticleRecommendation]: false,
    [FlagKey.EarlyAdopter]: true,
}

jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn().mockImplementation(() => ({
        waitUntilReady: jest.fn().mockResolvedValue(null),
        allFlags: jest.fn().mockReturnValue(mockedFlags),
    })),
}))

describe('<Provider />', () => {
    const TestParentComponent = () => {
        const {flags} = useContext(FeatureFlagsContext)

        return (
            <ul>
                {Object.entries(flags).map(([key, value]) => (
                    <li data-testid={key} key={key}>
                        <span>{key}</span>
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={jest.fn()}
                        />
                    </li>
                ))}
            </ul>
        )
    }

    it('properly sets the flags', async () => {
        render(
            <Provider>
                <TestParentComponent />
            </Provider>
        )

        await waitFor(() => {
            Object.entries(mockedFlags).forEach(([key, value]) => {
                const flagItem = screen.getByTestId(key)
                const flagInput = within(flagItem).getByRole(
                    'checkbox'
                ) as HTMLInputElement

                within(flagItem).getByText(key)
                expect(flagInput.checked).toBe(value)
            })
        })
    })
})
