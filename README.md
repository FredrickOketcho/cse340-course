# CSE 340 Service Network

An Express and EJS site for community service organizations, projects, and categories.

## Run locally

1. Install dependencies with `npm install`.
2. Start the development server with `npm run dev`.
3. Visit `http://127.0.0.1:3000/`.

The site uses EJS templates in `src/views`, shared header and footer partials in
`src/views/partials`, and static assets in `public`.

## Deploy to Render

The `render.yaml` file defines a Render web service. Connect this repository to
Render and deploy the Blueprint; Render will install dependencies with `npm ci`
and start the server with `npm start`.

Local environment variables belong in `.env`. That file is ignored by Git; do
not commit private values.
