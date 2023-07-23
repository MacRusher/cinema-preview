import chromium from '@sparticuz/chromium-min';
import type { NextApiRequest, NextApiResponse } from 'next';
import playwright from 'playwright-core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ preview: string } | { message: string }>,
) {
  try {
    const {
      link = '',
    }: {
      link?: string;
    } = JSON.parse(req.body as string);
    console.log('req', { link });

    const browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v114.0.0/chromium-v114.0.0-pack.tar',
      ),
      headless: true,
    });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(link);

      await page.locator('#ddQunatity_0').selectOption('1');
      await page.locator('#lbSelectSeats').click();

      const canvas = page.locator('#myCanvas');
      await canvas.waitFor();

      const buffer = await canvas.screenshot();

      res.status(200).json({ preview: buffer.toString('base64') });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: (error as Error).message });
  }
}
