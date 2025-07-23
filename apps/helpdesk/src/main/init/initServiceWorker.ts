const workerUrl =
    window.SERVICE_WORKER_BUILD_URL ||
    '/web-app/build/helpdesk.service-worker.a.js'

navigator.serviceWorker.register(workerUrl)
