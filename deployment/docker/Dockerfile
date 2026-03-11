FROM nginx

COPY apps/helpdesk/build /usr/share/nginx/html/

RUN mkdir -p /usr/share/nginx/html/static/public && \
    ln -s /usr/share/nginx/html/helpdesk.shared-worker.js /usr/share/nginx/html/static/public/helpdesk.shared-worker.js && \
    ln -s /usr/share/nginx/html/pubnub.worker.js /usr/share/nginx/html/static/public/pubnub.worker.js

ARG RELEASE
ENV RELEASE=${RELEASE}

EXPOSE 80
