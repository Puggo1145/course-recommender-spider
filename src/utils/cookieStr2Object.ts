import type { CookieParam } from "puppeteer";

/**
 * @param cookieString 
 * @description 将 cookie 字符串转换为 puppeteer 支持的 CookieParams 类型
 */
export const parseCookies = (cookieString: string, domain: string): CookieParam[] => {
    return cookieString.split('; ').map(cookie => {
      const [name, ...rest] = cookie.split('=');
      return {
        name: name.trim(),
        value: rest.join('=').trim(),
        domain: domain, // 根据需要修改
        path: '/',
        // expires: Date.now() / 1000 + 3600, 
        // httpOnly: false,
        // secure: false
      };
    });
  }