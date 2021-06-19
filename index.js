const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 15

const users = []
const usersCurrentPage = JSON.parse(localStorage.getItem('usersCurrentPages')) || 1
let filteredUsers = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderUserList(data) {
  let rawHTML = ''
  data.forEach(item => {
    console.log(item)
    rawHTML += `<div class="col-sm-auto">
        <div class="card mb-5">
          <div class="card-body">
            <img src="${item.avatar
      }" class="card-img mb-2" alt="avatar"
              data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">
            <p class="card-title">${item.name + "&nbsp;&nbsp;" + item.surname
      }</p>
          </div>
          <div class="card-footer">
            <button class="btn btn-secondary btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  return data.slice(startIndex, endIndex)
}

function showUserModal(id) {
  const userName = document.querySelector('#user-modal-name');
  const userGender = document.querySelector('#user-modal-gender');
  const userAge = document.querySelector('#user-modal-age');
  const userBirthday = document.querySelector('#user-modal-birthday');
  const userRegion = document.querySelector('#user-modal-region');
  const userEmail = document.querySelector('#user-modal-email');
  const userAvatar = document.querySelector('#user-modal-img');

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    userName.innerText = `Name: ` + data.name + data.surname;
    userGender.innerText = `Gender: ` + data.gender;
    userAge.innerText = `Age: ` + data.age;
    userBirthday.innerText = `Birthday: ` + data.birthday;
    userRegion.innerText = `Region: ` + data.region;
    userEmail.innerText = `Email: ` + data.email;
    userAvatar.innerHTML = `<img src="${data.avatar}" alt="avatar" class="avatar-img">`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find(user => user.id === id)
  if (list.some(user => user.id === id)) {
    return alert('已經收藏了，別按了～')
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.card-img')) {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
});

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
  localStorage.setItem('usersCurrentPages', JSON.stringify(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) {
    return alert('咦～你打了什麼？')
  }
  filteredUsers = users.filter((user) => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))
  if (filteredUsers.length === 0) {
    return alert('這個關鍵字：' + keyword + ' 我找不到，要不要換一個試試？')
  }
  renderPaginator(filteredUsers.length)
  renderUserList(getUsersByPage(1))
})

axios.get(INDEX_URL).then((response) => {
  console.log(response)
  users.push(...response.data.results);
  renderPaginator(users.length)
  renderUserList(getUsersByPage(usersCurrentPage));
}).catch((err) => console.log(err))

