#!/bin/bash

find /usr/share/nginx/html -type f -print0 | xargs -0 sed -i "s#REPLACE_REACT_APP_API_GATEWAY_ENDPOINT#$REACT_APP_API_GATEWAY_ENDPOINT#g"
find /usr/share/nginx/html -type f -print0 | xargs -0 sed -i "s#REPLACE_REACT_APP_COGNITO_USER_APP_CLIENT_ID#$REACT_APP_COGNITO_USER_APP_CLIENT_ID#g"
find /usr/share/nginx/html -type f -print0 | xargs -0 sed -i "s#REPLACE_REACT_APP_COGNITO_USER_POOL_ID#$REACT_APP_COGNITO_USER_POOL_ID#g"
find /usr/share/nginx/html -type f -print0 | xargs -0 sed -i "s#REPLACE_REACT_APP_X_API_KEY#$REACT_APP_X_API_KEY#g"
find /usr/share/nginx/html -type f -print0 | xargs -0 sed -i "s#REPLACE_REACT_APP_REQUIRE_LOGIN#$REACT_APP_REQUIRE_LOGIN#g"
