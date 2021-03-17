/*
 * This file is part of the KryPtoN Bot WA distribution (https://github.com/Kry9toN/KryPtoN-WhatsApp-Bot).
 * Copyright (c) 2021 Dhimas Bagus Prayoga.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'
import { color } from './color'

export class Absen {

    // link = 'http://elearning.smkn1udanawu.sch.id/login/index.php'
    pathSessions = path.join(__dirname, '../../sessions/login.json')
    previousSession: boolean = fs.existsSync(this.pathSessions)

    escapeXpathString(str: string): string {
        const splitedQuotes = str.replace(/'/g, `', "'", '`)
        return `concat('${splitedQuotes}', '')`
    }

    async linkAbsen(page: puppeteer.Page): Promise<any> {
        const escapedText = this.escapeXpathString('Submit attendance')
        const linkHandlers = await page.$x(`//a[contains(text(), ${escapedText})]`)
  
        if (linkHandlers.length > 0) {
            await linkHandlers[0].click();
        } else {
            throw new Error(`Link not found: Submit attendance`)
        }

        await page.waitForSelector('#id_status_3796')
        await page.evaluate(() => {
            const hadir = document.querySelector("#id_status_3796")
            if (!hadir) {
                console.log(color('[ERROR] Kemungkinan anda sudah absen/sudah terlambat', 'red'))
            } else {
                hadir.parentElement.click();
            }
        })
        await page.keyboard.press('Enter')
        console.log(color('[SUKSES] Anda berhasil absen', 'green'))
    }

    async login(username: string, pw: string, url: string): Promise<any> {
        console.log(color('\n[BOT] Initial web browser...', 'yellow'))
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-gpu",
            ]
        })
        const page = await browser.newPage()
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36')
        console.log(color('[BOT] Memuat website...', 'yellow'))

        await page.goto(url, { waitUntil: ['networkidle2'] })
            .then(async() => {
                console.log(color('[BOT] Memasukan username dan password...', 'yellow'))
                await page.type('[type="text"]', username)
                await page.type('[type="password"]', pw)
                await page.keyboard.press('Enter')
                await page.waitFor(5000)
                await this.linkAbsen(page)
                await this.screenshot(page)
                await this.setCookies(page)
            }).catch((err: any) => console.log(color('[ERROR] Tidak dapat memuat web cek internet anda: %s', 'yelow'), color(err, 'red')))
        await browser.close();
    }

    async loginCookie(url): Promise<any> {
        console.log(color('\n[BOT] Initial web browser...', 'yellow'))
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-gpu",
            ]
        });
        const page = await browser.newPage()
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36')
        console.log(color('[BOT] Memuat website dengan Cookies...', 'yellow'))

        if (this.previousSession) {
        // If file exist load the cookies
            const cookiesString: any = fs.readFileSync(this.pathSessions);
            const parsedCookies = JSON.parse(cookiesString);
            if (parsedCookies.length !== 0) {
                for (const cookie of parsedCookies) {
                    await page.setCookie(cookie)
                }
                console.log(color('[SUKSES] Session berhasil di muat, so tidak usah login lagi', 'green'))
            }
        }
        await page.goto(url, { waitUntil: ['networkidle2'] })
            .then(async() => {
                await this.linkAbsen(page)
                await this.screenshot(page)
                await this.setCookies(page)
            }).catch((err: any) => console.log(color('[ERROR] Tidak dapat memuat web cek internet anda: %s', 'yelow'), color(err, 'red')))
        await browser.close();
    }

    async logout(): Promise<any> {
        fs.unlinkSync(this.pathSessions)
    }

    async screenshot(page: puppeteer.Page): Promise<any> {
        console.log(color('[BOT] Memulai menangkap screenshot...', 'yellow'))
        await page.screenshot({encoding: 'binary', type: 'jpeg', quality: 100})
            .then((screenData: any) => {
                const pathFile = path.join(__dirname, '../../screenshot/screenshot.jpg')
                fs.writeFileSync(pathFile, screenData)
                console.log(color('[BOT] Berhasil mengambil screenshot, cek di: %s', 'green'), color(pathFile, 'yellow'))
            }).catch((err: any) => console.log(color('[BOT] Tidak bisa mengambil screenshot karena: %s', 'red'), color(err, 'yellow')))
    }

    async setCookies(page: puppeteer.Page): Promise<any> {
        const cookiesObject = await page.cookies()
        // Write cookies to temp file to be used in other profile pages
        fs.writeFile(this.pathSessions, JSON.stringify(cookiesObject),
            function(err) { 
                if (err) {
                    console.log(color('[ERROR] Tidak bisa membuat file sessions: %s', 'yellow'), color(err, 'red'))
                }
                console.log(color('[BOT] Session sukses di simpan', 'green'))
            })
    }
}