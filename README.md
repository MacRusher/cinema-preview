# Cinema City Seat Finder

### Dependencies:

- node@18
- npm@8


### Local development

```bash
npm ci
npm start
```

### Deployment

Deployment is set up after each commit to the `master` branch.

#### Note

There is an issue with a too large function for a lambda.
To solve this issue we must use Vercel function directly (saves ~10MB).

This in order does not work in local development, so:

- In dev we import code from original function
- During deploy, before building, the stub is removed by running `rm pages/api/getPreview.ts` in Vercel CI/CD.
