# Samrique website

The site is implemented as a standalone Angular application. Its Tailwind utility
classes are provided by the Tailwind CDN, with Google Fonts and Font Awesome
loaded from their existing external CDNs.

## Development

```sh
npm install
npm start
```

## Production build

```sh
npm run build
```

The portfolio contact form validates the entered details and opens a prefilled
email to `samrique.in@gmail.com`. It does not send or store messages on a server;
the visitor must send the email from their email application.

Deploy the contents of `dist/samrique-website/browser/` after a production
build.
