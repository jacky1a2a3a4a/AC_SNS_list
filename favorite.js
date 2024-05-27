const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 15

const users = JSON.parse(localStorage.getItem('favoriteUsers')) || []

const dataPanel = document.querySelector('#data-panel')
const searchBar = document.querySelector('#search-bar')
const searchInput = document.querySelector('#inlineFormInputGroupUsername')
const userModal = document.querySelector('#user-modal')
const paginator = document.querySelector('#paginator')
const counter = document.querySelector('#counter')


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

        <div class="card-footer">
          <button type="button" class="btn btn-sm btn-remove-favorite" data-id="${item.id}">&thinsp;X&thinsp;</button>
        </div>
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

//函式 移除最愛使用者
function removeFromFavorite(id) {
  const usersIndex = users.findIndex(user => user.id === id)
  if (usersIndex === -1) return
  users.splice(usersIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  localStorage.removeItem(`loveIcon_${id}`) //一開始沒寫到，在最愛清單移除卡片後，返回頁面還會有愛心
  renderUserList(users)
  renderCounter(users.length)
}

//函式 每頁顯示數量(15)
function getUsersByPage(page) {
  //0,1,2,...,14
  //15,16,...,29
  //30,...,44
  const startIndex = (page - 1) * USERS_PER_PAGE
  return users.slice(startIndex, startIndex + USERS_PER_PAGE)
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
function renderCounter(amount){
  let rawHTML =''

  rawHTML += `<a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">${amount}</a>`

  counter.innerHTML = rawHTML
}

//監聽器 1.avatar圖片 2.xx按鈕
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.card-img-top')) {
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    event.preventDefault()
    removeFromFavorite(Number(event.target.dataset.id))
  }
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
})


//渲染最愛使用者清單
renderUserList(getUsersByPage(1))

//渲染分頁器
renderPaginator(users.length)

//渲染計數器
renderCounter(users.length)