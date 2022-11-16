#!/bin/bash

# This script installs the ptvsd python package into a running
# learning-analytics-playground_edx_lms_1 container and updates the edX manage.py to
# attach a remote debugger on port 3000.

# It also changes ownership of /edx/app/edxapp/edx-platform and /usr/local/src
# directories to the current logged-in user.

CONTAINER_NAME='learning-analytics-playground_edx_lms_1'
CONTAINER_ID="$(docker container ls --filter status=running --filter name=${CONTAINER_NAME} -q)"
if [[ -z "${CONTAINER_ID}" ]]; then
    echo 'ERROR: The "learning-analytics-playground_edx_lms_1" container is not running'
    exit 1
fi

WHEEL="ptvsd-4.3.2-py2.py3-none-any.whl"
INSTALLER_URL="https://files.pythonhosted.org/packages/44/5b/fa477e4fd8e62c722febdc52462d7b037a77aa963c3e400a8e90e8f0d2c0/${WHEEL}"

PTVSD_ANCHOR="    from django.core.management import execute_from_command_line"
PTVSD_CODE="${PTVSD_ANCHOR}

    if os.environ.get('RUN_MAIN') or os.environ.get('WERKZEUG_RUN_MAIN'):
        import ptvsd

        ptvsd.enable_attach(address = ('0.0.0.0', 3000))
        print 'Attached remote debugger!'
"

# Escape the newlines in $PTVSD_CODE for use in sed.
PTVSD_CODE_ESCAPED="${PTVSD_CODE//$'\n'/'\n'}"
MANAGE_PY_PATH='/edx/app/edxapp/edx-platform/manage.py'

docker exec -uroot "${CONTAINER_ID}" /bin/bash -c "
cd ..;
chown $(id -u):$(id -g) -R /edx/app/edxapp/edx-platform /usr/local/src;
if [[ ! -f '${WHEEL}' ]]; then
    curl '${INSTALLER_URL}' -o '${WHEEL}';
    pip install '${WHEEL}';
fi;
if [[ -n '\$(grep ptvsd ${MANAGE_PY_PATH})' ]]; then
    sed -i.bak \"s/${PTVSD_ANCHOR}/${PTVSD_CODE_ESCAPED}/g\" ${MANAGE_PY_PATH};
fi
"

echo "Done"
