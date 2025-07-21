import { useState } from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import SectionHeader from '../../common/components/SectionHeader/SectionHeader'
import AddCustomBusinessHoursModal from './AddCustomBusinessHoursModal'
import ListCustomBusinessHours from './ListCustomBusinessHours'

import css from './CustomBusinessHours.less'

export default function CustomBusinessHours() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className={css.intro}>
            <SectionHeader
                title="Custom Business Hours"
                description="Custom business hours let you define specific availability schedules for specific integrations. These will override the default business hours wherever applied."
            />

            <Button leadingIcon="add" onClick={() => setIsModalOpen(true)}>
                Add Custom Business Hours
            </Button>

            <AddCustomBusinessHoursModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <ListCustomBusinessHours />
        </div>
    )
}
