# stage 1
FROM ubuntu:22.04 as build

# install node.js
RUN apt-get update
RUN apt-get install curl -y
RUN curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
ENV NODE_VERSION 18.12.1
ENV NVM_DIR $HOME/.nvm
RUN \
    . ~/.nvm/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default;
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# install yarn
RUN npm i -g yarn

# clone grid3_client
RUN apt-get install git -y
RUN git clone --single-branch --branch development_support_browser https://github.com/threefoldtech/grid3_client_ts.git
RUN \
    cd ./grid3_client_ts \
    && yarn cache clean \
    && yarn install \
    && yarn build \
    && yarn link;

WORKDIR /app
COPY . /app/

# build getmastodon project
RUN yarn cache clean
RUN yarn install
RUN yarn link grid3_client
RUN yarn build

# stage 2
FROM nginx:1.16.0-alpine

# Copy dist from stage(1) 
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/scripts/build-env.sh /usr/share/nginx/html

# Add custom nginx conf
RUN rm /etc/nginx/conf.d/default.conf
COPY /nginx.conf /etc/nginx/conf.d

WORKDIR /usr/share/nginx/html
RUN apk add --no-cache bash
RUN chmod +x build-env.sh

# Serve the app
EXPOSE 80
CMD [ "/bin/bash", "-c", "/usr/share/nginx/html/build-env.sh && nginx -g \"daemon off;\"" ]
