const puppeteer = require('puppeteer')
const CREDS = require('./creds')
const upsertUser = require('./utils/users')

  ; (async () => {
    const browser = await puppeteer.launch({
      headless: false //* 启动GUI 界面
    })
    const page = await browser.newPage()

    await page.goto('https://www.github.com/login')

    //* dom元素 Copy > Copy selector
    const USERNAME_SELECTOR = '#login_field'
    const PASSWORD_SELECTOR = '#password'
    const BUTTON_SELECTOR = '#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block'

    //* 自动化执行
    await page.click(USERNAME_SELECTOR)
    await page.type(CREDS.username)
    await page.click(PASSWORD_SELECTOR)
    await page.type(CREDS.password)
    await page.click(BUTTON_SELECTOR)
    await page.waitForNavigation()

    //* 搜索关键字与URL
    const userToSearch = 'john'
    const searchUrl = `https://github.com/search?q=${userToSearch}&type=Users&utf8=%E2%9C%93`

    //* 搜索页跳转
    await page.goto(searchUrl)
    await page.waitFor(2 * 1000)

    //* 目标dom元素 Copy > Copy selector
    const USER_LIST_INFO_SELECTOR = '.user-list-item'
    const USER_LIST_USERNAME_SELECTOR = '.user-list-info>a:nth-child(1)'
    const USER_LIST_EMAIL_SELECTOR = '.user-list-info>.user-list-meta .muted-link'

    //* 计算列表数量
    async function getPageNumbers() {
      const USER_NUMBER_SELECTOR = '#js-pjax-container > div.container > div > div.column.three-fourths.codesearch-results.pr-6 > div.d-flex.flex-justify-between.border-bottom.pb-3 > h3'

      let inner = await page.evaluate(num => (
        document.querySelector(num).innerText
      ), USER_NUMBER_SELECTOR)

      inner = inner.replace(',', '').replace(' users', '')
      const userNumbers = parseInt(inner);

      console.log(userNumbers);

      //* 每页显示10条数据
      const pageNumbers = Math.ceil(userNumbers / 10)
      return pageNumbers
    }

    //* 获取列表数
    const pageNumer = await getPageNumbers()
    console.log('Numpages: ', pageNumer);

    //* 遍历列表，插入到数据库
    let users = []
    for (let i = 1; i <= 20; i++) {
      //* 跳转到指定页面
      await page.goto(`${searchUrl}&p=${i}`)

      users = await page.evaluate((mInfo, mName, mEmail) => {
        return Array.prototype.slice.apply(document.querySelectorAll(mInfo))
          .map($userListItem => {
            console.warn($userListItem, $userListItem.querySelector(mName))
            //* username
            const username = $userListItem.querySelector(mName).innerText
            //* password
            const $email = $userListItem.querySelector(mEmail)
            const email = $email ? $email.innerText : null

            return { username, email }
          })
          .filter(user => !!user.email)
      }, USER_LIST_INFO_SELECTOR, USER_LIST_USERNAME_SELECTOR, USER_LIST_EMAIL_SELECTOR)
        .catch(error => {
          console.warn('error', error)
          browser.close()
        })

      users.map(({ username, email }) => {
        upsertUser({
          username,
          email,
          dateCrawled: new Date()
        })
      })
    }
    await browser.close()
  })()
