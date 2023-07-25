# Cinema City Seat Finder

### Installation

Dependencies:

- node@18
- npm@8

```bash
npm ci
```

### Local development

Proper way:

```bash
npm start
```

Alternative way (to test the vercel function directly):


```bash
npm run vercel
```

Note: in this approach the nextjs app and vercel functions will work, but the serverless functions in nextjs app will not!

### Testing

Run `npm run test` to check for linting and type errors.

### Deployment

Deployment is set up after each commit to the `master` branch.

#### Note

There is an issue with a too large function for a lambda.
To solve this issue we must use Vercel function directly (saves ~10MB).

This in order does not work in local development, so:

- In dev we import code from original function
- During deploy, before building, the stub is removed by running `rm pages/api/getPreview.ts` in Vercel CI/CD.
