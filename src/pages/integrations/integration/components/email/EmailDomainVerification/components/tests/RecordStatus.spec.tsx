import {render, screen} from '@testing-library/react'
import React from 'react'

import RecordStatus from '../RecordStatus'

describe('<RecordStatus />', () => {
    describe('for verified records', () => {
        it('should render as success', () => {
            render(<RecordStatus isVerified={true} />)
            expect(screen.getByText('check_circle')).toBeInTheDocument()
        })

        it('should render as success even if a status check has not been requested', () => {
            render(<RecordStatus isVerified={true} isRequested={false} />)
            expect(screen.getByText('check_circle')).toBeInTheDocument()
        })

        it('should render as pending if a status check is pending', () => {
            render(<RecordStatus isVerified={true} isPending={true} />)
            expect(screen.getByText('timelapse')).toBeInTheDocument()
            expect(screen.queryByText('check_circle')).not.toBeInTheDocument()
        })
    })

    describe('for unverified records', () => {
        it('should render as failed if a status check has been performed', () => {
            render(<RecordStatus isVerified={false} isRequested={true} />)
            expect(screen.getByText('close')).toBeInTheDocument()
        })

        it('should render as blank if a status check has NOT been performed', () => {
            render(<RecordStatus isVerified={false} />)
            expect(screen.queryByText('close')).not.toBeInTheDocument()
        })

        it('should render as pending if a status check is pending', () => {
            render(<RecordStatus isVerified={false} isPending={true} />)
            expect(screen.getByText('timelapse')).toBeInTheDocument()
            expect(screen.queryByText('close')).not.toBeInTheDocument()
        })
    })
})
