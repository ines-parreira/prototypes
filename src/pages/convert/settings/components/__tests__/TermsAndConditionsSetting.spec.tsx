import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {Language as MockLanguage} from 'constants/languages'
import {TermsAndConditionsSetting} from 'pages/convert/settings/components/TermsAndConditionsSetting'
import {mockStore} from 'utils/testing'
import {DisclaimerSettings} from 'pages/convert/settings/types'
import {chatIntegrationFixtures} from 'fixtures/chat'

const store = mockStore({})

describe('<TermsAndConditionsSetting />', () => {
    const defaultProps = {
        disclaimerSettings: {
            disclaimerEnabled: false,
            disclaimerMap: {},
            selectedLanguage: 'en',
            preSelectDisclaimer: false,
        },
        onDisclaimerSettingsChange: (
            __: (state: DisclaimerSettings) => DisclaimerSettings
        ) => {},
        onErrorChange: (__: boolean) => {},
        chatIntegration: fromJS(chatIntegrationFixtures[0]),
    }

    it('should render', () => {
        const {getByText} = render(
            <TermsAndConditionsSetting {...defaultProps} />
        )
        expect(getByText('Privacy Policy Disclaimer')).toBeInTheDocument()
    })

    it('should show error message when in error', () => {
        const disclaimerMap: Record<string, string> = {}
        disclaimerMap[MockLanguage.EnglishGb] = 'f'.repeat(281)
        const mockOnError = jest.fn()
        const {getByText} = render(
            <Provider store={store}>
                <TermsAndConditionsSetting
                    {...defaultProps}
                    disclaimerSettings={{
                        ...defaultProps.disclaimerSettings,
                        disclaimerEnabled: true,
                        disclaimerMap: disclaimerMap,
                        selectedLanguage: MockLanguage.EnglishGb,
                    }}
                    onErrorChange={mockOnError}
                />
            </Provider>
        )
        expect(
            getByText(
                'The disclaimer should be under or equals to 280 characters.'
            )
        ).toBeInTheDocument()
        expect(mockOnError).toHaveBeenCalledWith(true)
    })
})
