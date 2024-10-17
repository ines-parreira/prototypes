const axios = require('axios')
const inquirer = require('inquirer')
const signale = require('signale')
const fs = require('fs')

const SCHEMAS_DIR = '../src/config/activity-tracker'
const STAGING_CLUSTER = 'us-east1-86cc'

const CLUSTER_LIST = [
    'aus-southeast1-fcb9',
    'europe-west1-c511',
    'europe-west3-86c1',
    'us-central1-d8ff',
    'us-central1-c433',
    'us-east1-2607',
    'us-east1-635c',
    'us-east1-c94b',
    'us-east4-65cd',
    'us-east4-5f09',
]

const ARTIFACT_PLACEHOLDER = '__ARTIFACT_ID__'

const SERVICE_NAME = 'helpdesk.ui'
const APICURIO_ENDPOINT = `apis/registry/v2/groups/${SERVICE_NAME}/artifacts?ifExists=RETURN_OR_UPDATE&canonical=true`
const APICURIO_RULE_ENDPOINT = `apis/registry/v2/groups/${SERVICE_NAME}/artifacts/${ARTIFACT_PLACEHOLDER}/rules`
const DEVELOPMENT_APICURIO_URL = 'http://localhost:8765'

const RELEASE_TYPE = {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
}

const SchemaRuleType = {
    COMPATIBILITY: 'COMPATIBILITY',
    VALIDITY: 'VALIDITY',
}

// hostname builder
const buildApicurioHostname = (cluster, isStaging) => {
    if (!cluster) {
        signale.fatal('No cluster provided !')
    }
    return isStaging
        ? `apicurio-${cluster}.gorgias.xyz`
        : `apicurio-${cluster}.gorgias.com`
}

// main endpoint for uploading the schemas
const buildApicurioUrl = (user, password, hostname) => {
    if (!user && !password && !hostname) {
        return `${DEVELOPMENT_APICURIO_URL}/${APICURIO_ENDPOINT}`
    }
    return `https://${user}:${password}@${hostname}/${APICURIO_ENDPOINT}`
}

// endpoint for updating the compatibility and validity rules
const buildApicurioRuleUrl = (user, password, hostname) => {
    if (!user && !password && !hostname) {
        return `${DEVELOPMENT_APICURIO_URL}/${APICURIO_RULE_ENDPOINT}`
    }
    return `https://${user}:${password}@${hostname}/${APICURIO_RULE_ENDPOINT}`
}

const buildUrls = (username, password, cluster) => {
    const apicurioURl = buildApicurioUrl(
        username,
        password,
        cluster && buildApicurioHostname(cluster)
    )
    const apicurioRuleUrl = buildApicurioRuleUrl(
        username,
        password,
        cluster && buildApicurioHostname(cluster)
    )

    return {apicurioURl, apicurioRuleUrl}
}

// currently the description is in the format of "version ### description"
const parseDescription = (text) => {
    const [version, description] = text.split('###')

    return {version, description}
}

const promptCredentials = async (cluster) => {
    const {username, password} = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: `Enter Apicurio username for ${cluster}:`,
        },
        {
            type: 'password',
            name: 'password',
            message: `Enter Apicurio password for ${cluster}:`,
        },
    ])

    return {username, password}
}

const validateCredentials = (username, password) => {
    if (!username.length || !password.length) {
        signale.fatal('Please provide an Apicurio username and password !')
        process.exit(1)
    }
}

const main = async () => {
    const {releaseName} = await inquirer.prompt([
        {
            type: 'list',
            name: 'releaseName',
            message: 'Which environment would you like to upload to?',
            choices: Object.values(RELEASE_TYPE),
        },
    ])

    if (!releaseName) {
        signale.fatal(
            'Please provide an environment type (development | staging | production)!'
        )
        process.exit(1)
    }

    const readAndSubmitSchemas = async (apicurioUrl, apicurioRuleUrl) => {
        return new Promise((resolve) => {
            fs.readdir(SCHEMAS_DIR, async (err, files) => {
                if (err) {
                    signale.fatal(err)
                    return
                }

                const JSONFiles = files.filter((file) => file.endsWith('.json'))

                let successCount = 0

                for (const [index, file] of JSONFiles.entries()) {
                    const jsonSchema = require(SCHEMAS_DIR + '/' + file)
                    const schemaDescription = Object.values(
                        JSON.parse(JSON.stringify(jsonSchema)).definitions
                    )[0].description
                    const schemaName = file.split('.schema.json')[0]
                    const sharedContentTypeHeaders = {
                        'Content-Type': 'application/json; artifactType=JSON',
                    }
                    const headers = {
                        ...sharedContentTypeHeaders,
                        'X-Registry-ArtifactId': schemaName,
                        'X-Registry-Version':
                            parseDescription(schemaDescription).version,
                        'X-Registry-Description':
                            parseDescription(schemaDescription).description,
                    }

                    try {
                        // upload schemas
                        signale.pending(
                            `Uploading schema ${index + 1}/${
                                JSONFiles.length
                            } to ${apicurioUrl}`
                        )
                        await axios.post(
                            apicurioUrl,
                            JSON.parse(JSON.stringify(jsonSchema)),
                            {headers}
                        )

                        const ruleUrl = apicurioRuleUrl.replace(
                            ARTIFACT_PLACEHOLDER,
                            schemaName
                        )

                        // check compatibility and validity rules
                        signale.pending('Checking schema rules...')
                        const {data: schemaRules = []} = await axios.get(
                            ruleUrl
                        )

                        if (
                            !schemaRules.includes(SchemaRuleType.COMPATIBILITY)
                        ) {
                            signale.pending(
                                `Updating compatibility rule ${index + 1}/${
                                    JSONFiles.length
                                }`
                            )

                            // update compatibility rule
                            await axios.post(
                                ruleUrl,
                                {
                                    type: 'COMPATIBILITY',
                                    config: 'BACKWARD_TRANSITIVE',
                                },
                                {headers: sharedContentTypeHeaders}
                            )
                        }

                        if (!schemaRules.includes(SchemaRuleType.VALIDITY)) {
                            // update validity rule
                            signale.pending(
                                `Updating validity rule ${index + 1}/${
                                    JSONFiles.length
                                }`
                            )
                            await axios.post(
                                ruleUrl,
                                {
                                    type: 'VALIDITY',
                                    config: 'FULL',
                                },
                                {headers: sharedContentTypeHeaders}
                            )
                        }

                        if (
                            schemaRules.includes(
                                SchemaRuleType.COMPATIBILITY
                            ) &&
                            schemaRules.includes(SchemaRuleType.VALIDITY)
                        ) {
                            signale.note('Schema rules are already updated.')
                        }

                        signale.success(
                            `Schema ${index + 1}/${
                                JSONFiles.length
                            } uploaded / updated successfully !`
                        )
                        successCount++
                    } catch (err) {
                        signale.fatal(err.response.data)
                    }
                }

                if (successCount === 0) {
                    signale.fatal({
                        prefix: '[SUMMARY] :',
                        message:
                            'No schemas or rules were uploaded / updated successfully, please check the logs !',
                    })
                } else if (successCount !== JSONFiles.length) {
                    signale.fatal({
                        prefix: '[SUMMARY] :',
                        message:
                            'Schemas or rules were uploaded / updated partially, please check the logs !',
                    })
                } else {
                    signale.complete(
                        'All schemas uploaded / updated successfully !'
                    )
                }

                resolve()
            })
        })
    }

    if (releaseName === RELEASE_TYPE.DEVELOPMENT) {
        const {apicurioURl, apicurioRuleUrl} = buildUrls()
        await readAndSubmitSchemas(apicurioURl, apicurioRuleUrl)
    }

    if (releaseName === RELEASE_TYPE.STAGING) {
        const {username, password} = await promptCredentials(
            RELEASE_TYPE.STAGING
        )
        validateCredentials(username, password)

        const apicurioURl = buildApicurioUrl(
            username,
            password,
            buildApicurioHostname(STAGING_CLUSTER, true)
        )
        const apicurioRuleUrl = buildApicurioRuleUrl(
            username,
            password,
            buildApicurioHostname(STAGING_CLUSTER, true)
        )
        await readAndSubmitSchemas(apicurioURl, apicurioRuleUrl)
    }

    if (releaseName === RELEASE_TYPE.PRODUCTION) {
        const {clusterChoice} = await inquirer.prompt([
            {
                type: 'list',
                name: 'clusterChoice',
                message: 'Which cluster would you like to upload to?',
                choices: ['all', ...CLUSTER_LIST],
            },
        ])

        if (clusterChoice === 'all') {
            for (const cluster of CLUSTER_LIST) {
                const {username, password} = await promptCredentials(cluster)
                validateCredentials(username, password)

                const {apicurioURl, apicurioRuleUrl} = buildUrls(
                    username,
                    password,
                    cluster
                )
                await readAndSubmitSchemas(apicurioURl, apicurioRuleUrl)
            }
            signale.success('All clusters updated !')
        } else {
            const {username, password} = await promptCredentials(clusterChoice)
            validateCredentials(username, password)

            const {apicurioURl, apicurioRuleUrl} = buildUrls(
                username,
                password,
                clusterChoice
            )
            await readAndSubmitSchemas(apicurioURl, apicurioRuleUrl)
        }
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
