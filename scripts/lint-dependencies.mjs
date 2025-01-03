#!/usr/bin/env node

import packageJson from '../package.json' with {type: 'json'}

/**
 * This script should be removed when we fix our production build
 */
if (!packageJson.devDependencies['@gorgias/api-queries']) {
    throw new Error(
        `@gorgias/api-queries needs to be a setup as a dev dependency for now.
        We know that should not be the case but due to current our faulty production bundling we need to keep it as a dev dependency.
        For more context see the last post-mortem on this issue:
        https://www.notion.so/gorgias/Error-when-doing-actions-in-tickets-1007-16f1ae2178f581f8b93fda970fbece54
        `
    )
}
