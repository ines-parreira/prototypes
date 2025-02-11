import {render, screen} from '@testing-library/react'
import React from 'react'

import {Panels} from 'core/layout/panels'
import {assumeMock} from 'utils/testing'

import useIsOnboardingHidden from '../../hooks/useIsOnboardingHidden'
import {OnboardingPanel} from '../OnboardingPanel'

jest.mock(
    'core/layout/panels',
    () =>
        ({
            ...jest.requireActual('core/layout/panels'),
            Handle: () => <div>Handle</div>,
        }) as typeof import('core/layout/panels')
)

jest.mock('pages/tickets/list/OnboardingSidePanel', () => () => (
    <div>OnboardingSidePanel</div>
))

jest.mock('../../hooks/useIsOnboardingHidden', () => jest.fn())
const useIsOnboardingHiddenMock = assumeMock(useIsOnboardingHidden)

describe('OnboardingPanel', () => {
    beforeEach(() => {
        useIsOnboardingHiddenMock.mockReturnValue([true, jest.fn()])
    })

    it('should return null if the onboarding is hidden', () => {
        render(
            <Panels size={1000}>
                <OnboardingPanel />
            </Panels>
        )
        expect(screen.queryByText('Handle')).not.toBeInTheDocument()
        expect(
            screen.queryByText('OnboardingSidePanel')
        ).not.toBeInTheDocument()
    })

    it('should render a handle and the onboarding if the onboarding is not hidden', () => {
        useIsOnboardingHiddenMock.mockReturnValue([false, jest.fn()])
        render(
            <Panels size={1000}>
                <OnboardingPanel />
            </Panels>
        )
        expect(screen.getByText('Handle')).toBeInTheDocument()
        expect(screen.getByText('OnboardingSidePanel')).toBeInTheDocument()
    })
})
