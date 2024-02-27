import React from 'react'
import Navbar from 'pages/common/components/Navbar'
import ConvertNavbarView from './ConvertNavbarView'

const ConvertNavbar = () => {
    return (
        <Navbar activeContent="convert">
            <ConvertNavbarView />
        </Navbar>
    )
}

export default ConvertNavbar
