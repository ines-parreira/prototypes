import {render, screen} from '@testing-library/react'
import React from 'react'

import useApps from 'pages/automate/actionsPlatform/hooks/useApps'

import UseCaseTemplateConfirmationStep from '../UseCaseTemplateConfirmationStep'

jest.mock('models/workflows/queries')
jest.mock('common/flags')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('../../hooks/useUpsertAction')

const mockUseApps = jest.mocked(useApps)

describe('<UseCaseTemplateConfirmationStep />', () => {
    beforeAll(() => {
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: [
                {
                    icon: 'https://ok.com/1.png',
                    id: 'test',
                    name: 'My test app',
                    type: 'app',
                },
            ],
            actionsApps: [],
        } as unknown as ReturnType<typeof useApps>)
    })
    it('should render component', () => {
        render(
            <UseCaseTemplateConfirmationStep
                name="test"
                app={{
                    app_id: 'test',
                    type: 'app',
                }}
            />
        )

        expect(screen.getByText('test in My test app')).toBeInTheDocument()
    })
})
