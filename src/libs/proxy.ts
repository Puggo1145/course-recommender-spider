import axios, { AxiosInstance } from 'axios';
import { HttpProxyAgent } from 'http-proxy-agent';

class ProxyRotator {
    private proxies: string[];
    private currentIndex: number;

    constructor(proxies: string[]) {
        this.proxies = proxies;
        this.currentIndex = 0;
    }

    getNextProxy(): string {
        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        return proxy;
    }
}

class Scraper {
    private proxyRotator: ProxyRotator;

    constructor(proxies: string[]) {
        this.proxyRotator = new ProxyRotator(proxies);
    }

    async makeRequest(url: string): Promise<any> {
        const proxy = this.proxyRotator.getNextProxy();
        const agent = new HttpProxyAgent(proxy);

        const axiosInstance: AxiosInstance = axios.create({
            httpAgent: agent,
            httpsAgent: agent
        });

        try {
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error with proxy ${proxy}:`, error.message);
                // 可以在这里添加逻辑来处理代理失败的情况
                throw error;
            }
        }
    }
}

// 使用示例
const proxies = [
    'http://proxy1.example.com:8080',
    'http://proxy2.example.com:8080',
    'http://proxy3.example.com:8080'
];

const scraper = new Scraper(proxies);

async function main() {
    try {
        const data = await scraper.makeRequest('https://api.ipify.org?format=json');
        console.log('Response:', data);
    } catch (error) {
        console.error('Scraping failed:', error);
    }
}

main();