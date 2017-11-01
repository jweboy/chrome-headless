const puppeteer = require('puppeteer')
const { taobao: { loginUrl, username, password } } = require('./creds')

  ; (async () => {
    const browser = await puppeteer.launch({
      headless: false //* 启动GUI 界面
    })
    const page = await browser.newPage()

    await page.goto(loginUrl)

    //* get target dom
    const QR_BTN = '.login-tab-r'
    const USERNAME_INPUT = '#loginname'
    const PASSWORD_INPUT = '#nloginpwd'
    const LOGIN_BTN = '#loginsubmit'

    await page.click(QR_BTN)
    await page.click(USERNAME_INPUT)
    await page.type(username)
    await page.click(PASSWORD_INPUT)
    await page.type(password)
    await page.click(LOGIN_BTN)
    await page.waitForNavigation()
  })()
