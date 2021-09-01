import React from 'react'
import {FormGroup, Label} from 'reactstrap'

import ToggleButton from '../../../../common/components/ToggleButton'

type Props = {
    searchActivated: boolean
    onToggle: (searchActivated: boolean) => void
    loading?: boolean
}

export const SearchToggle = ({searchActivated, onToggle, loading}: Props) => {
    const toggleSearch = (isToggled: boolean) => {
        onToggle(isToggled)
    }

    return (
        <FormGroup>
            <div className="d-flex">
                <ToggleButton
                    value={searchActivated}
                    onChange={toggleSearch as () => Promise<void>}
                    loading={loading}
                    disabled={loading}
                />
                <Label className="control-label ml-2">Enable search bar</Label>
            </div>
            <p>
                This makes the search bar visible or not in your help center
                home page.
            </p>
        </FormGroup>
    )
}

export default SearchToggle
