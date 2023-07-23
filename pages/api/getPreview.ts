import type { NextApiRequest, NextApiResponse } from 'next';
import * as playwright from 'playwright-aws-lambda';

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

    const browser = await playwright.launchChromium();

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
