FROM node:20.16.0-alpine

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=package-lock.json,target=package-lock.json \
#     --mount=type=cache,target=/root/.npm \
#     npm ci --omit=dev

RUN npm install

COPY . /usr/src/app/

# Expose the port that the application listens on.
EXPOSE 3030

# Run the application.
CMD ["node", "app.js"] 
