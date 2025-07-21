export const sortEmailByDomainAndName = (a: string, b: string) => {
    const [aName, aDomain] = a.split('@')
    const [bName, bDomain] = b.split('@')

    if (aDomain === bDomain) {
        return aName.localeCompare(bName)
    }

    return aDomain.localeCompare(bDomain)
}
