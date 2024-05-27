const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 15

const users = []
let filteredUsers = []
const favoriteUsers = JSON.parse(localStorage.getItem('favoriteUsers')) || []

const dataPanel = document.querySelector('#data-panel')
const searchBar = document.querySelector('#search-bar')
const searchInput = document.querySelector('#inlineFormInputGroupUsername')
const userModal = document.querySelector('#user-modal')
const paginator = document.querySelector('#paginator')
const loveIcon = document.querySelector('.love-icon')


//函式 取得每個使用者
function renderUserList(data) {
  let rawHTML = ''

  data.forEach(item => {
    if (item.avatar != null) {
      rawHTML += `
      <div class="card btn m-1 mb-3" data-bs-toggle="modal" data-bs-target="#Modal_1"> 
        <img src="${item.avatar}" class="card-img-top" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}" alt="User Card Avatar">
        
        <div class="card-body">
          <h1 class="card-title">${item.name} ${item.surname}</h1>
        </div>

        <div class="love-icon" data-id="${item.id}">♥</div>
      </div>
      `
    }
  })

  dataPanel.innerHTML = rawHTML
}

//函式 取得特定使用者的modal
function showUserModal(id) {
  const userModalName = document.querySelector('#user-modal-name')
  const userModalImage = document.querySelector('#user-modal-image')
  const userModalGender = document.querySelector('#user-modal-gender')
  const userModalAge = document.querySelector('#user-modal-age')
  const userModalRegion = document.querySelector('#user-modal-region')
  const userModalEmail = document.querySelector('#user-modal-email')
  const userModalFooter = document.querySelector('#user-modal-footer')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data
      userModalName.innerHTML = `${data.name} ${data.surname}`
      userModalImage.innerHTML = `<img src="${data.avatar}" alt="movie-poster" class="img-fluid">`
      userModalGender.innerHTML = `<strong>Gender</strong>: ${data.gender}`
      userModalAge.innerHTML = `<strong>Age</strong>: ${data.age}`
      userModalRegion.innerHTML = `<strong>Region</strong>: ${data.region}`
      userModalEmail.innerHTML = `📟 <em>${data.email}</em>`
    })

}

//函式 將使用者加入最愛1.0
// function addToFavorite(id) {
//   const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
//   const favoriteUser = users.find(user => user.id === id)

//   if (list.some(user => user.id === id)) {
//     return alert('❗此使用者已在最愛清單！')
//   }

//   list.push(favoriteUser)
//   localStorage.setItem('favoriteUsers', JSON.stringify(list))
//   return alert('💓已將使用者加入最愛清單！') + renderCounter(list.length)
// }

//函式 將使用者加入最愛2.0
function addToFavorite(id) {
  const favoriteUser = users.find(user => user.id === id)

  if (favoriteUsers.some(user => user.id === id)) return

  favoriteUsers.push(favoriteUser)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers))
  localStorage.setItem(`loveIcon_${id}`, 'true')
  renderLoveIcon()
}

//函式 移除最愛使用者2.0
function removeFromFavorite(id) {
  const favoriteUsersIndex = favoriteUsers.findIndex(favoriteUser => favoriteUser.id === id)

  if (favoriteUsersIndex === -1) return

  favoriteUsers.splice(favoriteUsersIndex, 1)

  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUsers))
  localStorage.removeItem(`loveIcon_${id}`)
  renderLoveIcon()
}

//函式 渲染愛心符號
function renderLoveIcon() {
  //querySelectorAll會回傳陣列
  const loveIcons = document.querySelectorAll('.love-icon')

  //這裡卡關很久!${loveIcon.dataset.id}不能寫${id}因為這個函式沒有參數
  loveIcons.forEach(loveIcon => {
    if (localStorage.getItem(`loveIcon_${loveIcon.dataset.id}`) === 'true') {
      loveIcon.classList.add('active')
    }
  })
}

//函式 每頁顯示數量(15)
function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  //0,1,2,...,14
  //15,16,...,29
  //30,...,44
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

//函式 分頁器
function renderPaginator(amount) {
  const numberofPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberofPages; page++) {
    rawHTML += `
  <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
  `
  }

  paginator.innerHTML = rawHTML
}

//函式 最愛清單計數器
function renderCounter(amount) {
  let rawHTML = ''

  rawHTML += `<a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">${amount}</a>`

  counter.innerHTML = rawHTML
}

//呼叫取得每個使用者並渲染
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results)
    renderUserList(getUsersByPage(1))
    renderPaginator(users.length)
    renderLoveIcon()
  })
  .catch((erro) => console.log(erro))

//監聽器 點擊avatar彈出modal 
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.card-img-top')) {
    showUserModal(Number(event.target.dataset.id))
  }
})

//監聽器 1.點擊愛心加入最愛 2.再次點擊取消最愛
dataPanel.addEventListener('click', function onLoveIconClick(event) {
  if (event.target.matches('.love-icon')) {

    event.target.classList.toggle('active')

    if (event.target.classList.contains('active')) {
      addToFavorite(Number(event.target.dataset.id))
      renderLoveIcon()
    } else {
      removeFromFavorite(Number(event.target.dataset.id))
      renderLoveIcon()
    }
  }

  renderCounter(favoriteUsers.length)
})

//監聽器 modal愛心
// userModal.addEventListener('click', function onModalFooterBtnClick(event) {
//   if (event.target.matches('.btn-add-favorite')) {
//     addToFavorite(Number(event.target.dataset.id))
//   }
// })

//監聽器 搜尋功能
// searchBar.addEventListener('submit', function onSearchBarSubmitted(event) {
//   event.preventDefault()
//   const keyword = searchInput.value.trim().toLowerCase()

//   filteredUsers = users.filter(user =>
//     user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
//   )

//   if (!filteredUsers.length) {
//     return alert('👀使用者資料不存在')
//   }

//   renderUserList(getUsersByPage(1))
//   renderPaginator(filteredUsers.length)
// })

//監聽器 搜尋功能(隨字更新)
searchBar.addEventListener('input', function onSearchBarSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )

  //當輸入的文字不符合所有資料，回傳空的畫面(這是我自己想出來的 我好棒)
  if (filteredUsers.length === 0) {
    return renderUserList([]) + renderPaginator(0)

  }

  renderUserList(getUsersByPage(1))
  renderPaginator(filteredUsers.length)
  renderLoveIcon()
  renderCounter(favoriteUsers.length)
})

//監聽器 分頁器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))

  //點擊分頁後，當前頁面啟用狀態.active
  const activeItem = document.querySelector('#paginator .active')
  if (activeItem) {
    activeItem.classList.remove('active')
  }
  event.target.classList.add('active')

  renderLoveIcon()
  renderCounter(favoriteUsers.length)
})

//渲染 計數器
renderCounter(favoriteUsers.length)

