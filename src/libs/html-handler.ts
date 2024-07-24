import puppeteer from "puppeteer";

interface PuppeteerProps {
    url: string;
    useCookie?: boolean;
}

export const getDocumentByPuppeteer = async ({
    url,
    useCookie = false
}: PuppeteerProps) => {
    const browser = await puppeteer.launch();

    try {
        const page = await browser.newPage();
        
        console.log("正在获取 html");
        await page.goto(url);
        const html = await page.content();
        const cookie = useCookie ? await page.cookies() : null;

        return {
            html,
            cookie
        };
    } finally {
        await browser.close();
    }
}