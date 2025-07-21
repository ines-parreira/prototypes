import React from 'react'

import { render, screen } from '@testing-library/react'

import { assetsUrl } from 'utils'

import PaywallView from '../PaywallView'
import PaywallViewActionButtons from '../PaywallViewActionButtons'
import PaywallViewChecklist from '../PaywallViewChecklist'
import PaywallViewChecklistItem from '../PaywallViewChecklistItem'
import PaywallViewHeader from '../PaywallViewHeader'
import PaywallViewLeftContainer from '../PaywallViewLeftContainer'
import PaywallViewRightContainer from '../PaywallViewRightContainer'

describe('PaywallView', () => {
    it('should render all components', () => {
        render(
            <PaywallView>
                <PaywallViewLeftContainer>
                    <PaywallViewHeader
                        logo={assetsUrl('/img/self-service/automate-logo.svg')}
                        title="Automate support"
                    />
                    <PaywallViewChecklist>
                        <PaywallViewChecklistItem>
                            Checklist item
                        </PaywallViewChecklistItem>
                    </PaywallViewChecklist>
                    <PaywallViewActionButtons>
                        <button>Button</button>
                    </PaywallViewActionButtons>
                </PaywallViewLeftContainer>
                <PaywallViewRightContainer>
                    Right container
                </PaywallViewRightContainer>
            </PaywallView>,
        )

        expect(screen.getByAltText('icon')).toBeInTheDocument()
        expect(screen.getByText('Automate support')).toBeInTheDocument()
        expect(screen.getByText('Checklist item')).toBeInTheDocument()
        expect(screen.getByText('Button')).toBeInTheDocument()
        expect(screen.getByText('Right container')).toBeInTheDocument()
    })
})
